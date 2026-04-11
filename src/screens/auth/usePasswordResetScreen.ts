import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/AppNavigator';
import {
  login,
  logout,
  sendPasswordRecoveryOTP,
  updatePassword,
  verifyEmailAndResetPassword,
} from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';
import { CodeInputRef } from '@/components/shared/CodeInput';

type PasswordResetScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PasswordReset'>;
type PasswordResetScreenRouteProp = RouteProp<RootStackParamList, 'PasswordReset'>;

// Utility function to mask email for privacy
const maskEmail = (email: string): string => {
  if (!email) return '***@***.***';
  
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return '***@***.***';
  
  // Show first 2-3 characters of local part
  const visibleLocal = localPart.slice(0, Math.min(3, localPart.length));
  const maskedLocal = visibleLocal + '***';
  
  // Show domain with masking
  const domainParts = domain.split('.');
  const maskedDomain = domainParts.length > 1 
    ? `***${domainParts[domainParts.length - 1]}` 
    : '***';
  
  return `${maskedLocal}@${maskedDomain}`;
};

/** Random password satisfying the same rules as `validatePassword` (for OTP-only backend call). */
const generateStagingPassword = (): string => {
  const pick = (chars: string) => chars[Math.floor(Math.random() * chars.length)];
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%&*';
  const pool = upper + lower + digits + special;
  for (let attempt = 0; attempt < 12; attempt++) {
    let pwd = pick(upper) + pick(lower) + pick(digits) + pick(special);
    for (let i = 0; i < 18; i++) pwd += pick(pool);
    if (
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /[0-9]/.test(pwd) &&
      /[^A-Za-z0-9]/.test(pwd)
    ) {
      return pwd;
    }
  }
  return 'Zq9!mPx7vLw2nRt4';
};

export const usePasswordResetScreen = () => {
  const navigation = useNavigation<PasswordResetScreenNavigationProp>();
  const route = useRoute<PasswordResetScreenRouteProp>();
  const email = route?.params?.email || '';
  const initialUserId = route?.params?.userId;
  const maskedEmail = maskEmail(email);

  // Keep userId in state so that after Resend we use the latest (same user, but ensures we're in sync with the OTP just sent)
  const [userId, setUserId] = useState<string | undefined>(initialUserId);
  const effectiveUserId = userId ?? initialUserId;

  const [step, setStep] = useState<'code' | 'password'>('code'); // Two steps: code verification, then password
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60); // 60 seconds countdown
  const [canResend, setCanResend] = useState(false);
  const codeInputRef = useRef<CodeInputRef>(null);
  /** Set after successful OTP + staging reset; used only for `updatePassword` on step 2 (never shown in UI). */
  const stagingPasswordRef = useRef<string | null>(null);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Login');
  };

  // Sync from route when it becomes available on initial load only
  useEffect(() => {
    if (initialUserId) setUserId((prev) => prev ?? initialUserId);
  }, [initialUserId]);

  useEffect(() => {
    // Focus code input when screen mounts
    if (step === 'code') {
      const timer = setTimeout(() => {
        codeInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendTimer > 0 && step === 'code') {
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
  }, [resendTimer, step]);

  // Password validation
  const validatePassword = useCallback((pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must include at least 1 uppercase letter';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must include at least 1 lowercase letter';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must include at least 1 number';
    }
    if (!/[^A-Za-z0-9]/.test(pwd)) {
      return 'Password must include at least 1 special character';
    }
    return null;
  }, []);

  const handleVerifyCode = async (codeToVerify?: string) => {
    const verificationCode = codeToVerify || code;

    if (verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    if (!/^[0-9]{6}$/.test(verificationCode)) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    if (!email) {
      setError('Email address is missing. Please start over.');
      setTimeout(() => {
        navigation.replace('ForgotPassword', {});
      }, 2000);
      return;
    }

    if (!effectiveUserId) {
      setError('User information is missing. Please start over.');
      setTimeout(() => {
        navigation.replace('ForgotPassword', {});
      }, 2000);
      return;
    }

    // Backend requires userId + otp + newPassword together. We set a random staging password, verify OTP,
    // then sign in with staging so step 2 can call `updatePassword` to the user's real password.
    setIsLoading(true);
    setError('');
    stagingPasswordRef.current = null;

    const staging = generateStagingPassword();
    let otpVerified = false;

    try {
      await verifyEmailAndResetPassword(effectiveUserId, verificationCode, staging);
      otpVerified = true;
      await login({ email, password: staging });
    } catch (err: any) {
      console.error('[PasswordReset] Verify / login error:', err);
      stagingPasswordRef.current = null;
      if (!otpVerified) {
        setError(
          err?.message ||
            'Invalid or expired code. Please check your email and try again.',
        );
      } else {
        try {
          await logout();
        } catch {
          // ignore
        }
        useAuthStore.getState().clearUser();
        setError(
          'Verification succeeded, but sign-in failed. Request a new code below, or start Forgot password again from the login screen.',
        );
        setStep('code');
        setCode('');
      }
      return;
    } finally {
      setIsLoading(false);
    }

    stagingPasswordRef.current = staging;
    setStep('password');
    setCode('');
    useAuthStore.getState().fetchUser().catch(() => {
      /* non-blocking */
    });
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Email address is missing. Please start over.');
      return;
    }

    if (!canResend) {
      return; // Don't allow resend if timer hasn't expired
    }

    setIsResending(true);
    setError('');
    setCode('');
    stagingPasswordRef.current = null;

    try {
      console.log('[PasswordReset] Resending recovery email...');
      const newUserId = await sendPasswordRecoveryOTP(email);
      console.log('[PasswordReset] Recovery email resent successfully, userId:', newUserId);
      setError(''); // Clear any previous errors
      if (newUserId) setUserId(newUserId);
      // Reset timer after successful resend
      setResendTimer(60);
      setCanResend(false);
    } catch (error: any) {
      console.error('[PasswordReset] Resend error:', error);
      const errorMsg = error?.message || 'Failed to resend recovery code. Please try again.';
      setError(errorMsg);
    } finally {
      setIsResending(false);
    }
  };

  const handleCreatePassword = async () => {
    // Validate password
    if (!password) {
      setError('Please enter a password');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (!email) {
      setError('Email address is missing. Please start over.');
      setTimeout(() => {
        navigation.replace('ForgotPassword', {});
      }, 2000);
      return;
    }

    if (!effectiveUserId) {
      setError('User information is missing. Please start over.');
      setTimeout(() => {
        navigation.replace('ForgotPassword', {});
      }, 2000);
      return;
    }

    const staging = stagingPasswordRef.current;
    if (!staging) {
      setError('Please verify your code first.');
      setStep('code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await updatePassword(staging, password, password);
      stagingPasswordRef.current = null;
      await useAuthStore.getState().fetchUser();
      setUserId(undefined);
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error: any) {
      console.error('[PasswordReset] Password update error:', error);
      const errorMsg = error?.message || 'Failed to reset password. Please try again.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (text: string) => {
    setCode(text);
    setError(''); // Clear error when user types
  };

  const handleCodeComplete = (completedCode: string) => {
    console.log('Code completed:', completedCode);
    // Clear any previous errors when code is complete
    setError('');
    // Don't auto-submit - user should manually tap Verify button
    // This gives them time to review the code before submitting
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setError(''); // Clear error when user types
  };

  const handleBackToCode = async () => {
    stagingPasswordRef.current = null;
    try {
      await logout();
    } catch {
      // ignore
    }
    useAuthStore.getState().clearUser();
    setStep('code');
    setPassword('');
    setCode('');
    setError('');
  };

  return {
    email,
    maskedEmail,
    step,
    code,
    password,
    isLoading,
    isResending,
    error,
    resendTimer,
    canResend,
    codeInputRef,
    handleBack,
    handleCodeChange,
    handleCodeComplete,
    handlePasswordChange,
    handleVerifyCode,
    handleResendCode,
    handleCreatePassword,
    handleBackToCode,
  };
};

