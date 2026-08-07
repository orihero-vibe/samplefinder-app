// samplefinder-app/src/screens/auth/useConfirmPhoneScreen.ts
import { useState, useRef, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { sendPhoneVerification, verifyPhone, logout, hasAccountPhone } from '@/lib/auth';
import { markPhoneVerified, getUserProfile } from '@/lib/database';
import { useAuthStore } from '@/stores/authStore';
import { completeSignupOnboarding } from '@/lib/signupOnboarding';
import { CodeInputRef } from '@/components/shared/CodeInput';

type ConfirmPhoneNavProp = NativeStackNavigationProp<RootStackParamList, 'ConfirmPhone'>;
type ConfirmPhoneRouteProp = RouteProp<RootStackParamList, 'ConfirmPhone'>;

/** Matches the email screen; reduces consecutive API calls and rate-limit errors. */
const RESEND_COOLDOWN_SECONDS = 60;

export const useConfirmPhoneScreen = () => {
  const navigation = useNavigation<ConfirmPhoneNavProp>();
  const route = useRoute<ConfirmPhoneRouteProp>();
  const [code, setCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(route.params?.phoneNumber ?? '');
  const [userId, setUserId] = useState(useAuthStore.getState().user?.$id ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const codeInputRef = useRef<CodeInputRef>(null);
  const sentRef = useRef(false);
  const verificationCompletedRef = useRef(false);
  const allowLeaveRef = useRef(false);

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

  // Send the SMS once on mount. The active session was (re)established by the
  // email-OTP step, and the account phone was set during signup().
  useEffect(() => {
    let expiredRedirect: ReturnType<typeof setTimeout> | undefined;
    const init = async () => {
      try {
        const user = useAuthStore.getState().user ?? (await useAuthStore.getState().fetchUser());
        if (!user) {
          setError('Session expired. Please sign in again to verify your phone.');
          expiredRedirect = setTimeout(() => navigation.replace('Login'), 2000);
          return;
        }
        setUserId(user.$id);

        // Fetch the phone for display only when it wasn't passed as a route param.
        if (!route.params?.phoneNumber) {
          try {
            const profile = await getUserProfile(user.$id);
            if (profile?.phoneNumber) setPhoneNumber(profile.phoneNumber);
          } catch {
            // Display-only; ignore.
          }
        }

        if (!sentRef.current) {
          sentRef.current = true;
          try {
            // Appwrite can only send to a phone that is set on the ACCOUNT.
            // Check first so a missing one produces an actionable message rather
            // than an opaque provider error the user cannot do anything about.
            // `null` means the check failed; fall through and let the send try.
            if ((await hasAccountPhone()) === false) {
              sentRef.current = false;
              setCanResend(true);
              setError(
                'We could not find a phone number on your account. Please sign out and sign in again, or contact support if this keeps happening.'
              );
              return;
            }

            await sendPhoneVerification();
            setResendTimer(RESEND_COOLDOWN_SECONDS);
            setCanResend(false);
          } catch (sendError: any) {
            // The first send failed (provider not configured, unregistered 10DLC
            // campaign, carrier reject...). Re-open BOTH retry paths: clear
            // sentRef so a remount re-sends, and enable Resend so the user can
            // retry in place. Without this the screen is a dead end — Resend
            // stays disabled because the cooldown timer never started.
            sentRef.current = false;
            setCanResend(true);
            setError(
              sendError?.message || 'Failed to send verification code. Please try again.'
            );
          }
        }
      } catch (e: any) {
        // Session or profile lookup failed. Leave Resend enabled so the user has
        // a way forward rather than a stuck screen.
        setCanResend(true);
        setError(e?.message || 'Failed to send verification code. Please try again.');
      }
    };
    init();

    const timer = setTimeout(() => codeInputRef.current?.focus(), 100);
    return () => {
      clearTimeout(timer);
      if (expiredRedirect) clearTimeout(expiredRedirect);
    };
  }, [navigation]);

  const handleVerify = async () => {
    if (!userId) {
      setError('User information not available. Please try again.');
      return;
    }
    setIsLoading(true);
    setError('');

    // Step 1 — the OTP check. This is the ONLY failure the user can act on, so
    // it is the only one surfaced as an error on this screen.
    try {
      await verifyPhone(userId, code);
    } catch (error: any) {
      console.error('[ConfirmPhone] Verification error:', error);
      setError(error?.message || 'Failed to verify phone. Please check your code.');
      setCode('');
      codeInputRef.current?.focus();
      setIsLoading(false);
      return;
    }

    // Past this point the OTP is consumed and account.phoneVerification is true.
    // Nothing below may block entry to the app or be reported as a bad code.

    // Step 2 — mirror the flag into user_profiles; this drives the routing gate.
    // Retried once: if it never lands, the user still enters the app now but is
    // re-gated to this screen on next launch.
    try {
      await markPhoneVerified(userId);
    } catch (firstError: any) {
      console.warn('[ConfirmPhone] markPhoneVerified failed, retrying:', firstError?.message);
      try {
        await markPhoneVerified(userId);
      } catch (retryError: any) {
        console.error(
          '[ConfirmPhone] markPhoneVerified failed after retry; user will be re-gated next launch:',
          retryError?.message
        );
      }
    }

    // Step 3 — one-time onboarding, run after BOTH verifications. Shared with
    // the email-only path via completeSignupOnboarding, which guards each of its
    // own steps and does not throw.
    try {
      await completeSignupOnboarding(userId);
    } catch (onboardingError: any) {
      console.error('[ConfirmPhone] Signup onboarding failed:', onboardingError?.message);
    }

    verificationCompletedRef.current = true;
    setIsLoading(false);
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' as never }] });
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    setIsResending(true);
    setError('');
    setCode('');
    try {
      await sendPhoneVerification();
      setResendTimer(RESEND_COOLDOWN_SECONDS);
      setCanResend(false);
    } catch (error: any) {
      setError(error?.message || 'Failed to resend verification code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeChange = (text: string) => {
    setCode(text);
    setError('');
  };

  const handleCodeComplete = (_completedCode: string) => {
    // User taps Verify; no auto-submit (mirrors the email screen).
  };

  // Phone is mandatory. Leaving logs the user out and returns to Login; the
  // phoneVerified gate (Tasks 6/7) re-routes them here on next login. The
  // account is email-verified and valid, so it is NOT deleted.
  const leaveToLogin = useCallback(async () => {
    if (isLeaving) return;
    setIsLeaving(true);
    try {
      try {
        await logout();
      } catch (e: any) {
        console.warn('[ConfirmPhone] Logout during leave failed:', e?.message);
      }
      useAuthStore.getState().clearUser();
      allowLeaveRef.current = true;
      navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
    } finally {
      setIsLeaving(false);
    }
  }, [isLeaving, navigation]);

  const handleBack = useCallback(() => {
    if (isLoading || isLeaving) return;
    Alert.alert(
      'Verify later?',
      'You must verify your phone number to use SampleFinder. You will be signed out and can finish verifying the next time you log in.',
      [
        { text: 'Keep verifying', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: () => { void leaveToLogin(); } },
      ]
    );
  }, [isLoading, isLeaving, leaveToLogin]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (verificationCompletedRef.current || allowLeaveRef.current) return;
      e.preventDefault();
      handleBack();
    });
    return unsubscribe;
  }, [navigation, handleBack]);

  return {
    code,
    phoneNumber,
    isLoading,
    isResending,
    isLeaving,
    resendTimer,
    canResend,
    error,
    codeInputRef,
    handleCodeChange,
    handleCodeComplete,
    handleVerify,
    handleResendCode,
    handleBack,
  };
};
