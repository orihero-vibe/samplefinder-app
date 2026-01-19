import { useState, useRef, useEffect } from 'react';
import { Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BottomSheet from '@gorhom/bottom-sheet';
import { Badge, Tier, HistoryItemData } from './components';
import { getCurrentUser } from '@/lib/auth';
import { 
  getUserCheckIns,
  getUserReviews,
  fetchEventById,
  getUserProfile,
  fetchTiers,
  CheckInRow,
  ReviewRow,
  TierRow,
} from '@/lib/database';

export type TabType = 'inProgress' | 'earned';

export const usePromotionsScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('inProgress');
  const referFriendBottomSheetRef = useRef<BottomSheet>(null);
  const referFriendSuccessBottomSheetRef = useRef<BottomSheet>(null);
  const [achievementModalVisible, setAchievementModalVisible] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [selectedPoints, setSelectedPoints] = useState<number>(100);
  
  // State for live data
  const [isLoading, setIsLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [eventCheckInsCount, setEventCheckInsCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [historyItems, setHistoryItems] = useState<HistoryItemData[]>([]);
  const [tiersData, setTiersData] = useState<TierRow[]>([]);
  const [isAmbassador, setIsAmbassador] = useState(false);
  const [isInfluencer, setIsInfluencer] = useState(false);
  
  // Fetch user statistics and history on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      const authUser = await getCurrentUser();
      
      if (!authUser) {
        setIsLoading(false);
        return;
      }

      const userProfile = await getUserProfile(authUser.$id);
      if (!userProfile) {
        setIsLoading(false);
        return;
      }

      // Fetch tiers, check-ins, and reviews in parallel for better performance
      const [tiers, checkIns, reviews] = await Promise.all([
        fetchTiers(),
        getUserCheckIns(userProfile.$id),
        getUserReviews(userProfile.$id),
      ]);

      // Set data from profile and fetched arrays (avoid redundant API calls)
      setTiersData(tiers);
      setIsAmbassador(userProfile.isAmbassador || false);
      setIsInfluencer(userProfile.isInfluencer || false);
      setTotalPoints(userProfile.totalPoints || 0);
      setEventCheckInsCount(checkIns.length);
      setReviewsCount(reviews.length);

      // Build history items (now optimized with parallel event fetching)
      const history = await buildHistoryItems(checkIns, reviews);
      setHistoryItems(history);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const buildHistoryItems = async (
    checkIns: CheckInRow[],
    reviews: ReviewRow[]
  ): Promise<HistoryItemData[]> => {
    // Early return if no check-ins
    if (checkIns.length === 0) {
      return [];
    }

    // Extract unique event IDs
    const uniqueEventIds = [...new Set(checkIns.map(checkIn => checkIn.eventID))];

    // Fetch all events in parallel instead of sequentially
    const eventPromises = uniqueEventIds.map(eventId => 
      fetchEventById(eventId).catch(error => {
        console.error(`Error fetching event ${eventId}:`, error);
        return null;
      })
    );

    const events = await Promise.all(eventPromises);

    // Create a map for quick event lookup
    const eventMap = new Map(
      events
        .filter(event => event !== null)
        .map(event => [event!.$id, event!])
    );

    // Build history items using the event map
    const items: { item: HistoryItemData; timestamp: number }[] = [];
    
    for (const checkIn of checkIns) {
      const event = eventMap.get(checkIn.eventID);
      
      if (event) {
        const reviewForEvent = reviews.find(r => r.event === checkIn.eventID);
        const timestamp = new Date(checkIn.$createdAt).getTime();
        
        items.push({
          item: {
            id: checkIn.$id,
            brandProduct: event.name || 'Event',
            storeName: event.address || 'Store',
            date: new Date(checkIn.$createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            points: checkIn.pointsEarned + (reviewForEvent?.pointsEarned || 0),
            review: reviewForEvent?.review,
            brandPhotoURL: event.client?.logoURL || null,
          },
          timestamp,
        });
      }
    }

    // Sort by timestamp (newest first) then extract just the items
    items.sort((a, b) => b.timestamp - a.timestamp);
    return items.map(({ item }) => item);
  };

  const handleBackPress = () => {
    // Navigate back to Home tab
    navigation.goBack();
  };

  const handleSharePress = async () => {
    try {
      const earnedBadges = [...eventBadges, ...reviewBadges].filter(badge => badge.achieved).length;
      const earnedTiers = tiers.filter(tier => tier.badgeEarned).length;
      
      await Share.share({
        message: `I've earned ${totalPoints} points, ${earnedBadges} badges, and ${earnedTiers} tiers on SampleFinder! Join me in discovering amazing samples and earning rewards.`,
      });
    } catch (error) {
      console.error('Error sharing achievements:', error);
    }
  };

  const handleCloseReferFriend = () => {
    referFriendBottomSheetRef.current?.close();
  };

  const handleReferSuccess = () => {
    referFriendSuccessBottomSheetRef.current?.expand();
  };

  const handleCloseReferSuccess = () => {
    referFriendSuccessBottomSheetRef.current?.close();
  };

  const handleViewRewards = () => {
    // Already on Promotions screen, just close the modal
    handleCloseReferSuccess();
  };

  const handleTierPress = (tier: Tier, points: number) => {
    setSelectedTier(tier);
    setSelectedPoints(points);
    setAchievementModalVisible(true);
  };

  const handlePointsPress = (points: number, tier?: Tier) => {
    setSelectedTier(tier || null);
    setSelectedPoints(points);
    setAchievementModalVisible(true);
  };

  const handleCloseAchievementModal = () => {
    setAchievementModalVisible(false);
    setSelectedTier(null);
  };

  const handleShareAchievement = async () => {
    try {
      if (selectedTier) {
        await Share.share({
          message: `I just earned the ${selectedTier.name} tier on SampleFinder! Join me in discovering amazing samples and earning rewards.`,
        });
      } else {
        await Share.share({
          message: `I just earned ${selectedPoints} points on SampleFinder! Join me in discovering amazing samples and earning rewards.`,
        });
      }
    } catch (error) {
      console.error('Error sharing achievement:', error);
    }
  };

  const eventBadges: Badge[] = [
    { id: '1', label: 'EVENTS', achieved: eventCheckInsCount >= 10, count: 10 },
    { id: '2', label: 'EVENTS', achieved: eventCheckInsCount >= 25, count: 25 },
    { id: '3', label: 'EVENTS', achieved: eventCheckInsCount >= 50, count: 50 },
    { id: '4', label: 'EVENTS', achieved: eventCheckInsCount >= 100, count: 100 },
    { id: '5', label: 'EVENTS', achieved: eventCheckInsCount >= 250, count: 250 },
  ];

  const reviewBadges: Badge[] = [
    { id: '1', label: 'REVIEWS', achieved: reviewsCount >= 10, count: 10 },
    { id: '2', label: 'REVIEWS', achieved: reviewsCount >= 25, count: 25 },
    { id: '3', label: 'REVIEWS', achieved: reviewsCount >= 50, count: 50 },
    { id: '4', label: 'REVIEWS', achieved: reviewsCount >= 100, count: 100 },
    { id: '5', label: 'REVIEWS', achieved: reviewsCount >= 250, count: 250 },
  ];

  // Map Appwrite tiers to UI Tier format
  const tiers: Tier[] = tiersData.map((tier, index) => {
    const prevTierPoints = index > 0 ? tiersData[index - 1].requiredPoints : 0;
    const pointsInTier = Math.max(0, totalPoints - prevTierPoints);
    const tierRange = tier.requiredPoints - prevTierPoints;
    
    // Remove mode=admin from URL to allow public access
    const cleanImageURL = tier.imageURL?.replace('&mode=admin', '') ?? null;
    
    return {
      id: tier.$id,
      name: tier.name,
      currentPoints: totalPoints >= tier.requiredPoints 
        ? tierRange 
        : Math.min(pointsInTier, tierRange),
      requiredPoints: tierRange,
      badgeEarned: totalPoints >= tier.requiredPoints,
      imageURL: cleanImageURL,
    };
  });

  return {
    activeTab,
    eventBadges,
    reviewBadges,
    tiers,
    eventCheckIns: eventCheckInsCount,
    reviews: reviewsCount,
    historyItems,
    selectedTier,
    selectedPoints,
    achievementModalVisible,
    referFriendBottomSheetRef,
    referFriendSuccessBottomSheetRef,
    isLoading,
    totalPoints,
    isAmbassador,
    isInfluencer,
    setActiveTab,
    handleBackPress,
    handleSharePress,
    handleCloseReferFriend,
    handleReferSuccess,
    handleCloseReferSuccess,
    handleViewRewards,
    handleTierPress,
    handlePointsPress,
    handleCloseAchievementModal,
    handleShareAchievement,
  };
};

