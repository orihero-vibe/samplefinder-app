import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { login } from '@/lib/auth';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const useLoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!password) {
      setError('Please enter your password');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('[LoginScreen] Starting login process...');
      const user = await login({
        email: email.trim(),
        password: password,
      });

      console.log('[LoginScreen] Login successful:', {
        id: user.$id,
        email: user.email,
        emailVerification: user.emailVerification,
      });

      // Always navigate to confirm account page after login to verify email OTP
      console.log('[LoginScreen] Navigating to ConfirmAccount for email verification');
      navigation.navigate('ConfirmAccount', {});
    } catch (error: any) {
      console.error('[LoginScreen] Login error:', error);
      const errorMsg = error?.message || 'Login failed. Please check your credentials.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  const handleForgotPassword = () => {
    // Pass email if it's entered
    navigation.navigate('ForgotPassword', {
      email: email.trim() || undefined,
    });
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setError(''); // Clear error when user types
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setError(''); // Clear error when user types
  };

  const handleRememberMeToggle = () => {
    setRememberMe(!rememberMe);
  };

  return {
    email,
    password,
    rememberMe,
    isLoading,
    error,
    handleEmailChange,
    handlePasswordChange,
    handleRememberMeToggle,
    handleLogin,
    handleSignUp,
    handleForgotPassword,
  };
};

