import { useState, useRef, useEffect, useCallback, type RefObject } from 'react';
import { View, Share } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { captureAndShareView } from '@/utils/captureAndShare';
import BottomSheet from '@gorhom/bottom-sheet';
import { Badge, Tier, HistoryItemData } from './components';
import { getCurrentUser } from '@/lib/auth';
import { getNavigationRef } from '@/lib/notifications/handlers';
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

interface UsePromotionsScreenOptions {
  contentRef?: RefObject<View | null>;
}

export const usePromotionsScreen = (options: UsePromotionsScreenOptions = {}) => {
  const { contentRef } = options;
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('inProgress');
  const referFriendBottomSheetRef = useRef<BottomSheet>(null);
  const referFriendSuccessBottomSheetRef = useRef<BottomSheet>(null);
  const [achievementModalVisible, setAchievementModalVisible] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [selectedPoints, setSelectedPoints] = useState<number>(100);
  const [nextTierRequiredPoints, setNextTierRequiredPoints] = useState<number | undefined>(undefined);
  
  // State for live data
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [eventCheckInsCount, setEventCheckInsCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [historyItems, setHistoryItems] = useState<HistoryItemData[]>([]);
  const [tiersData, setTiersData] = useState<TierRow[]>([]);
  const [isAmbassador, setIsAmbassador] = useState(false);
  const [isInfluencer, setIsInfluencer] = useState(false);
  
  // Fetch user statistics and history on mount and when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setIsLoading(true);
      }
      
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
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadUserData(true);
  };

  const buildHistoryItems = async (
    checkIns: CheckInRow[],
    reviews: ReviewRow[]
  ): Promise<HistoryItemData[]> => {
    if (checkIns.length === 0 && reviews.length === 0) {
      return [];
    }

    // Extract unique event IDs from both sources so we can render history
    // even if a user only reviewed (or if check-ins and reviews are out of sync).
    const uniqueEventIds = [
      ...new Set([
        ...checkIns.map(checkIn => checkIn.eventID),
        ...reviews.map(review => (typeof review.event === 'string' ? review.event : (review.event as any)?.$id)),
      ].filter(Boolean)),
    ];

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

    const reviewByEventId = new Map<string, ReviewRow[]>();
    for (const review of reviews) {
      const eventId =
        typeof review.event === 'string' ? review.event : (review.event as any)?.$id;
      if (!eventId) continue;
      const list = reviewByEventId.get(eventId) ?? [];
      list.push(review);
      reviewByEventId.set(eventId, list);
    }

    const checkInEventIds = new Set(checkIns.map(c => c.eventID));

    // Build history items using the event map.
    // Important: if the event no longer exists (deleted from admin),
    // we still show the history row with a fallback label.
    const items: { item: HistoryItemData; timestamp: number }[] = [];
    
    for (const checkIn of checkIns) {
      const event = eventMap.get(checkIn.eventID);

      const reviewsForEvent = reviewByEventId.get(checkIn.eventID) ?? [];
      const reviewForEvent = reviewsForEvent[0];
      const timestamp = new Date(checkIn.$createdAt).getTime();

      items.push({
        item: {
          id: checkIn.$id,
          eventId: checkIn.eventID,
          brandProduct: event?.client?.name || 'Deleted event',
          storeName: event?.name || 'Deleted event',
          date: new Date(checkIn.$createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          points: checkIn.pointsEarned + (reviewForEvent?.pointsEarned || 0),
          review: reviewForEvent?.review,
          brandPhotoURL: event?.client?.logoURL || null,
        },
        timestamp,
      });
    }

    // Add review-only entries (when a review exists but no check-in row is present)
    for (const review of reviews) {
      const eventId =
        typeof review.event === 'string' ? review.event : (review.event as any)?.$id;
      if (!eventId) continue;
      if (checkInEventIds.has(eventId)) continue;

      const event = eventMap.get(eventId);
      const timestamp = new Date(review.$createdAt).getTime();

      items.push({
        item: {
          id: review.$id,
          eventId,
          brandProduct: event?.client?.name || 'Deleted event',
          storeName: event?.name || 'Deleted event',
          date: new Date(review.$createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          points: review.pointsEarned || 0,
          review: review.review,
          brandPhotoURL: event?.client?.logoURL || null,
        },
        timestamp,
      });
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
      const message = `I've earned ${totalPoints} points, ${earnedBadges} badges, and ${earnedTiers} tiers on SampleFinder! Join me in discovering amazing samples and earning rewards.`;
      if (contentRef?.current) {
        await captureAndShareView(contentRef, message);
      } else {
        await Share.share({ message });
      }
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
    
    // Find the next tier's required points
    const currentTierIndex = tiers.findIndex(t => t.id === tier.id);
    const nextTier = currentTierIndex >= 0 && currentTierIndex < tiers.length - 1 
      ? tiers[currentTierIndex + 1] 
      : null;
    setNextTierRequiredPoints(nextTier?.requiredPoints);
    
    setAchievementModalVisible(true);
  };

  const handlePointsPress = (points: number, tier?: Tier) => {
    setSelectedTier(tier || null);
    setSelectedPoints(points);
    
    // Find the next tier's required points
    if (tier) {
      const currentTierIndex = tiers.findIndex(t => t.id === tier.id);
      const nextTier = currentTierIndex >= 0 && currentTierIndex < tiers.length - 1 
        ? tiers[currentTierIndex + 1] 
        : null;
      setNextTierRequiredPoints(nextTier?.requiredPoints);
    } else {
      setNextTierRequiredPoints(undefined);
    }
    
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

  const handleViewMoreEvents = () => {
    // Navigate to Home tab
    (navigation as any).navigate('Home');
  };

  const handleHistoryEventPress = (eventId: string) => {
    // Navigate to BrandDetails in HomeStack through root navigator
    // Since PromotionsScreen is directly in TabNavigator, we use the root navigation ref
    const rootNav = getNavigationRef();
    if (rootNav) {
      // Navigate through MainTabs -> Home -> BrandDetails (same pattern as notification handlers)
      (rootNav as any).navigate('MainTabs', {
        screen: 'Home',
        params: {
          screen: 'BrandDetails',
          params: { eventId },
        },
      });
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
  const tiers: Tier[] = tiersData.map((tier) => {
    // Remove mode=admin from URL to allow public access
    const cleanImageURL = tier.imageURL?.replace('&mode=admin', '') ?? null;
    
    return {
      id: tier.$id,
      name: tier.name,
      currentPoints: Math.min(totalPoints, tier.requiredPoints),
      requiredPoints: tier.requiredPoints,
      badgeEarned: totalPoints >= tier.requiredPoints,
      imageURL: cleanImageURL,
      order: tier.order,
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
    nextTierRequiredPoints,
    achievementModalVisible,
    referFriendBottomSheetRef,
    referFriendSuccessBottomSheetRef,
    isLoading,
    isRefreshing,
    totalPoints,
    isAmbassador,
    isInfluencer,
    handleRefresh,
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
    handleViewMoreEvents,
    handleHistoryEventPress,
  };
};

