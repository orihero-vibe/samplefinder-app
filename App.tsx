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
import { TriviaModal, TriviaQuestion, getRandomTriviaQuestion } from '@/components/trivia';
import { setupTokenRefreshListener, initializePushNotifications } from '@/lib/notifications';
import { getCurrentUser } from '@/lib/auth';
import './reactotron';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showTrivia, setShowTrivia] = useState(false);
  const [triviaQuestion, setTriviaQuestion] = useState<TriviaQuestion | null>(null);
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

  // Show trivia modal 5 seconds after app is ready (only once per session)
  useEffect(() => {
    if (appIsReady && !triviaShownRef.current) {
      const timer = setTimeout(() => {
        const randomQuestion = getRandomTriviaQuestion();
        setTriviaQuestion(randomQuestion);
        setShowTrivia(true);
        triviaShownRef.current = true;
      }, 5000); // 5 seconds delay

      return () => clearTimeout(timer);
    }
  }, [appIsReady]);

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

  const handleAnswerSelected = (isCorrect: boolean, points: number) => {
    console.log(`Trivia answer: ${isCorrect ? 'Correct' : 'Incorrect'}, Points earned: ${points}`);
    // You can add logic here to update user points, show notifications, etc.
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
              onAnswerSelected={handleAnswerSelected}
            />
          )}
        </View>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
