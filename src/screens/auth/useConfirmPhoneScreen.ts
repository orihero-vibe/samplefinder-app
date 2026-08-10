// samplefinder-app/src/screens/auth/useConfirmPhoneScreen.ts
import { useState, useRef, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { sendPhoneVerification, verifyPhone, logout, hasAccountPhone, changeAccountPhone } from '@/lib/auth';
import { markPhoneVerified, getUserProfile, updateUserProfile } from '@/lib/database';
import { useAuthStore } from '@/stores/authStore';
import { completeSignupOnboarding } from '@/lib/signupOnboarding';
import { isPhoneReverificationPending, clearPhoneReverification } from '@/lib/phoneReverification';
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
  // Correcting a mistyped number. Without this the screen is a dead end: the
  // code goes to the wrong phone and the routing gate returns the user here on
  // every launch, with no way out.
  const [showChangePhone, setShowChangePhone] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [changePhonePassword, setChangePhonePassword] = useState('');
  const [changePhoneError, setChangePhoneError] = useState('');
  const [isChangingPhone, setIsChangingPhone] = useState(false);
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

    // Step 3 — one-time onboarding, but ONLY on the signup path. This screen is
    // also reached by an existing user re-verifying a number they changed in
    // Edit Profile; running signup onboarding for them re-shows the Tier 1
    // welcome modal, re-sends the welcome notification and re-applies a
    // referral code. Resolved here rather than cached at mount so the answer is
    // authoritative at the moment it is used.
    const isReverification =
      route.params?.mode === 'reverify' || (await isPhoneReverificationPending(userId));

    if (isReverification) {
      await clearPhoneReverification(userId);
      // Onboarding would normally refresh this; the profile screen reads the
      // new number from it, so keep the store current on this path too.
      try {
        await useAuthStore.getState().fetchUser();
      } catch (fetchError: any) {
        console.warn('[ConfirmPhone] Failed to refresh user after re-verification:', fetchError?.message);
      }
    } else {
      // Shared with the email-only path via completeSignupOnboarding, which
      // guards each of its own steps and does not throw.
      try {
        await completeSignupOnboarding(userId);
      } catch (onboardingError: any) {
        console.error('[ConfirmPhone] Signup onboarding failed:', onboardingError?.message);
      }
    }

    verificationCompletedRef.current = true;
    setIsLoading(false);
    // Re-verification started from Edit Profile, so return to Profile rather
    // than dropping the user on Home with no sign their change took effect.
    navigation.reset({
      index: 0,
      routes: isReverification
        ? [{ name: 'MainTabs', params: { screen: 'Profile' as const } }]
        : [{ name: 'MainTabs' }],
    });
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

  const handleOpenChangePhone = () => {
    if (isLoading || isLeaving) return;
    setNewPhoneNumber('');
    setChangePhonePassword('');
    setChangePhoneError('');
    setShowChangePhone(true);
  };

  const handleCancelChangePhone = () => {
    setShowChangePhone(false);
    setNewPhoneNumber('');
    setChangePhonePassword('');
    setChangePhoneError('');
  };

  const handleNewPhoneNumberChange = (text: string) => {
    setNewPhoneNumber(text);
    if (changePhoneError) setChangePhoneError('');
  };

  const handleChangePhonePasswordChange = (text: string) => {
    setChangePhonePassword(text);
    if (changePhoneError) setChangePhoneError('');
  };

  const handleSubmitPhoneChange = async () => {
    const digits = newPhoneNumber.replace(/\D/g, '');
    // Mirrors toE164US so the user gets a field-level message rather than that
    // helper's throw surfacing as a generic failure.
    const isValidUsPhone = digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
    if (!isValidUsPhone) {
      setChangePhoneError('Enter a valid 10-digit US phone number.');
      return;
    }
    if (!changePhonePassword) {
      setChangePhoneError('Enter your password to confirm.');
      return;
    }
    if (!userId) {
      setChangePhoneError('User information not available. Please try again.');
      return;
    }

    setIsChangingPhone(true);
    setChangePhoneError('');
    try {
      // Point the ACCOUNT at the corrected number first: a rejection here —
      // wrong password, or the number already in use — must leave the existing
      // one untouched rather than half-applying the change.
      await changeAccountPhone(newPhoneNumber, changePhonePassword);

      // Mirror into the profile so the routing gate and the profile screen
      // agree with the account. Non-fatal: the account drives where the SMS
      // goes, and the gate re-checks the profile on next launch anyway.
      try {
        const profile = await getUserProfile(userId);
        if (profile) {
          await updateUserProfile(profile.$id, {
            phoneNumber: newPhoneNumber.trim(),
            phoneVerified: false,
          });
        }
      } catch (profileError: any) {
        console.warn(
          '[ConfirmPhone] Failed to mirror corrected phone into profile:',
          profileError?.message
        );
      }

      setPhoneNumber(newPhoneNumber.trim());
      setCode('');
      setError('');
      setShowChangePhone(false);
      setNewPhoneNumber('');
      setChangePhonePassword('');

      // Send to the corrected number straight away — that is the point of the
      // correction — and restart the cooldown against the new number.
      try {
        await sendPhoneVerification();
        sentRef.current = true;
        setResendTimer(RESEND_COOLDOWN_SECONDS);
        setCanResend(false);
      } catch (sendError: any) {
        sentRef.current = false;
        setCanResend(true);
        setError(
          sendError?.message ||
            'Your number was updated, but we could not send the code. Tap Resend to try again.'
        );
      }
    } catch (changeError: any) {
      setChangePhoneError(
        changeError?.message || 'Could not update your phone number. Please try again.'
      );
    } finally {
      setIsChangingPhone(false);
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
    showChangePhone,
    newPhoneNumber,
    changePhonePassword,
    changePhoneError,
    isChangingPhone,
    handleCodeChange,
    handleCodeComplete,
    handleVerify,
    handleResendCode,
    handleBack,
    handleOpenChangePhone,
    handleCancelChangePhone,
    handleNewPhoneNumberChange,
    handleChangePhonePasswordChange,
    handleSubmitPhoneChange,
  };
};
