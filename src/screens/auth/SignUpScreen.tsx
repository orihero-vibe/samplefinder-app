import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ScreenWrapper from '@/components/wrappers/ScreenWrapper';
import CustomInput from '@/components/shared/CustomInput';
import CustomButton from '@/components/shared/CustomButton';
import { useSignUpScreen } from './useSignUpScreen';
import { AgeVerificationModal, TermsModal, PrivacyModal, PushNotificationModal, PhoneConfirmModal } from './signup/components';
import ErrorModal from '@/components/shared/ErrorModal';
import styles from './signup/styles';
import { Colors } from '@/constants/Colors';
import { Monicon } from '@monicon/native';

const signUpFieldProps = {
  labelColor: Colors.pinBlueBlack,
  inputBorderColor: Colors.brandBlueBright,
  inputTextColor: Colors.blueColorMode,
  placeholderTextColor: Colors.grayText,
  inputBorderWidth: 2,
} as const;

const SignUpScreen = () => {
  const {
    firstName,
    lastName,
    phoneNumber,
    zipCode,
    dateOfBirth,
    username,
    email,
    password,
    referralCode,
    fieldErrors,
    passwordChecks,
    isCheckingUsername,
    showError,
    showPushNotificationModal,
    showAgeVerificationModal,
    showPhoneConfirmModal,
    showAgeRestrictionModal,
    ageRestrictionMessage,
    showTermsModal,
    showPrivacyModal,
    smsConsent,
    toggleSmsConsent,
    isLoading,
    errorMessage,
    isFormValid,
    setFirstName,
    setLastName,
    setPhoneNumber,
    setZipCode,
    setDateOfBirth,
    setUsername,
    setEmail,
    setPassword,
    setReferralCode,
    setShowPushNotificationModal,
    setShowAgeVerificationModal,
    setShowAgeRestrictionModal,
    setShowTermsModal,
    setShowPrivacyModal,
    handleSignIn,
    handlePushNotificationEnable,
    handlePushNotificationNotNow,
    handleAgeVerificationAccept,
    handleAgeVerificationDismiss,
    handleTermsAccept,
    handleTermsLinkPress,
    handlePrivacyLinkPress,
    handlePrivacyAccept,
    handleSignUp,
    handleConfirmPhoneNumber,
    handleEditPhoneNumber,
    handleBack,
  } = useSignUpScreen();

  return (
    <ScreenWrapper
      contentBackgroundColor={Colors.white}
      contentContainerStyle={styles.contentContainer}
      footerPaddingBottom={40}
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
      <StatusBar style="light" />
      <Text style={styles.title}>GET STARTED!</Text>

      <View style={styles.formContainer}>
        <View style={styles.nameRow}>
          <CustomInput
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            type="text"
            {...signUpFieldProps}
            error={!!fieldErrors.firstName}
            containerStyle={styles.nameInput}
          />

          <CustomInput
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            type="text"
            {...signUpFieldProps}
            error={!!fieldErrors.lastName}
            containerStyle={styles.nameInput}
          />
        </View>

        <CustomInput
          label="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          type="phone"
          {...signUpFieldProps}
          error={!!fieldErrors.phoneNumber}
          errorMessage={fieldErrors.phoneNumber}
        />

        <CustomInput
          label="Date Of Birth"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          type="date"
          {...signUpFieldProps}
          helpIcon={true}
          helpIconVariant="outlined"
          onHelpPress={() => setShowAgeVerificationModal(true)}
          error={!!fieldErrors.dateOfBirth}
          errorMessage={fieldErrors.dateOfBirth}
        />

        <CustomInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          type="text"
          {...signUpFieldProps}
          error={!!fieldErrors.username}
          errorMessage={fieldErrors.username}
        />

        <CustomInput
          label="Zip Code"
          value={zipCode}
          onChangeText={setZipCode}
          type="numeric"
          {...signUpFieldProps}
          error={!!fieldErrors.zipCode}
          placeholder="#####"
          maxLength={5}
          containerStyle={styles.zipCodeContainer}
        />

        <CustomInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          type="email"
          {...signUpFieldProps}
          error={!!fieldErrors.email}
        />

        <CustomInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          type="password"
          {...signUpFieldProps}
          error={!!fieldErrors.password}
        />

        <View style={styles.requirementsContainer}>
          {[
            { met: passwordChecks.minLength, label: 'minimum of 8 characters' },
            { met: passwordChecks.noUsername, label: 'may not include username' },
            { met: passwordChecks.hasUppercase, label: 'must include at least 1 Uppercase' },
            { met: passwordChecks.hasLowercase, label: 'must include at least 1 lowercase' },
            { met: passwordChecks.hasNumber, label: 'must include 1 number' },
            { met: passwordChecks.hasSpecial, label: 'must include at least 1 special character' },
          ].map(({ met, label }) => (
            <View key={label} style={styles.requirementRow}>
              <Monicon
                name={met ? 'mdi:check' : 'mdi:circle-outline'}
                size={16}
                color={met ? Colors.success : '#999'}
              />
              <Text style={[styles.requirementText, met && styles.requirementTextMet]}>
                {label}
              </Text>
            </View>
          ))}
        </View>

        <CustomInput
          label="Referral code (optional)"
          value={referralCode}
          onChangeText={setReferralCode}
          type="text"
          {...signUpFieldProps}
          error={!!fieldErrors.referralCode}
          errorMessage={fieldErrors.referralCode}
          placeholder="6 characters"
          autoCapitalize="characters"
          autoCorrect={false}
        />

        {showError && !errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Please fill all fields.</Text>
          </View>
        )}
        
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/*
          Explicit SMS opt-in, required for A2P 10DLC. Consent must be an
          affirmative action tied to the messaging program and must appear
          before the action it authorises — do not fold this into the general
          terms text below.
        */}
        <TouchableOpacity
          style={styles.smsConsentContainer}
          onPress={toggleSmsConsent}
          activeOpacity={0.8}
          disabled={isLoading}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: smsConsent, disabled: isLoading }}
          accessibilityLabel="Agree to receive a one-time verification code by text message"
        >
          <View style={[styles.smsConsentCheckbox, smsConsent && styles.smsConsentCheckboxChecked]}>
            {smsConsent && <Monicon name="mdi:check" size={14} color={Colors.white} />}
          </View>
          <Text style={styles.smsConsentText}>
            I agree to receive a one-time verification code by text message from
            SampleFinder by Polaris Brand Promotions at the mobile number I provided.
            Message frequency: one message per verification request. Message and data
            rates may apply. Reply HELP for help or STOP to opt out.
          </Text>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <CustomButton
            title={isLoading ? 'Signing Up...' : 'Sign Up'}
            onPress={handleSignUp}
            variant="dark"
            disabled={!isFormValid || isLoading}
          />
          {isLoading && (
            <ActivityIndicator
              size="small"
              color="#fff"
              style={styles.loader}
            />
          )}
        </View>

        <View style={styles.signInContainer}>
          <Text style={styles.signInPrompt}>Have an account? </Text>
          <TouchableOpacity onPress={handleSignIn}>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By signing up, you acknowledge & agree to the{' '}
          </Text>
          <TouchableOpacity onPress={handleTermsLinkPress}>
            <Text style={[styles.termsText, styles.termsLinkText]}>
              Terms & Conditions
            </Text>
          </TouchableOpacity>
          <Text style={styles.termsText}>{' '}and{' '}</Text>
          <TouchableOpacity onPress={handlePrivacyLinkPress}>
            <Text style={[styles.termsText, styles.termsLinkText]}>
              Privacy Policy
            </Text>
          </TouchableOpacity>
          <Text style={styles.termsText}>
            {' '}of SampleFinder by Polaris Brand Promotions.
          </Text>
        </View>
      </View>

      <PushNotificationModal
        visible={showPushNotificationModal}
        onClose={() => setShowPushNotificationModal(false)}
        onEnable={handlePushNotificationEnable}
        onNotNow={handlePushNotificationNotNow}
      />

      <AgeVerificationModal
        visible={showAgeVerificationModal}
        onClose={handleAgeVerificationDismiss}
        onAccept={handleAgeVerificationAccept}
      />

      <ErrorModal
        visible={showAgeRestrictionModal}
        title="Age Requirement"
        message={ageRestrictionMessage}
        onClose={() => setShowAgeRestrictionModal(false)}
      />

      <TermsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleTermsAccept}
      />

      <PrivacyModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onAccept={handlePrivacyAccept}
      />

      <PhoneConfirmModal
        visible={showPhoneConfirmModal}
        phoneNumber={phoneNumber}
        onConfirm={handleConfirmPhoneNumber}
        onEdit={handleEditPhoneNumber}
      />
    </ScreenWrapper>
  );
};

export default SignUpScreen;
