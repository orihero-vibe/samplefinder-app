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
      console.log('[ForgotPassword] Pre-filling email from route params:', emailFromParams);
      setEmail(emailFromParams.trim());
    }
  }, [route?.params?.email]);

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
      console.log('[ForgotPassword] Sending password recovery email to:', email);
      const userId = await createPasswordRecovery(email.trim());
      console.log('[ForgotPassword] Password recovery email sent successfully');
      
      // Navigate to password reset screen with email and userId (if available)
      navigation.navigate('PasswordReset', { 
        email: email.trim(),
        userId: userId || undefined,
      });
    } catch (error: any) {
      console.error('[ForgotPassword] Error sending recovery email:', error);
      const errorMsg = error?.message || 'Failed to send recovery email. Please try again.';
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

