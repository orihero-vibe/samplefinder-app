import { useState, useRef, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Alert } from 'react-native';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { updatePasswordRecovery, createPasswordRecovery } from '@/lib/auth';
import { CodeInputRef } from '@/components/shared/CodeInput';

type PasswordResetScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PasswordReset'>;
type PasswordResetScreenRouteProp = RouteProp<RootStackParamList, 'PasswordReset'>;

export const usePasswordResetScreen = () => {
  const navigation = useNavigation<PasswordResetScreenNavigationProp>();
  const route = useRoute<PasswordResetScreenRouteProp>();
  const email = route?.params?.email || '';
  const userId = route?.params?.userId;
  
  const [step, setStep] = useState<'code' | 'password'>('code'); // Two steps: code verification, then password
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordAgain, setShowPasswordAgain] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
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

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    if (!email) {
      setError('Email address is missing. Please start over.');
      setTimeout(() => {
        navigation.replace('ForgotPassword');
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

    setIsResending(true);
    setError('');
    setCode('');

    try {
      console.log('[PasswordReset] Resending recovery email...');
      const newUserId = await createPasswordRecovery(email);
      console.log('[PasswordReset] Recovery email resent successfully');
      setError(''); // Clear any previous errors
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
    // Validate passwords
    if (!password) {
      setError('Please enter a password');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== passwordAgain) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    if (!email) {
      setError('Email address is missing. Please start over.');
      setTimeout(() => {
        navigation.replace('ForgotPassword');
      }, 2000);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('[PasswordReset] Updating password with recovery code...');
      await updatePasswordRecovery(code, password, passwordAgain, userId);
      console.log('[PasswordReset] Password updated successfully');
      
      // Navigate to login screen
      Alert.alert(
        'Success',
        'Your password has been reset successfully. Please log in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.replace('Login');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('[PasswordReset] Password update error:', error);
      const errorMsg = error?.message || 'Failed to reset password. Please try again.';
      setError(errorMsg);
      
      // If the code is invalid/expired, go back to code step
      if (errorMsg.includes('Invalid') || errorMsg.includes('expired')) {
        setStep('code');
        setCode('');
        setPassword('');
        setPasswordAgain('');
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
    // Auto-submit when code is complete
    if (completedCode.length === 6 && !isLoading) {
      handleVerifyCode();
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setError(''); // Clear error when user types
  };

  const handlePasswordAgainChange = (text: string) => {
    setPasswordAgain(text);
    setError(''); // Clear error when user types
  };

  const handleBackToCode = () => {
    setStep('code');
    setPassword('');
    setPasswordAgain('');
    setError('');
  };

  return {
    email,
    step,
    code,
    password,
    passwordAgain,
    showPassword,
    showPasswordAgain,
    isLoading,
    isResending,
    error,
    codeInputRef,
    handleCodeChange,
    handleCodeComplete,
    handlePasswordChange,
    handlePasswordAgainChange,
    handleTogglePassword: () => setShowPassword(!showPassword),
    handleTogglePasswordAgain: () => setShowPasswordAgain(!showPasswordAgain),
    handleVerifyCode,
    handleResendCode,
    handleCreatePassword,
    handleBackToCode,
  };
};

