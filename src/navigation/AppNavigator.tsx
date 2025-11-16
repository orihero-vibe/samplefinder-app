import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '@/screens/auth/LoginScreen';
import SignUpScreen from '@/screens/auth/SignUpScreen';
import ConfirmAccountScreen from '@/screens/auth/ConfirmAccountScreen';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';
import PasswordResetScreen from '@/screens/auth/PasswordResetScreen';
import TabNavigator from '@/navigation/TabNavigator';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ConfirmAccount: { phoneNumber?: string };
  ForgotPassword: undefined;
  PasswordReset: { phoneNumber?: string };
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
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

export default AppNavigator;

