import { useState, useRef, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { login, sendPasswordRecoveryOTP, verifyEmailAndResetPassword } from '@/lib/auth';
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
  const validatePassword = (pwd: string): string | null => {
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
  };

  const handleVerifyCode = async (codeToVerify?: string) => {
    // Use the provided code or fall back to state
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

    // For password reset, we don't need to create a session when verifying the OTP.
    // The actual OTP verification happens in verifyEmailAndResetPassword when the user submits a new password.
    // Here we only validate the code format and move to the password step.
    setIsLoading(false);
    setError('');
    console.log(
      '[PasswordReset] Code validated locally, proceeding to password step. OTP will be verified during password reset.'
    );
    setStep('password');
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

    if (code.length !== 6) {
      setError('Please enter the 6-digit code sent to your email.');
      setStep('code');
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

    setIsLoading(true);
    setError('');

    try {
      console.log('[PasswordReset] Verifying OTP and resetting password via backend...');
      console.log('[PasswordReset] UserId:', effectiveUserId);
      console.log('[PasswordReset] Code length:', code.length);

      // Backend validates the OTP (including expiry) and updates the password atomically
      await verifyEmailAndResetPassword(effectiveUserId, code, password);
      console.log('[PasswordReset] Password reset successfully');

      try {
        await login({ email, password });
        setUserId(undefined);
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } catch {
        navigation.replace('Login', undefined);
      }
    } catch (error: any) {
      console.error('[PasswordReset] Password update error:', error);
      const errorMsg = error?.message || 'Failed to reset password. Please try again.';
      setError(errorMsg);
      
      // If the code is invalid/expired, go back to code step
      if (errorMsg.includes('Invalid') || errorMsg.includes('expired') || errorMsg.includes('token')) {
        setStep('code');
        setCode('');
        setPassword('');
      }
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

  const handleBackToCode = () => {
    setStep('code');
    setPassword('');
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
    handleCodeChange,
    handleCodeComplete,
    handlePasswordChange,
    handleVerifyCode,
    handleResendCode,
    handleCreatePassword,
    handleBackToCode,
  };
};

