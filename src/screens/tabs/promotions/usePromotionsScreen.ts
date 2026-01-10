import { useState, useRef, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import BottomSheet from '@gorhom/bottom-sheet';
import { Badge, Tier, HistoryItemData } from './components';
import { getCurrentUser } from '@/lib/auth';
import { 
  getUserStatistics,
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
  
  // Fetch user statistics and history on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch tiers first (doesn't require auth)
      const tiers = await fetchTiers();
      console.log('[usePromotionsScreen] Tiers fetched:', JSON.stringify(tiers, null, 2));
      setTiersData(tiers);
      
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

      const stats = await getUserStatistics(authUser.$id);
      setTotalPoints(stats.totalPoints);
      setEventCheckInsCount(stats.eventCheckIns);
      setReviewsCount(stats.samplingReviews);

      const [checkIns, reviews] = await Promise.all([
        getUserCheckIns(userProfile.$id),
        getUserReviews(userProfile.$id),
      ]);

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
    const items: HistoryItemData[] = [];

    for (const checkIn of checkIns) {
      try {
        const event = await fetchEventById(checkIn.eventID);
        if (event) {
          const reviewForEvent = reviews.find(r => r.event === checkIn.eventID);
          
          items.push({
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
          });
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      }
    }

    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return items;
  };

  const handleBackPress = () => {
    // Navigate back to Home tab
    navigation.goBack();
  };

  const handleSharePress = () => {
    console.log('Share pressed');
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

  const handleShareAchievement = () => {
    console.log('Share achievement:', selectedTier?.name, selectedPoints);
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

