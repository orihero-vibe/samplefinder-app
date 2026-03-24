import React, { useState, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '@/screens/auth/LoginScreen';
import SignUpScreen from '@/screens/auth/SignUpScreen';
import ConfirmAccountScreen from '@/screens/auth/ConfirmAccountScreen';
import NotificationSetupScreen from '@/screens/auth/NotificationSetupScreen';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';
import PasswordResetScreen from '@/screens/auth/PasswordResetScreen';
import TabNavigator from '@/navigation/TabNavigator';
import { getCurrentUser } from '@/lib/auth';
import { markNotificationAsRead } from '@/lib/database';
import { setNavigationRef, setupNotificationHandlers, getLastNotificationResponse } from '@/lib/notifications/handlers';
import { CustomSplashScreen } from '@/components';
import BadgeEarnedModal, { type BadgeType } from '@/components/shared/BadgeEarnedModal';
import { syncSpecialBadgeAwards, type AwardedSpecialBadge } from '@/lib/specialBadgeAwards';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  NotificationSetup: { phoneNumber?: string };
  ConfirmAccount: { phoneNumber?: string };
  ForgotPassword: { email?: string };
  PasswordReset: { email: string; userId?: string };
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const SPECIAL_BADGE_SYNC_INTERVAL_MS = 3000;

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRouteName, setInitialRouteName] = useState<keyof RootStackParamList>('Login');
  const navigationRef = useRef<any>(null);
  const isSyncingSpecialBadgesRef = useRef(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const [pendingSpecialBadgeAwards, setPendingSpecialBadgeAwards] = useState<AwardedSpecialBadge[]>([]);
  const [activeSpecialBadgeAward, setActiveSpecialBadgeAward] = useState<AwardedSpecialBadge | null>(null);

  useEffect(() => {
    checkAuthSession();
    setupNotificationHandlers();
    
    // Check for notification that opened the app
    getLastNotificationResponse();
  }, []);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const runSpecialBadgeSync = async () => {
      if (isSyncingSpecialBadgesRef.current) {
        return;
      }

      isSyncingSpecialBadgesRef.current = true;
      try {
        const newlyAwardedBadges = await syncSpecialBadgeAwards();
        if (newlyAwardedBadges.length === 0 || appStateRef.current !== 'active') {
          return;
        }
        setPendingSpecialBadgeAwards((current) => {
          const queuedTypes = new Set(current.map((badge) => badge.type));
          const activeType = activeSpecialBadgeAward?.type;
          const filteredNewBadges = newlyAwardedBadges.filter((badge) => {
            if (activeType && badge.type === activeType) {
              return false;
            }
            if (queuedTypes.has(badge.type)) {
              return false;
            }
            queuedTypes.add(badge.type);
            return true;
          });

          if (filteredNewBadges.length === 0) {
            return current;
          }

          return [...current, ...filteredNewBadges];
        });
      } catch (error) {
        console.error('[AppNavigator] Failed syncing special badges:', error);
      } finally {
        isSyncingSpecialBadgesRef.current = false;
      }
    };

    runSpecialBadgeSync();
    intervalId = setInterval(runSpecialBadgeSync, SPECIAL_BADGE_SYNC_INTERVAL_MS);

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      const wasBackground = appStateRef.current !== 'active';
      appStateRef.current = nextState;
      if (nextState === 'active' && wasBackground) {
        runSpecialBadgeSync();
      }
    });

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      appStateSubscription.remove();
    };
  }, [activeSpecialBadgeAward]);

  useEffect(() => {
    if (activeSpecialBadgeAward || pendingSpecialBadgeAwards.length === 0) {
      return;
    }

    const [nextBadgeAward, ...rest] = pendingSpecialBadgeAwards;
    setActiveSpecialBadgeAward(nextBadgeAward);
    setPendingSpecialBadgeAwards(rest);
  }, [activeSpecialBadgeAward, pendingSpecialBadgeAwards]);

  const checkAuthSession = async () => {
    try {
      const user = await getCurrentUser();
      
      if (user) {
        setInitialRouteName('MainTabs');
      } else {
        setInitialRouteName('Login');
      }
    } catch (error: any) {
      console.error('[AppNavigator] Error checking session:', error);
      // On error, default to Login screen
      setInitialRouteName('Login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <CustomSplashScreen />;
  }

  const activeSpecialBadgeType: BadgeType = activeSpecialBadgeAward?.type ?? 'events';
  const handleCloseSpecialBadgeModal = async () => {
    const notificationId = activeSpecialBadgeAward?.notificationId;
    setActiveSpecialBadgeAward(null);

    if (!notificationId) {
      return;
    }

    try {
      const user = await getCurrentUser();
      if (!user) {
        return;
      }
      await markNotificationAsRead(user.$id, notificationId);
    } catch (error) {
      console.warn('[AppNavigator] Failed to mark special badge notification as read:', error);
    }
  };

  return (
    <NavigationContainer
      ref={(ref) => {
        navigationRef.current = ref;
        setNavigationRef(ref);
      }}
    >
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#2D1B69' },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="NotificationSetup" component={NotificationSetupScreen} />
        <Stack.Screen name="ConfirmAccount" component={ConfirmAccountScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="PasswordReset" component={PasswordResetScreen} />
        <Stack.Screen name="MainTabs" component={TabNavigator} />
      </Stack.Navigator>

      <BadgeEarnedModal
        visible={Boolean(activeSpecialBadgeAward)}
        badgeType={activeSpecialBadgeType}
        onClose={handleCloseSpecialBadgeModal}
      />
    </NavigationContainer>
  );
};

export default AppNavigator;

