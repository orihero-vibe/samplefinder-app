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
import { AgeVerificationModal, TermsModal, PrivacyModal } from './signup/components';
import styles from './signup/styles';

const SignUpScreen = () => {
  const {
    firstName,
    lastName,
    phoneNumber,
    dateOfBirth,
    username,
    email,
    password,
    showError,
    showAgeVerificationModal,
    showTermsModal,
    showPrivacyModal,
    isLoading,
    errorMessage,
    isFormValid,
    setFirstName,
    setLastName,
    setPhoneNumber,
    setDateOfBirth,
    setUsername,
    setEmail,
    setPassword,
    setShowAgeVerificationModal,
    setShowTermsModal,
    setShowPrivacyModal,
    handleSignIn,
    handleAgeVerificationAccept,
    handleTermsAccept,
    handleTermsLinkPress,
    handlePrivacyLinkPress,
    handleSignUp,
  } = useSignUpScreen();

  return (
    <ScreenWrapper
      contentBackgroundColor="#fff"
      contentContainerStyle={styles.contentContainer}
    >
      <StatusBar style="light" />
      <Text style={styles.title}>GET STARTED!</Text>

      <View style={styles.formContainer}>
        <CustomInput
          label="First Name"
          value={firstName}
          onChangeText={setFirstName}
          type="text"
          labelColor="#000"
          error={showError && !firstName.trim()}
        />

        <CustomInput
          label="Last Name"
          value={lastName}
          onChangeText={setLastName}
          type="text"
          labelColor="#000"
          error={showError && !lastName.trim()}
        />

        <CustomInput
          label="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          type="phone"
          labelColor="#000"
          error={showError && !phoneNumber.trim()}
        />

        <CustomInput
          label="Date Of Birth"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          type="date"
          labelColor="#000"
          helpIcon={true}
          error={showError && !dateOfBirth.trim()}
        />

        <CustomInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          type="text"
          labelColor="#000"
          error={showError && !username.trim()}
        />

        <CustomInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          type="email"
          labelColor="#000"
          error={showError && !email.trim()}
        />

        <CustomInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          type="password"
          labelColor="#000"
          error={showError && !password.trim()}
        />

        {showError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Please fill all fields.</Text>
          </View>
        )}
        
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

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

        <Text style={styles.termsText}>
          By signing up, you acknowledge & agree to the Terms & Conditions of
          SampleFinder by Polaris Brand Promotions.
        </Text>

        <View style={styles.legalButtonsContainer}>
          <TouchableOpacity
            onPress={handleTermsLinkPress}
            style={styles.legalButton}
          >
            <Text style={styles.legalButtonText}>Terms & Conditions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePrivacyLinkPress}
            style={styles.legalButton}
          >
            <Text style={styles.legalButtonText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View>

      <AgeVerificationModal
        visible={showAgeVerificationModal}
        onClose={() => setShowAgeVerificationModal(false)}
        onAccept={handleAgeVerificationAccept}
      />

      <TermsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleTermsAccept}
      />

      <PrivacyModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </ScreenWrapper>
  );
};

export default SignUpScreen;
