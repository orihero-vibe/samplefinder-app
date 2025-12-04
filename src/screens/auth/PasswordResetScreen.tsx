import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ScreenWrapper from '@/components/wrappers/ScreenWrapper';
import CustomButton from '@/components/shared/CustomButton';
import CustomInput from '@/components/shared/CustomInput';
import CodeInput, { CodeInputRef } from '@/components/shared/CodeInput';
import { updatePasswordRecovery, createPasswordRecovery } from '@/lib/auth';

const PasswordResetScreen = ({ navigation, route }: any) => {
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
      setError(error?.message || 'Failed to resend recovery code. Please try again.');
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

  return (
    <ScreenWrapper 
      contentBackgroundColor="#fff"
      contentContainerStyle={styles.wrapperContent}
    >
      <StatusBar style="light" />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>PASSWORD RESET</Text>
        
        {step === 'code' ? (
          <>
            {email ? (
              <>
                <Text style={styles.instruction}>
                  We've sent a recovery code to:
                </Text>
                <Text style={styles.emailText}>{email}</Text>
                <Text style={styles.instruction}>
                  Enter the code below:
                </Text>
              </>
            ) : (
              <Text style={styles.instruction}>
                Please enter the recovery code sent to your email:
              </Text>
            )}

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <CodeInput
              ref={codeInputRef}
              length={6}
              value={code}
              onChangeText={(text) => {
                setCode(text);
                setError(''); // Clear error when user types
              }}
              onCodeComplete={(completedCode) => {
                console.log('Code completed:', completedCode);
                // Auto-submit when code is complete
                if (completedCode.length === 6 && !isLoading) {
                  handleVerifyCode();
                }
              }}
            />

            <View style={styles.buttonContainer}>
              <CustomButton
                title={isLoading ? 'Verifying...' : 'Verify Code'}
                onPress={handleVerifyCode}
                variant="dark"
                disabled={code.length !== 6 || isLoading || !email}
              />
            </View>

            <TouchableOpacity 
              onPress={handleResendCode} 
              style={styles.resendContainer}
              disabled={isResending || isLoading}
            >
              {isResending ? (
                <View style={styles.resendLoadingContainer}>
                  <ActivityIndicator size="small" color="#999" />
                  <Text style={[styles.resendText, styles.resendLoadingText]}>Sending...</Text>
                </View>
              ) : (
                <Text style={styles.resendText}>Resend code</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.instruction}>
              Almost there! For your security, please change your password to something you haven't used before.
            </Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.formContainer}>
              <CustomInput
                label="Create Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError(''); // Clear error when user types
                }}
                placeholder=""
                secureTextEntry={!showPassword}
                showPasswordToggle={true}
                onTogglePassword={() => setShowPassword(!showPassword)}
                variant="underline"
                labelColor="#666"
                editable={!isLoading}
              />

              <CustomInput
                label="Confirm Password"
                value={passwordAgain}
                onChangeText={(text) => {
                  setPasswordAgain(text);
                  setError(''); // Clear error when user types
                }}
                placeholder=""
                secureTextEntry={!showPasswordAgain}
                showPasswordToggle={true}
                onTogglePassword={() => setShowPasswordAgain(!showPasswordAgain)}
                variant="underline"
                labelColor="#666"
                editable={!isLoading}
                style={styles.confirmPasswordInput}
              />

              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementText}>• minimum of 8 characters</Text>
                <Text style={styles.requirementText}>• may not include username</Text>
                <Text style={styles.requirementText}>• must include at least 1 Uppercase</Text>
                <Text style={styles.requirementText}>• must include at least 1 lowercase</Text>
                <Text style={styles.requirementText}>• must include 1 number</Text>
                <Text style={styles.requirementText}>• must include at least 1 special character</Text>
              </View>

              <View style={styles.buttonContainer}>
                <CustomButton
                  title={isLoading ? 'Resetting...' : 'Create Password'}
                  onPress={handleCreatePassword}
                  variant="dark"
                  disabled={isLoading || !password || !passwordAgain}
                />
              </View>

              <TouchableOpacity 
                onPress={() => {
                  setStep('code');
                  setPassword('');
                  setPasswordAgain('');
                  setError('');
                }}
                style={styles.backButton}
                disabled={isLoading}
              >
                <Text style={styles.backButtonText}>← Back to code entry</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  wrapperContent: {
    paddingHorizontal: 30,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Quicksand_700Bold',
    color: '#2D1B69',
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  instruction: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
  },
  requirementsContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  requirementText: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: '#999',
    marginBottom: 8,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
  },
  confirmPasswordInput: {
    marginTop: 16,
  },
  errorContainer: {
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: '#FF6B6B',
    textAlign: 'center',
  },
  emailText: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#2D1B69',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  resendContainer: {
    marginTop: 8,
  },
  resendText: {
    fontSize: 16,
    fontFamily: 'Quicksand_500Medium',
    color: '#999',
    textAlign: 'center',
  },
  resendLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  resendLoadingText: {
    marginLeft: 8,
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Quicksand_500Medium',
    color: '#666',
    textAlign: 'center',
  },
});

export default PasswordResetScreen;

