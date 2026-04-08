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
import { PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans'
import AppNavigator from '@/navigation/AppNavigator';
import { TriviaModal } from '@/components/trivia';
import type { TriviaQuestion } from '@/lib/database/trivia';
import { getActiveTrivia, submitTriviaAnswer, dismissTrivia, fetchTiers, getUserProfile } from '@/lib/database';
import { setupTokenRefreshListener, initializePushNotifications } from '@/lib/notifications';
import { useAuthStore } from '@/stores/authStore';
import { createUserNotification } from '@/lib/database';
import { CustomSplashScreen } from '@/components';
import { useCalendarEventsStore } from '@/stores/calendarEventsStore';
import { useTier1ModalStore } from '@/stores/tier1ModalStore';
import { useTierCompletionStore } from '@/stores/tierCompletionStore';
import { AchievementModal } from '@/screens/tabs/promotions/components';
import type { Tier } from '@/screens/tabs/promotions/components';
import { AppState, AppStateStatus } from 'react-native';
import { getUserCurrentTier } from '@/lib/database/tiers';
import { isTriviaOfferedToday } from '@/lib/triviaSchedule';
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
  const prevQueueLengthRef = useRef(0);
  const currentTriviaRef = useRef<TriviaQuestion | null>(null);
  const triviaQueueRef = useRef(triviaQueue);
  /** Client-side set of trivia IDs already answered/skipped this session; prevents re-showing before backend propagates */
  const processedTriviaIdsRef = useRef<Set<string>>(new Set());
  triviaQueueRef.current = triviaQueue;
  const currentQuestion = triviaQueue[0] ?? null;
  currentTriviaRef.current = currentQuestion;

  const filterProcessedTrivia = useCallback((questions: TriviaQuestion[]) =>
    questions.filter((q) => !processedTriviaIdsRef.current.has(q.$id)), []);

  const shouldShowTier1Modal = useTier1ModalStore((s) => s.shouldShowTier1Modal);
  const setShouldShowTier1Modal = useTier1ModalStore((s) => s.setShouldShowTier1Modal);
  const [tier1ModalVisible, setTier1ModalVisible] = useState(false);
  const [tier1Tier, setTier1Tier] = useState<Tier | null>(null);
  const [tier1WelcomePoints, setTier1WelcomePoints] = useState(100);

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

        // Initialize push notifications if user is logged in
        try {
          const user = await useAuthStore.getState().fetchUser();
          if (user) {
            // Set up push notification token refresh listener (requires Firebase, so only when user is logged in)
            setupTokenRefreshListener();

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
            // try {
            //   await clearPushNotificationCache();
            // } catch (cleanupError) {
            //   console.warn('[App] Failed to cleanup past event reminders:', cleanupError);
            // }
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
        const user = useAuthStore.getState().user;
        if (cancelled || !user) return;

        const profile = await getUserProfile(user.$id);
        if (cancelled || !profile) return;

        setUserProfileId(profile.$id); // for submit handler
        const triviaQuestions = filterProcessedTrivia(await getActiveTrivia(profile.$id));
        if (cancelled) return;
        if (!isTriviaOfferedToday()) return;

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

  // When queue becomes empty (user closed last question), refetch so newly created trivia appears without restart
  useEffect(() => {
    if (triviaQueue.length !== 0) {
      prevQueueLengthRef.current = triviaQueue.length;
      return;
    }
    if (prevQueueLengthRef.current === 0) return; // was already empty (e.g. initial state)
    prevQueueLengthRef.current = 0;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const user = useAuthStore.getState().user;
        if (cancelled || !user) return;
        const profile = await getUserProfile(user.$id);
        if (cancelled || !profile) return;
        const triviaQuestions = filterProcessedTrivia(await getActiveTrivia(profile.$id));
        if (cancelled) return;
        if (!isTriviaOfferedToday()) return;
        if (triviaQuestions.length > 0) {
          setTriviaQueue(triviaQuestions);
          setShowTrivia(true);
        }
      } catch (error) {
        if (!cancelled) console.error('[App] Failed to refetch trivia when queue empty:', error);
      }
    }, 1500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [triviaQueue.length]);

  // When queue is empty, periodically refetch so newly created trivia appears (e.g. admin added while user stayed in app)
  useEffect(() => {
    if (!appIsReady || !userProfileId || triviaQueue.length > 0) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      if (cancelled) return;
      try {
        const triviaQuestions = filterProcessedTrivia(await getActiveTrivia(userProfileId));
        if (cancelled) return;
        if (!isTriviaOfferedToday()) return;
        if (triviaQuestions.length > 0) {
          setTriviaQueue(triviaQuestions);
          setShowTrivia(true);
        }
      } catch (error) {
        if (!cancelled) console.error('[App] Failed to refetch trivia (periodic):', error);
      }
    }, 60_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [appIsReady, userProfileId, triviaQueue.length]);

  // Refetch trivia when app comes to foreground so newly created trivia appears without restart
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState: AppStateStatus) => {
      if (nextState !== 'active') return;

      try {
        if (!isTriviaOfferedToday()) {
          setTriviaQueue([]);
          setShowTrivia(false);
          return;
        }

        const user = await useAuthStore.getState().fetchUser();
        if (!user) return;
        const profile = await getUserProfile(user.$id);
        if (!profile) return;

        const triviaQuestions = filterProcessedTrivia(await getActiveTrivia(profile.$id));
        const currentQueue = triviaQueueRef.current;
        const existingIds = new Set(currentQueue.map((q) => q.$id));
        const newQuestions = triviaQuestions.filter((q) => !existingIds.has(q.$id));

        if (newQuestions.length === 0) return;

        setTriviaQueue((prev) => {
          const existingIdsInPrev = new Set(prev.map((q) => q.$id));
          const merged = [...prev];
          for (const q of triviaQuestions) {
            if (!existingIdsInPrev.has(q.$id)) {
              merged.push(q);
              existingIdsInPrev.add(q.$id);
            }
          }
          return merged;
        });
        setShowTrivia(true);
      } catch (error) {
        console.error('[App] Failed to refetch trivia on app focus:', error);
      }
    });

    return () => subscription.remove();
  }, []);

  // Close trivia if Eastern Tuesday ends while the app stays open (e.g. after midnight Wed).
  useEffect(() => {
    if (!appIsReady) return;
    const id = setInterval(() => {
      if (!isTriviaOfferedToday() && triviaQueueRef.current.length > 0) {
        setTriviaQueue([]);
        setShowTrivia(false);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [appIsReady]);

  // Show Tier 1 modal for newly signed up users (after email verification)
  useEffect(() => {
    if (!shouldShowTier1Modal || !appIsReady) return;

    let cancelled = false;
    const loadAndShowTier1Modal = async () => {
      try {
        const user = useAuthStore.getState().user;
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
          setTier1WelcomePoints(profile.totalPoints ?? 0);
          setTier1ModalVisible(true);
          // Welcome notification is created in ConfirmAccountScreen before navigating to NotificationSetup
          // so it appears immediately on the notification onboarding screen.
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
      // `AchievementModal` handles screenshot capture + share internally.
      // Keep this callback for any side-effects/analytics if needed.
    } catch (error) {
      console.error('[App] Error sharing achievement:', error);
    }
  };

  const handleCloseTierCompletionModal = () => {
    clearTierCompletion();
  };

  const handleShareTierCompletion = async () => {
    try {
      // `AchievementModal` handles screenshot capture + share internally.
      // Keep this callback for any side-effects/analytics if needed.
    } catch (error) {
      console.error('[App] Error sharing tier completion:', error);
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
    const q = currentTriviaRef.current;
    if (q) {
      processedTriviaIdsRef.current.add(q.$id);
    }
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

        // If tier changed, show the achievement modal and add to notifications
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

          try {
            const user = useAuthStore.getState().user;
            if (user) {
              await createUserNotification({
                userId: user.$id,
                type: 'tierChanged',
                title: `Tier Earned: ${newTier.name}!`,
                message: `Congratulations, you've reached the ${newTier.name} tier! Keep earning points to level up!`,
                data: {
                  oldTierId: oldTier.$id,
                  newTierId: newTier.$id,
                  newTierName: newTier.name,
                },
              });
            }
          } catch (notifErr) {
            console.warn('[App] Failed to create tier notification:', notifErr);
          }
        }
      } catch (error) {
        console.error('[App] Failed to check tier completion after trivia:', error);
      }
    }
  };

  const triviaDayActive = isTriviaOfferedToday();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <AppNavigator />
          {triviaDayActive && currentQuestion && (
            <TriviaModal
              key={currentQuestion.$id}
              visible={showTrivia && triviaDayActive}
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
            points={tier1WelcomePoints}
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
