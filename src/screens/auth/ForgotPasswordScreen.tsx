import React from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ScreenWrapper from '@/components/wrappers/ScreenWrapper';
import CustomInput from '@/components/shared/CustomInput';
import CustomButton from '@/components/shared/CustomButton';
import { useForgotPasswordScreen } from './useForgotPasswordScreen';
import styles from './forgot-password/styles';

const ForgotPasswordScreen = () => {
  const {
    email,
    isLoading,
    error,
    handleEmailChange,
    handleSubmit,
  } = useForgotPasswordScreen();

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
            onChangeText={handleEmailChange}
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

export default ForgotPasswordScreen;

