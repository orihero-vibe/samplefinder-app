import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ScreenWrapper from '@/components/wrappers/ScreenWrapper';
import CustomButton from '@/components/shared/CustomButton';
import CustomInput from '@/components/shared/CustomInput';
import CodeInput from '@/components/shared/CodeInput';
import { usePasswordResetScreen } from './usePasswordResetScreen';
import styles from './password-reset/styles';

const PasswordResetScreen = () => {
  const {
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
  } = usePasswordResetScreen();

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
            <Text style={styles.instruction}>
              We've sent your code to {maskedEmail}.{'\n'}
              Enter your code below:
            </Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <CodeInput
              ref={codeInputRef}
              length={6}
              value={code}
              onChangeText={handleCodeChange}
              onCodeComplete={handleCodeComplete}
            />

            <View style={styles.buttonContainer}>
              <CustomButton
                title={isLoading ? 'Verifying...' : 'Verify'}
                onPress={() => handleVerifyCode(code)}
                variant="dark"
                disabled={code.length !== 6 || isLoading || !email}
              />
            </View>

            <View style={styles.didntGetCodeContainer}>
              <Text style={styles.didntGetCodeTitle}>Didn't get a code?</Text>
              <Text style={styles.didntGetCodeText}>
                Please check your SMS messages before{'\n'}requesting another code.
              </Text>
            </View>

            <TouchableOpacity 
              onPress={handleResendCode} 
              style={[
                styles.resendButton,
                (!canResend || isResending || isLoading) && styles.resendButtonDisabled
              ]}
              disabled={!canResend || isResending || isLoading}
            >
              {isResending ? (
                <View style={styles.resendLoadingContainer}>
                  <ActivityIndicator size="small" color="#2D1B69" />
                  <Text style={[styles.resendButtonText, { marginLeft: 8 }]}>Sending...</Text>
                </View>
              ) : (
                <Text style={[
                  styles.resendButtonText,
                  (!canResend && !isResending) && styles.resendButtonTextDisabled
                ]}>
                  {canResend ? 'Resend Code' : `Resend Code (${resendTimer}s)`}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.needHelpContainer}
              onPress={() => Linking.openURL('https://samplefinder.com/support')}
              activeOpacity={0.7}
            >
              <Text style={styles.needHelpText}>Need help?</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.instruction}>
              Almost there!{'\n'}
              For your security, please change your password to something you haven't used before.
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
                onChangeText={handlePasswordChange}
                placeholder=""
                secureTextEntry={true}
                showPasswordToggle={true}
                labelColor="#666"
                editable={!isLoading}
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
                  disabled={isLoading || !password}
                />
              </View>
            </View>
          </>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default PasswordResetScreen;
