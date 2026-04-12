import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Monicon } from '@monicon/native';
import ScreenWrapper from '@/components/wrappers/ScreenWrapper';
import CustomInput from '@/components/shared/CustomInput';
import CustomButton from '@/components/shared/CustomButton';
import { useForgotPasswordScreen } from './useForgotPasswordScreen';
import styles from './forgot-password/styles';
import { Colors } from '@/constants';

const ForgotPasswordScreen = () => {
  const {
    email,
    isLoading,
    error,
    handleEmailChange,
    handleBack,
    handleSubmit,
  } = useForgotPasswordScreen();

  return (
    <ScreenWrapper
      contentBackgroundColor="#fff"
      contentContainerStyle={styles.screenContent}
      expandMainContent
      headerLeft={
        <TouchableOpacity
          onPress={handleBack}
          style={styles.headerBackButton}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Monicon name="mdi:arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      }
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
            labelColor={Colors.pinBlueBlack}
            inputBorderColor={Colors.brandBlueBright}
            inputBorderWidth={2}
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

