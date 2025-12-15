import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '@/screens/auth/LoginScreen';
import SignUpScreen from '@/screens/auth/SignUpScreen';
import ConfirmAccountScreen from '@/screens/auth/ConfirmAccountScreen';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';
import PasswordResetScreen from '@/screens/auth/PasswordResetScreen';
import TabNavigator from '@/navigation/TabNavigator';
import { getCurrentUser } from '@/lib/auth';
import { Colors } from '@/constants/Colors';
import { setNavigationRef, setupNotificationHandlers, getLastNotificationResponse } from '@/lib/notifications/handlers';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ConfirmAccount: { phoneNumber?: string };
  ForgotPassword: { email?: string };
  PasswordReset: { email: string; userId?: string };
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRouteName, setInitialRouteName] = useState<keyof RootStackParamList>('Login');
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    checkAuthSession();
    setupNotificationHandlers();
    
    // Check for notification that opened the app
    getLastNotificationResponse();
  }, []);

  const checkAuthSession = async () => {
    try {
      console.log('[AppNavigator] Checking for active session...');
      const user = await getCurrentUser();
      
      if (user) {
        console.log('[AppNavigator] Active session found, navigating to MainTabs');
        setInitialRouteName('MainTabs');
      } else {
        console.log('[AppNavigator] No active session, navigating to Login');
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
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.brandPurpleDeep} />
      </View>
    );
  }

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
        <Stack.Screen name="ConfirmAccount" component={ConfirmAccountScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="PasswordReset" component={PasswordResetScreen} />
        <Stack.Screen name="MainTabs" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
});

export default AppNavigator;

