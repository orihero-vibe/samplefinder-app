import { useState, useRef, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { sendPasswordRecoveryOTP } from '@/lib/auth';
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
  const userId = route?.params?.userId;
  const maskedEmail = maskEmail(email);
  
  const [step, setStep] = useState<'code' | 'password'>('code'); // Two steps: code verification, then password
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60); // 60 seconds countdown
  const [canResend, setCanResend] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const codeInputRef = useRef<CodeInputRef>(null);

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

    if (!email) {
      setError('Email address is missing. Please start over.');
      setTimeout(() => {
        navigation.replace('ForgotPassword', {});
      }, 2000);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('[PasswordReset] Verifying recovery code...');
      // For now, we'll move to password step
      // The actual verification happens when we update the password
      // Appwrite's updateRecovery will verify the secret
      setStep('password');
      console.log('[PasswordReset] Code accepted, moving to password step');
    } catch (error: any) {
      console.error('[PasswordReset] Code verification error:', error);
      setError(error?.message || 'Invalid code. Please try again.');
      setCode('');
      codeInputRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
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
      
      // Reset timer after successful resend
      setResendTimer(60);
      setCanResend(false);
      
      // Update userId if we got a new one
      if (newUserId && !userId) {
        // Note: We can't update route params, but we can store it in state
        // For now, we'll use the userId we have or the new one
      }
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

    setIsLoading(true);
    setError('');

    try {
      if (!userId) {
        throw new Error('User ID is missing. Please start over.');
      }

      console.log('[PasswordReset] Resetting password with OTP verification...');
      console.log('[PasswordReset] UserId:', userId);
      console.log('[PasswordReset] Code length:', code.length);
      
      // Import auth function
      const { verifyEmailAndResetPassword } = await import('@/lib/auth');

      // Verify OTP and reset password using backend function
      // The backend handles OTP verification and password update with server-side permissions
      // No client-side session is created, avoiding permission issues
      console.log('[PasswordReset] Verifying OTP and resetting password...');
      await verifyEmailAndResetPassword(userId, code, password);
      console.log('[PasswordReset] Password reset successfully');
      
      // Show success modal
      setShowSuccessModal(true);
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

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigation.replace('Login', undefined);
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
    showSuccessModal,
    codeInputRef,
    handleCodeChange,
    handleCodeComplete,
    handlePasswordChange,
    handleVerifyCode,
    handleResendCode,
    handleCreatePassword,
    handleBackToCode,
    handleSuccessModalClose,
  };
};

