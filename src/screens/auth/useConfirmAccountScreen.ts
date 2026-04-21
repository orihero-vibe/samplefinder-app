import { useState, useRef, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { verifyEmail, sendEmailOTP, resendVerificationEmail, logout } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';
import { initializePushNotifications } from '@/lib/notifications';
import { createUserNotification } from '@/lib/database';
import { applyReferralAfterVerification } from '@/lib/referral';
import { CodeInputRef } from '@/components/shared/CodeInput';
import { useTier1ModalStore } from '@/stores/tier1ModalStore';

type ConfirmAccountScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ConfirmAccount'>;

/** Matches password reset; reduces consecutive API calls and rate-limit errors. */
const RESEND_COOLDOWN_SECONDS = 60;

export const useConfirmAccountScreen = () => {
  const navigation = useNavigation<ConfirmAccountScreenNavigationProp>();
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const codeInputRef = useRef<CodeInputRef>(null);
  const welcomeNotificationAttempted = useRef(false);

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  useEffect(() => {
    // Get current user, delete session, and send OTP
    const initializeOTP = async () => {
      try {
        // Step 1: Get current user from session
        // Add a small delay to ensure session is available after navigation
        await new Promise(resolve => setTimeout(resolve, 100));
        const user = await useAuthStore.getState().fetchUser();
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

        // Step 2: Delete the current session
        try {
          await logout();
        } catch (logoutError: any) {
          console.warn('[ConfirmAccount] Error deleting session (may not exist):', logoutError?.message);
          // Continue anyway
        }
        useAuthStore.getState().clearUser();

        // Step 3: Send Email OTP using createEmailToken
        await sendEmailOTP(userUserId, userEmail);

        // Set state and cooldown (initial OTP was just sent)
        setEmail(userEmail);
        setUserId(userUserId);
        setResendTimer(RESEND_COOLDOWN_SECONDS);
        setCanResend(false);
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
      await verifyEmail(userId, code);

      await applyReferralAfterVerification(userId);

      // Populate auth store before Tier 1 modal logic in App.tsx runs; that effect
      // reads `user` and only depends on [shouldShowTier1Modal, appIsReady], so it
      // would otherwise bail once with `user === null` and never retry.
      await useAuthStore.getState().fetchUser();

      // Register FCM + Appwrite push target before welcome notification: `createUserNotification`
      // triggers `sendPushNotification`, which needs an existing target for this user.
      try {
        await initializePushNotifications();
      } catch (error) {
        console.warn('[ConfirmAccount] Push initialization failed (in-app welcome still attempted):', error);
      }

      // Create a welcome notification (in-app list + optional device push if permitted).
      // Only attempt once per verification session to prevent duplicates.
      if (!welcomeNotificationAttempted.current) {
        welcomeNotificationAttempted.current = true;
        try {
          await createUserNotification({
            userId,
            type: 'tierChanged',
            title: 'Welcome to SampleFinder!',
            message: "You've joined! Start discovering samples and earning rewards.",
            data: { source: 'signup', tierWelcome: 'true' },
          });
        } catch (notifErr) {
          console.warn('[ConfirmAccount] Failed to create welcome notification:', notifErr);
          // Reset flag on error so it can be retried if verification is attempted again
          welcomeNotificationAttempted.current = false;
        }
      }

      // Trigger Tier 1 modal for newly signed up users (auth user must be set).
      useTier1ModalStore.getState().setShouldShowTier1Modal(true);

      // After successful verification, go straight into the app.
      // Notifications should only be accessed from the Profile section.
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' as never }],
      });
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

    if (!canResend) {
      return;
    }

    setIsResending(true);
    setError('');
    setCode(''); // Clear current code

    try {
      await resendVerificationEmail(userId, email);
      setError(''); // Clear any previous errors
      setResendTimer(RESEND_COOLDOWN_SECONDS);
      setCanResend(false);
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
    // Code completion is handled - user can now click verify button
  };

  return {
    code,
    email,
    userId,
    isLoading,
    isResending,
    resendTimer,
    canResend,
    error,
    codeInputRef,
    handleCodeChange,
    handleCodeComplete,
    handleVerify,
    handleResendCode,
  };
};

