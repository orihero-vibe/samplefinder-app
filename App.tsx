import { useEffect, useState, useCallback, useRef } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import {
  Quicksand_300Light,
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from '@expo-google-fonts/quicksand';
import { 
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
} from '@expo-google-fonts/poppins';
import { PlusJakartaSans_800ExtraBold} from '@expo-google-fonts/plus-jakarta-sans'
import AppNavigator from '@/navigation/AppNavigator';
import { TriviaModal } from '@/components/trivia';
import type { TriviaQuestion } from '@/lib/database/trivia';
import { getActiveTrivia, submitTriviaAnswer, dismissTrivia, fetchTiers, getUserProfile } from '@/lib/database';
import { setupTokenRefreshListener, initializePushNotifications, cleanupPastEventReminders } from '@/lib/notifications';
import { getCurrentUser } from '@/lib/auth';
import { CustomSplashScreen } from '@/components';
import { useCalendarEventsStore } from '@/stores/calendarEventsStore';
import { useTier1ModalStore } from '@/stores/tier1ModalStore';
import { useTierCompletionStore } from '@/stores/tierCompletionStore';
import { AchievementModal } from '@/screens/tabs/promotions/components';
import type { Tier } from '@/screens/tabs/promotions/components';
import { Share } from 'react-native';
import { getUserCurrentTier } from '@/lib/database/tiers';
import './reactotron';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showTrivia, setShowTrivia] = useState(false);
  /** Queue of unanswered trivia (all favorite brands); show one at a time until empty */
  const [triviaQueue, setTriviaQueue] = useState<TriviaQuestion[]>([]);
  const [userProfileId, setUserProfileId] = useState<string | null>(null);
  const triviaShownRef = useRef(false);
  const currentTriviaRef = useRef<TriviaQuestion | null>(null);
  const currentQuestion = triviaQueue[0] ?? null;
  currentTriviaRef.current = currentQuestion;

  const shouldShowTier1Modal = useTier1ModalStore((s) => s.shouldShowTier1Modal);
  const setShouldShowTier1Modal = useTier1ModalStore((s) => s.setShouldShowTier1Modal);
  const [tier1ModalVisible, setTier1ModalVisible] = useState(false);
  const [tier1Tier, setTier1Tier] = useState<Tier | null>(null);

  // Global tier completion modal state
  const shouldShowTierModal = useTierCompletionStore((s) => s.shouldShowTierModal);
  const completedTier = useTierCompletionStore((s) => s.completedTier);
  const pointsEarned = useTierCompletionStore((s) => s.pointsEarned);
  const clearTierCompletion = useTierCompletionStore((s) => s.clearTierCompletion);

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts
        await Font.loadAsync({
          Quicksand_300Light,
          Quicksand_400Regular,
          Quicksand_500Medium,
          Quicksand_600SemiBold,
          Quicksand_700Bold,
          Poppins_400Regular,
          Poppins_500Medium,
          Poppins_600SemiBold,
          Poppins_700Bold,
          Poppins_800ExtraBold,
          Poppins_900Black,
          PlusJakartaSans_800ExtraBold
        });

        // Set up push notification token refresh listener
        setupTokenRefreshListener();

        // Initialize push notifications if user is logged in
        try {
          const user = await getCurrentUser();
          if (user) {
            initializePushNotifications().catch((error) => {
              console.warn('[App] Failed to initialize push notifications:', error);
            });

            // Get user profile ID for trivia
            try {
              const profile = await getUserProfile(user.$id);
              if (profile) {
                setUserProfileId(profile.$id);
              }
            } catch (profileError) {
              console.warn('[App] Failed to get user profile:', profileError);
            }

            // Sync calendar events store with user profile
            try {
              await useCalendarEventsStore.getState().syncWithUserProfile();
            } catch (syncError) {
              console.warn('[App] Failed to sync calendar events:', syncError);
            }

            // Cleanup past event reminders (remove notifications for events that have passed)
            try {
              await cleanupPastEventReminders();
            } catch (cleanupError) {
              console.warn('[App] Failed to cleanup past event reminders:', cleanupError);
            }
          }
        } catch (error) {
          // User not logged in
        }

        // Keep splash screen visible for at least 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Fetch active trivia 5 seconds after app is ready (only once per session)
  // Fetches profile in effect to avoid race with auth session restoration
  useEffect(() => {
    if (!appIsReady || triviaShownRef.current) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const user = await getCurrentUser();
        if (cancelled || !user) return;

        const profile = await getUserProfile(user.$id);
        if (cancelled || !profile) return;

        setUserProfileId(profile.$id); // for submit handler
        const triviaQuestions = await getActiveTrivia(profile.$id);
        if (cancelled) return;

        if (triviaQuestions.length > 0) {
          setTriviaQueue(triviaQuestions);
          setShowTrivia(true);
          triviaShownRef.current = true;
        }
      } catch (error) {
        if (!cancelled) console.error('[App] Failed to fetch trivia:', error);
      }
    }, 5000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [appIsReady]);

  // Hide trivia modal when queue is exhausted (user closed last question)
  useEffect(() => {
    if (triviaQueue.length === 0) {
      setShowTrivia(false);
    }
  }, [triviaQueue.length]);

  // Show Tier 1 modal for newly signed up users (after email verification)
  useEffect(() => {
    if (!shouldShowTier1Modal || !appIsReady) return;

    let cancelled = false;
    const loadAndShowTier1Modal = async () => {
      try {
        const user = await getCurrentUser();
        if (cancelled || !user) return;

        const [profile, tiers] = await Promise.all([
          getUserProfile(user.$id),
          fetchTiers(),
        ]);
        if (cancelled || !profile || !tiers.length) return;

        const tier1Row = tiers.find((t) => t.order === 1) ?? tiers[0];
        const cleanImageURL = tier1Row.imageURL?.replace('&mode=admin', '') ?? null;

        // Tier 1 welcome is always "earned" (Thanks for Joining! / Share), not progress state
        const tier1: Tier = {
          id: tier1Row.$id,
          name: tier1Row.name,
          currentPoints: tier1Row.requiredPoints,
          requiredPoints: tier1Row.requiredPoints,
          badgeEarned: true,
          imageURL: cleanImageURL,
          order: tier1Row.order,
        };

        if (!cancelled) {
          setTier1Tier(tier1);
          setTier1ModalVisible(true);
        }
      } catch (error) {
        if (!cancelled) console.error('[App] Failed to load Tier 1 modal data:', error);
      }
    };

    loadAndShowTier1Modal();
    return () => {
      cancelled = true;
    };
  }, [shouldShowTier1Modal, appIsReady]);

  const handleCloseTier1Modal = () => {
    setTier1ModalVisible(false);
    setTier1Tier(null);
    setShouldShowTier1Modal(false);
  };

  const handleShareTier1 = async () => {
    try {
      if (tier1Tier) {
        await Share.share({
          message: `I just earned the ${tier1Tier.name} tier on SampleFinder! Join me in discovering amazing samples and earning rewards.`,
        });
      }
      handleCloseTier1Modal();
    } catch (error) {
      console.error('[App] Error sharing achievement:', error);
      handleCloseTier1Modal();
    }
  };

  const handleCloseTierCompletionModal = () => {
    clearTierCompletion();
  };

  const handleShareTierCompletion = async () => {
    try {
      if (completedTier) {
        await Share.share({
          message: `I just earned the ${completedTier.name} tier on SampleFinder! Join me in discovering amazing samples and earning rewards.`,
        });
      }
      handleCloseTierCompletionModal();
    } catch (error) {
      console.error('[App] Error sharing tier completion:', error);
      handleCloseTierCompletionModal();
    }
  };

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return <CustomSplashScreen />;
  }

  const handleTriviaClose = () => {
    setTriviaQueue((prev) => prev.slice(1));
  };

  const handleSubmitAnswer = async (answerIndex: number) => {
    const question = currentTriviaRef.current;
    if (!userProfileId || !question) {
      return {
        success: false,
        error: 'User profile or trivia question not available',
      };
    }

    return submitTriviaAnswer(userProfileId, question.$id, answerIndex);
  };

  const handleAnswerResult = async (isCorrect: boolean, pointsAwarded: number) => {
    // Check for tier completion after earning points from trivia
    if (isCorrect && pointsAwarded > 0 && userProfileId) {
      try {
        const [profile, tiers] = await Promise.all([
          getUserProfile(userProfileId),
          fetchTiers(),
        ]);

        if (!profile || !tiers.length) return;

        const newTotalPoints = profile.totalPoints || 0;
        const oldTotalPoints = newTotalPoints - pointsAwarded;
        
        const oldTier = getUserCurrentTier(tiers, oldTotalPoints);
        const newTier = getUserCurrentTier(tiers, newTotalPoints);

        // If tier changed, show the achievement modal
        if (newTier && oldTier && newTier.$id !== oldTier.$id) {
          const cleanImageURL = newTier.imageURL?.replace('&mode=admin', '') ?? null;
          const tierForModal: Tier = {
            id: newTier.$id,
            name: newTier.name,
            currentPoints: Math.min(newTotalPoints, newTier.requiredPoints),
            requiredPoints: newTier.requiredPoints,
            badgeEarned: newTotalPoints >= newTier.requiredPoints,
            imageURL: cleanImageURL,
            order: newTier.order,
          };

          useTierCompletionStore.getState().setTierCompleted(
            tierForModal,
            pointsAwarded,
            'trivia'
          );
        }
      } catch (error) {
        console.error('[App] Failed to check tier completion after trivia:', error);
      }
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <AppNavigator />
          {currentQuestion && (
            <TriviaModal
              key={currentQuestion.$id}
              visible={showTrivia}
              question={currentQuestion}
              onClose={handleTriviaClose}
              onSubmitAnswer={handleSubmitAnswer}
              onAnswerResult={handleAnswerResult}
              onSkipped={() => {
                const q = currentTriviaRef.current;
                if (userProfileId && q) {
                  dismissTrivia(userProfileId, q.$id);
                }
              }}
            />
          )}
          <AchievementModal
            visible={tier1ModalVisible}
            tier={tier1Tier}
            points={100}
            onClose={handleCloseTier1Modal}
            onShare={handleShareTier1}
          />
          <AchievementModal
            visible={shouldShowTierModal}
            tier={completedTier}
            points={pointsEarned}
            onClose={handleCloseTierCompletionModal}
            onShare={handleShareTierCompletion}
          />
        </View>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
