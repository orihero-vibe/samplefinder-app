import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import ScreenWrapper from '@/components/wrappers/ScreenWrapper';
import CustomButton from '@/components/shared/CustomButton';
import CodeInput, { CodeInputRef } from '@/components/shared/CodeInput';
import { getCurrentUser, verifyEmail, sendEmailOTP, resendVerificationEmail, logout } from '@/lib/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'ConfirmAccount'>;

const ConfirmAccountScreen = ({ navigation, route }: Props) => {
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
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

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

  return (
    <ScreenWrapper 
      contentBackgroundColor="#fff"
      contentContainerStyle={styles.wrapperContent}
    >
      <StatusBar style="light" />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>CONFIRM ACCOUNT</Text>
        
        {email ? (
          <>
            <Text style={styles.instruction}>
              We've sent your verification code to:
            </Text>
            <Text style={styles.emailText}>{email}</Text>
            <Text style={styles.instruction}>
              Enter your code below:
            </Text>
          </>
        ) : (
          <Text style={styles.instruction}>
            Loading your email address...
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
              handleVerify();
            }
          }}
          editable={!isLoading}
        />

        <View style={styles.buttonContainer}>
          <CustomButton
            title={isLoading ? 'Verifying...' : 'Verify'}
            onPress={handleVerify}
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
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Quicksand_700Bold',
    color: '#2D1B69',
    textAlign: 'center',
    marginBottom: 24,
    textTransform: 'uppercase',
  },
  instruction: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  emailText: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#2D1B69',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 4,
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
  buttonContainer: {
    width: '100%',
    marginTop: 20,
    marginBottom: 16,
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
});

export default ConfirmAccountScreen;

