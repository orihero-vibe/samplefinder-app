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
  shareContentRef?: RefObject<View | null>;
}

export const usePromotionsScreen = (options: UsePromotionsScreenOptions = {}) => {
  const { contentRef, shareContentRef } = options;
  const appDownloadLink = 'https://samplefinder.com';
  const profileShareMessage = `Check out my Profile on the SampleFinder app! Make your own profile: ${appDownloadLink}`;
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
  // Used for tier progress UI only (keeps progress consistent with tierLevel overrides)
  const [pointsForProgress, setPointsForProgress] = useState(0);
  // Canonical tier rank derived from `userProfile.tierLevel` (when available)
  const [canonicalTierOrder, setCanonicalTierOrder] = useState<number | null>(null);
  const [eventCheckInsCount, setEventCheckInsCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [historyItems, setHistoryItems] = useState<HistoryItemData[]>([]);
  const [tiersData, setTiersData] = useState<TierRow[]>([]);
  const [isAmbassador, setIsAmbassador] = useState(false);
  const [isInfluencer, setIsInfluencer] = useState(false);

  const normalizeTierKey = (value: string) =>
    value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  const resolveCanonicalTier = (tiers: TierRow[], tierLevelValue: string): TierRow | null => {
    if (!tierLevelValue) return null;

    const normalizedValue = normalizeTierKey(tierLevelValue);
    if (!normalizedValue) return null;

    // 1) Exact-ish name match (case/spacing/punctuation insensitive)
    const byName = tiers.find((tier) => normalizeTierKey(tier.name ?? '') === normalizedValue);
    if (byName) return byName;

    // 2) Numeric match for values like "2", "tier 2", "level 2"
    const tierNumberMatch = tierLevelValue.match(/\d+/);
    if (tierNumberMatch) {
      const tierOrder = Number.parseInt(tierNumberMatch[0], 10);
      if (Number.isFinite(tierOrder)) {
        const byOrder = tiers.find((tier) => (tier.order ?? 0) === tierOrder);
        if (byOrder) return byOrder;
      }
    }

    return null;
  };
  
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

      const rawTotalPoints = userProfile.totalPoints ?? 0;
      const profileTierLevel = userProfile.tierLevel?.trim() ?? '';

      // If admin manually updated tierLevel, treat it as the canonical truth for "earned" tier state.
      const canonicalTier = resolveCanonicalTier(tiers, profileTierLevel);

      // Canonical tier order drives which tier is shown as "earned".
      // Progress bars should always reflect the user's real points (no clamping).
      const derivedCanonicalTierOrder: number | null = canonicalTier ? canonicalTier.order : null;

      // Set data from profile and fetched arrays (avoid redundant API calls)
      setTiersData(tiers);
      setIsAmbassador(userProfile.isAmbassador || false);
      setIsInfluencer(userProfile.isInfluencer || false);
      setCanonicalTierOrder(derivedCanonicalTierOrder);
      setTotalPoints(rawTotalPoints);
      setPointsForProgress(rawTotalPoints);
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
      const message = profileShareMessage;
      if (shareContentRef?.current) {
        try {
          await captureAndShareView(shareContentRef, message, { useRenderInContext: true });
          return;
        } catch (e) {
          console.warn('[Achievements] Full-content share capture failed, falling back to viewport capture.', e);
        }
      }
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
      await Share.share({
        message: profileShareMessage,
      });
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

    const earnedByTierLevel =
      canonicalTierOrder !== null ? (tier.order ?? 0) <= canonicalTierOrder : null;

    const badgeEarned =
      earnedByTierLevel !== null
        ? earnedByTierLevel
        : pointsForProgress >= tier.requiredPoints;
    
    return {
      id: tier.$id,
      name: tier.name,
      // If the tier is marked as achieved via admin `tierLevel`,
      // show the tier as completed (100%) even if real points are lower.
      currentPoints: badgeEarned ? tier.requiredPoints : Math.min(pointsForProgress, tier.requiredPoints),
      requiredPoints: tier.requiredPoints,
      badgeEarned,
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
    pointsForProgress,
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

