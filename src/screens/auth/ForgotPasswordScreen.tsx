import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import ScreenWrapper from '@/components/wrappers/ScreenWrapper';
import CustomInput from '@/components/shared/CustomInput';
import CustomButton from '@/components/shared/CustomButton';
import { createPasswordRecovery } from '@/lib/auth';

type ForgotPasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = ({ navigation, route }: ForgotPasswordScreenProps) => {
  const initialEmail = route?.params?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Update email if route params change (when navigating from LoginScreen with email)
  useEffect(() => {
    const emailFromParams = route?.params?.email;
    if (emailFromParams && emailFromParams.trim()) {
      console.log('[ForgotPassword] Pre-filling email from route params:', emailFromParams);
      setEmail(emailFromParams.trim());
    }
  }, [route?.params?.email]);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('[ForgotPassword] Sending password recovery email to:', email);
      const userId = await createPasswordRecovery(email.trim());
      console.log('[ForgotPassword] Password recovery email sent successfully');
      
      // Navigate to password reset screen with email and userId (if available)
      navigation.navigate('PasswordReset', { 
        email: email.trim(),
        userId: userId || undefined,
      });
    } catch (error: any) {
      console.error('[ForgotPassword] Error sending recovery email:', error);
      const errorMsg = error?.message || 'Failed to send recovery email. Please try again.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper contentBackgroundColor="#fff">
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.title}>FORGOT PASSWORD?</Text>
        <Text style={styles.instructions}>
          Enter your email below to reset your password.
        </Text>

        <View style={styles.formContainer}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <CustomInput
            label="Email Address:"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError(''); // Clear error when user types
            }}
            placeholder="name@gmail.com"
            keyboardType="email-address"
            labelColor="#333"
            inputBorderColor="#2D1B69"
            editable={!isLoading}
          />

          <View style={styles.buttonContainer}>
            <CustomButton
              title={isLoading ? 'Sending...' : 'Submit'}
              onPress={handleSubmit}
              variant="dark"
              disabled={isLoading || !email.trim()}
            />
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Quicksand_700Bold',
    color: '#2D1B69',
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  instructions: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  formContainer: {
    width: '100%',
  },
  buttonContainer: {
    marginTop: 8,
  },
  errorContainer: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: '#FF6B6B',
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen;

