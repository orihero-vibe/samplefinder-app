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
import CodeInput from '@/components/shared/CodeInput';
import { useConfirmAccountScreen } from './useConfirmAccountScreen';
import styles from './confirm-account/styles';

const ConfirmAccountScreen = () => {
  const {
    code,
    email,
    isLoading,
    isResending,
    error,
    codeInputRef,
    handleCodeChange,
    handleCodeComplete,
    handleVerify,
    handleResendCode,
  } = useConfirmAccountScreen();

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
          onChangeText={handleCodeChange}
          onCodeComplete={handleCodeComplete}
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

export default ConfirmAccountScreen;

