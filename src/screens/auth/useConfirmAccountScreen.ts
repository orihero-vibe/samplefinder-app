import { useState, useRef, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { getCurrentUser, verifyEmail, sendEmailOTP, resendVerificationEmail, logout } from '@/lib/auth';
import { initializePushNotifications } from '@/lib/notifications';
import { CodeInputRef } from '@/components/shared/CodeInput';

type ConfirmAccountScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ConfirmAccount'>;

export const useConfirmAccountScreen = () => {
  const navigation = useNavigation<ConfirmAccountScreenNavigationProp>();
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const codeInputRef = useRef<CodeInputRef>(null);

  useEffect(() => {
    // Get current user, delete session, and send OTP
    const initializeOTP = async () => {
      try {
        // Step 1: Get current user from session
        console.log('[ConfirmAccount] Getting current user from session...');
        // Add a small delay to ensure session is available after navigation
        await new Promise(resolve => setTimeout(resolve, 100));
        const user = await getCurrentUser();
        if (!user) {
          console.error('[ConfirmAccount] No user found in session');
          setError('Session expired. Please sign in again to verify your account.');
          setTimeout(() => {
            navigation.replace('Login');
          }, 2000);
          return;
        }

        const userEmail = user.email;
        const userUserId = user.$id;
        
        console.log('[ConfirmAccount] User retrieved:', {
          id: userUserId,
          email: userEmail,
        });

        // Step 2: Delete the current session
        console.log('[ConfirmAccount] Deleting current session...');
        try {
          await logout();
          console.log('[ConfirmAccount] Session deleted successfully');
        } catch (logoutError: any) {
          console.warn('[ConfirmAccount] Error deleting session (may not exist):', logoutError?.message);
          // Continue anyway
        }

        // Step 3: Send Email OTP using createEmailToken
        console.log('[ConfirmAccount] Sending Email OTP...');
        await sendEmailOTP(userUserId, userEmail);
        console.log('[ConfirmAccount] Email OTP sent successfully');

        // Set state
        setEmail(userEmail);
        setUserId(userUserId);
      } catch (error: any) {
        console.error('[ConfirmAccount] Error initializing OTP:', error);
        const errorMsg = error?.message || 'Failed to send verification code. Please try again.';
        setError(errorMsg);
        setTimeout(() => {
          navigation.replace('Login');
        }, 3000);
      }
    };

    initializeOTP();

    // Focus the code input when the screen mounts
    const timer = setTimeout(() => {
      codeInputRef.current?.focus();
    }, 100); // Small delay to ensure the component is fully rendered

    return () => clearTimeout(timer);
  }, [navigation]);

  const handleVerify = async () => {
    if (!userId) {
      setError('User information not available. Please try again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('[ConfirmAccount] Verifying email with code:', code);
      await verifyEmail(userId, code);
      console.log('[ConfirmAccount] Email verified successfully');
      
      // Initialize push notifications after successful verification
      // This is the right time because we now have a valid session
      console.log('[ConfirmAccount] Initializing push notifications...');
      initializePushNotifications().catch((error) => {
        console.warn('[ConfirmAccount] Failed to initialize push notifications:', error);
        // Don't block navigation - push notifications are not critical
      });
      
      // Navigate to MainTabs after successful verification
      navigation.replace('MainTabs');
    } catch (error: any) {
      console.error('[ConfirmAccount] Verification error:', error);
      const errorMsg = error?.message || 'Failed to verify email. Please check your code.';
      setError(errorMsg);
      setCode(''); // Clear the code on error
      codeInputRef.current?.focus(); // Refocus the input
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!userId || !email) {
      setError('User information not available. Please try again.');
      return;
    }

    setIsResending(true);
    setError('');
    setCode(''); // Clear current code

    try {
      console.log('[ConfirmAccount] Resending verification email...');
      await resendVerificationEmail(userId, email);
      console.log('[ConfirmAccount] Verification email resent successfully');
      setError(''); // Clear any previous errors
      // Success message could be shown, but we'll just clear errors
    } catch (error: any) {
      console.error('[ConfirmAccount] Resend error:', error);
      const errorMsg = error?.message || 'Failed to resend verification code. Please try again.';
      setError(errorMsg);
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeChange = (text: string) => {
    setCode(text);
    setError(''); // Clear error when user types
  };

  const handleCodeComplete = (completedCode: string) => {
    console.log('Code completed:', completedCode);
    // Code completion is handled - user can now click verify button
  };

  return {
    code,
    email,
    userId,
    isLoading,
    isResending,
    error,
    codeInputRef,
    handleCodeChange,
    handleCodeComplete,
    handleVerify,
    handleResendCode,
  };
};

