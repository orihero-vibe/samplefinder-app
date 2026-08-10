// samplefinder-app/src/screens/auth/ConfirmPhoneScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Monicon } from '@monicon/native';
import ScreenWrapper from '@/components/wrappers/ScreenWrapper';
import CustomButton from '@/components/shared/CustomButton';
import CodeInput from '@/components/shared/CodeInput';
import ChangePhoneNumberModal from '@/components/shared/ChangePhoneNumberModal';
import { Colors } from '@/constants/Colors';
import { useConfirmPhoneScreen } from './useConfirmPhoneScreen';
import styles from './confirm-account/styles';

/**
 * Shown in full, not masked. This is the user's own number, typed moments ago,
 * and spotting a typo here is the entire purpose of the line — a mask that hides
 * the first six digits hides exactly where mistakes happen.
 */
const formatUsPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  const local = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  if (local.length !== 10) return phone;
  return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
};

const ConfirmPhoneScreen = () => {
  const {
    code,
    phoneNumber,
    isLoading,
    isResending,
    isLeaving,
    resendTimer,
    canResend,
    error,
    codeInputRef,
    showChangePhone,
    newPhoneNumber,
    changePhonePassword,
    changePhoneError,
    isChangingPhone,
    handleCodeChange,
    handleCodeComplete,
    handleVerify,
    handleResendCode,
    handleBack,
    handleOpenChangePhone,
    handleCancelChangePhone,
    handleNewPhoneNumberChange,
    handleChangePhonePasswordChange,
    handleSubmitPhoneChange,
  } = useConfirmPhoneScreen();

  const backDisabled = isLoading || isLeaving;
  const changeNumberDisabled = isLoading || isLeaving || isResending || isChangingPhone;

  return (
    <ScreenWrapper
      contentBackgroundColor="#fff"
      contentContainerStyle={styles.wrapperContent}
      expandMainContent
      headerLeft={
        <TouchableOpacity
          onPress={handleBack}
          style={styles.headerBackButton}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={backDisabled}
        >
          {isLeaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Monicon name="mdi:arrow-left" size={22} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      }
    >
      <StatusBar style="light" />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>VERIFY PHONE</Text>

        {phoneNumber ? (
          <>
            <Text style={styles.instruction}>We've sent a verification code by text to:</Text>
            <Text style={[styles.emailText, localStyles.phoneNumberText]}>
              {formatUsPhone(phoneNumber)}
            </Text>

            {/*
              Same prompt-plus-action row the signup screen uses for "Have an
              account? Sign In" — the app's existing idiom for a secondary
              action, so this needs no visual language of its own.
            */}
            <TouchableOpacity
              onPress={handleOpenChangePhone}
              disabled={changeNumberDisabled}
              style={localStyles.changeNumberContainer}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Change phone number"
              accessibilityState={{ disabled: changeNumberDisabled }}
            >
              <Text
                style={[
                  localStyles.changeNumberPrompt,
                  changeNumberDisabled && localStyles.changeNumberDisabled,
                ]}
              >
                Wrong number?{' '}
              </Text>
              <Text
                style={[
                  localStyles.changeNumberAction,
                  changeNumberDisabled && localStyles.changeNumberDisabled,
                ]}
              >
                Change it
              </Text>
            </TouchableOpacity>

            <Text style={styles.instruction}>Enter your code below:</Text>
          </>
        ) : (
          <Text style={styles.instruction}>Sending your verification code...</Text>
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
            disabled={code.length !== 6 || isLoading}
          />
        </View>

        <TouchableOpacity
          onPress={handleResendCode}
          style={styles.resendContainer}
          disabled={!canResend || isResending || isLoading}
        >
          {isResending ? (
            <View style={styles.resendLoadingContainer}>
              <ActivityIndicator size="small" color="#999" />
              <Text style={[styles.resendText, styles.resendLoadingText]}>Sending...</Text>
            </View>
          ) : (
            <Text style={[styles.resendText, !canResend && styles.resendTextDisabled]}>
              {resendTimer > 0 ? `Resend code (${resendTimer}s)` : 'Resend code'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ChangePhoneNumberModal
        visible={showChangePhone}
        phoneNumber={newPhoneNumber}
        password={changePhonePassword}
        onChangePhoneNumber={handleNewPhoneNumberChange}
        onChangePassword={handleChangePhonePasswordChange}
        onSubmit={handleSubmitPhoneChange}
        onCancel={handleCancelChangePhone}
        errorMessage={changePhoneError}
        isLoading={isChangingPhone}
      />
    </ScreenWrapper>
  );
};

const localStyles = StyleSheet.create({
  // styles.emailText is shared with ConfirmAccountScreen, so the tighter gap to
  // the action below it is applied here rather than edited at the source.
  phoneNumberText: {
    marginBottom: 4,
  },
  changeNumberContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  changeNumberPrompt: {
    fontSize: 16,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.grayText,
  },
  changeNumberAction: {
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.grayText,
  },
  // Matches styles.resendTextDisabled, the screen's existing disabled treatment.
  changeNumberDisabled: {
    color: '#CCC',
  },
});

export default ConfirmPhoneScreen;
