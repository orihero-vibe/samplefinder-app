import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
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
    handleTogglePassword,
    handleTogglePasswordAgain,
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
              onChangeText={handleCodeChange}
              onCodeComplete={handleCodeComplete}
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
                onChangeText={handlePasswordChange}
                placeholder=""
                secureTextEntry={!showPassword}
                showPasswordToggle={true}
                onTogglePassword={handleTogglePassword}
                variant="underline"
                labelColor="#666"
                editable={!isLoading}
              />

              <CustomInput
                label="Confirm Password"
                value={passwordAgain}
                onChangeText={handlePasswordAgainChange}
                placeholder=""
                secureTextEntry={!showPasswordAgain}
                showPasswordToggle={true}
                onTogglePassword={handleTogglePasswordAgain}
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
                onPress={handleBackToCode}
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

export default PasswordResetScreen;
