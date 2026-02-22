import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ScreenWrapper from '@/components/wrappers/ScreenWrapper';
import CustomInput from '@/components/shared/CustomInput';
import CustomButton from '@/components/shared/CustomButton';
import { useForgotPasswordScreen } from './useForgotPasswordScreen';
import styles from './forgot-password/styles';
import { Colors } from '@/constants';

const { height: screenHeight } = Dimensions.get('window');

const ForgotPasswordScreen = () => {
  const {
    email,
    isLoading,
    error,
    handleEmailChange,
    handleSubmit,
  } = useForgotPasswordScreen();

  return (
    <ScreenWrapper
      contentBackgroundColor="#fff"
      contentContainerStyle={{ minHeight: screenHeight - 120 }}
    >
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.title}>FORGOT PASSWORD?</Text>
        <Text style={styles.instructions}>
          Enter your email below to reset your password.
        </Text>

        <View style={styles.formContainer}>

          <CustomInput
            label="Email Address:"
            value={email}
            onChangeText={handleEmailChange}
            placeholder="name@gmail.com"
            type='email'
            keyboardType="email-address"
            labelColor="#333"
            inputBorderColor="#2D1B69"
            inputTextColor={Colors.brandBlueBright}
            editable={!isLoading}
            error={!!error}
            errorMessage={error}
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

