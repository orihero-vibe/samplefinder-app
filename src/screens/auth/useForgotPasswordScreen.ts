import { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { createPasswordRecovery } from '@/lib/auth';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;
type ForgotPasswordScreenRouteProp = RouteProp<RootStackParamList, 'ForgotPassword'>;

export const useForgotPasswordScreen = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const route = useRoute<ForgotPasswordScreenRouteProp>();
  const initialEmail = route?.params?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Update email if route params change (when navigating from LoginScreen with email)
  useEffect(() => {
    const emailFromParams = route?.params?.email;
    if (emailFromParams && emailFromParams.trim()) {
      setEmail(emailFromParams.trim());
    }
  }, [route?.params?.email]);

  const getUserFriendlyErrorMessage = (error: any): string => {
    const errorMessage = error?.message || '';
    
    // Check for email validation errors
    if (errorMessage.toLowerCase().includes('email') && 
        (errorMessage.toLowerCase().includes('valid') || errorMessage.toLowerCase().includes('invalid'))) {
      return errorMessage.includes('email') && errorMessage.length < 100 
        ? errorMessage 
        : 'Please enter a valid email address.';
    }
    
    // Check for user not found errors
    if (errorMessage.toLowerCase().includes('user') && 
        (errorMessage.toLowerCase().includes('not found') || errorMessage.toLowerCase().includes('does not exist'))) {
      return 'No account found with this email address.';
    }
    
    // Check for rate limiting
    if (errorMessage.toLowerCase().includes('rate limit') || 
        errorMessage.toLowerCase().includes('too many')) {
      return errorMessage.length < 100 ? errorMessage : 'Too many attempts. Please try again later.';
    }
    
    // Network or server errors
    if (errorMessage.toLowerCase().includes('network') || 
        errorMessage.toLowerCase().includes('fetch') || 
        errorMessage.toLowerCase().includes('timeout')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    // Default - return actual error message if available and reasonable length
    return errorMessage && errorMessage.length < 100 
      ? errorMessage 
      : 'Failed to send recovery email. Please try again.';
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const userId = await createPasswordRecovery(email.trim());
      
      // Navigate to password reset screen with email and userId (if available)
      navigation.navigate('PasswordReset', { 
        email: email.trim(),
        userId: userId || undefined,
      });
    } catch (error: any) {
      console.error('[ForgotPassword] Error sending recovery email:', error);
      const errorMsg = getUserFriendlyErrorMessage(error);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setError(''); // Clear error when user types
  };

  return {
    email,
    isLoading,
    error,
    handleEmailChange,
    handleSubmit,
  };
};

