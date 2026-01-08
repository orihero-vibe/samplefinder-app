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
import AppNavigator from '@/navigation/AppNavigator';
import { TriviaModal } from '@/components/trivia';
import type { TriviaQuestion } from '@/lib/database/trivia';
import { getActiveTrivia, submitTriviaAnswer } from '@/lib/database';
import { getUserProfile } from '@/lib/database';
import { setupTokenRefreshListener, initializePushNotifications } from '@/lib/notifications';
import { getCurrentUser } from '@/lib/auth';
import './reactotron';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showTrivia, setShowTrivia] = useState(false);
  const [triviaQuestion, setTriviaQuestion] = useState<TriviaQuestion | null>(null);
  const [userProfileId, setUserProfileId] = useState<string | null>(null);
  const triviaShownRef = useRef(false);

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
        });

        // Set up push notification token refresh listener
        setupTokenRefreshListener();

        // Initialize push notifications if user is logged in
        try {
          const user = await getCurrentUser();
          if (user) {
            console.log('[App] User logged in, initializing push notifications...');
            initializePushNotifications().catch((error) => {
              console.warn('[App] Failed to initialize push notifications:', error);
            });

            // Get user profile ID for trivia
            try {
              const profile = await getUserProfile(user.$id);
              if (profile) {
                setUserProfileId(profile.$id);
                console.log('[App] User profile ID set:', profile.$id);
              }
            } catch (profileError) {
              console.warn('[App] Failed to get user profile:', profileError);
            }
          }
        } catch (error) {
          console.log('[App] No user logged in, skipping push notification initialization');
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
  useEffect(() => {
    if (appIsReady && userProfileId && !triviaShownRef.current) {
      const timer = setTimeout(async () => {
        try {
          console.log('[App] Fetching active trivia for user:', userProfileId);
          const triviaQuestions = await getActiveTrivia(userProfileId);
          
          if (triviaQuestions.length > 0) {
            // Show the first available trivia question
            setTriviaQuestion(triviaQuestions[0]);
            setShowTrivia(true);
            triviaShownRef.current = true;
            console.log('[App] Showing trivia question:', triviaQuestions[0].$id);
          } else {
            console.log('[App] No active trivia questions available');
          }
        } catch (error) {
          console.error('[App] Failed to fetch trivia:', error);
        }
      }, 5000); // 5 seconds delay

      return () => clearTimeout(timer);
    }
  }, [appIsReady, userProfileId]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  const handleTriviaClose = () => {
    setShowTrivia(false);
  };

  const handleSubmitAnswer = async (answerIndex: number) => {
    if (!userProfileId || !triviaQuestion) {
      return {
        success: false,
        error: 'User profile or trivia question not available',
      };
    }

    console.log('[App] Submitting trivia answer:', {
      userId: userProfileId,
      triviaId: triviaQuestion.$id,
      answerIndex,
    });

    return submitTriviaAnswer(userProfileId, triviaQuestion.$id, answerIndex);
  };

  const handleAnswerResult = (isCorrect: boolean, pointsAwarded: number) => {
    console.log(`[App] Trivia answer result: ${isCorrect ? 'Correct' : 'Incorrect'}, Points earned: ${pointsAwarded}`);
    // You can add logic here to update user points in UI, show notifications, etc.
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <AppNavigator />
          {triviaQuestion && (
            <TriviaModal
              visible={showTrivia}
              question={triviaQuestion}
              onClose={handleTriviaClose}
              onSubmitAnswer={handleSubmitAnswer}
              onAnswerResult={handleAnswerResult}
            />
          )}
        </View>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
