import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { login } from '@/lib/auth';
import { initializePushNotifications } from '@/lib/notifications';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const useLoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateForm = (): boolean => {
    let isValid = true;

    // Clear previous errors
    setEmailError('');
    setPasswordError('');

    // Validate email
    if (!email.trim()) {
      setEmailError('Please enter your email address');
      isValid = false;
    } else {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setEmailError('Please enter a valid email address.');
        isValid = false;
      }
    }

    // Validate password
    if (!password) {
      setPasswordError('Please enter your password');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      isValid = false;
    }

    return isValid;
  };

  const handleLoginError = (error: any): void => {
    const errorMessage = error?.message || '';
    
    // Clear previous errors
    setEmailError('');
    setPasswordError('');

      // Check for invalid credentials - display the actual backend message
      if (errorMessage.includes('Invalid credentials')) {
        // Show on both fields since it could be either email or password
        const message = errorMessage;
        setEmailError(message);
        setPasswordError(message);
        return;
      }
    
    // Check for email validation errors
    if (errorMessage.toLowerCase().includes('email') && 
        (errorMessage.toLowerCase().includes('valid') || errorMessage.toLowerCase().includes('invalid'))) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    
    // Check for authentication failed
    if (errorMessage.toLowerCase().includes('authentication failed')) {
      setEmailError('Invalid email or password. Please try again.');
      setPasswordError('Invalid email or password. Please try again.');
      return;
    }
    
    // Check for account not found
    if (errorMessage.toLowerCase().includes('user') && 
        (errorMessage.toLowerCase().includes('not found') || errorMessage.toLowerCase().includes('does not exist'))) {
      setEmailError('No account found with this email address.');
      return;
    }
    
    // Check for password errors (but not if already handled above)
    if (errorMessage.toLowerCase().includes('password') && 
        !errorMessage.includes('Invalid credentials')) {
      setPasswordError(errorMessage);
      return;
    }
    
    // Network or server errors - show on email field as primary field
    if (errorMessage.toLowerCase().includes('network') || 
        errorMessage.toLowerCase().includes('fetch') || 
        errorMessage.toLowerCase().includes('timeout')) {
      setEmailError('Network error. Please check your connection.');
      return;
    }
    
    // Default fallback - show the actual error message if available
    const displayMessage = errorMessage || 'Login failed. Please check your credentials.';
    setEmailError(displayMessage);
  };

  const handleLogin = async () => {
    // Clear errors before validation
    setEmailError('');
    setPasswordError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const user = await login({
        email: email.trim(),
        password: password,
      });

      // Check if email is already verified
      if (user.emailVerification) {
        // Email already verified - go directly to main app
        console.log('[LoginScreen] Email already verified, navigating to MainTabs');
        
        // Initialize push notifications for returning verified users
        initializePushNotifications().catch((error) => {
          console.warn('[LoginScreen] Failed to initialize push notifications:', error);
          // Don't block navigation - push notifications are not critical
        });
        
        navigation.replace('MainTabs');
      } else {
        // Email not verified - require OTP verification
        console.log('[LoginScreen] Email not verified, navigating to ConfirmAccount');
        navigation.navigate('ConfirmAccount', {});
      }
    } catch (error: any) {
      console.error('[LoginScreen] Login error:', error);
      handleLoginError(error);
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
    setEmailError(''); // Clear email error when user types
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordError(''); // Clear password error when user types
  };

  const handleRememberMeToggle = () => {
    setRememberMe(!rememberMe);
  };

  return {
    email,
    password,
    rememberMe,
    isLoading,
    emailError,
    passwordError,
    handleEmailChange,
    handlePasswordChange,
    handleRememberMeToggle,
    handleLogin,
    handleSignUp,
    handleForgotPassword,
  };
};

