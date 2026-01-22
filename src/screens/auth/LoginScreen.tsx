import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import ScreenWrapper from '@/components/wrappers/ScreenWrapper';
import CustomInput from '@/components/shared/CustomInput';
import CustomButton from '@/components/shared/CustomButton';
import { useLoginScreen } from './useLoginScreen';
import styles from './login/styles';
import QuestionMarkIcon from '@/icons/QuestionMarkIcon';
import { QuestionIcon } from '@/icons';
import { Colors } from '@/constants/Colors';

const { height: screenHeight } = Dimensions.get('window');
const isSmallDevice = screenHeight < 700;

const LoginScreen = () => {
  const {
    email,
    password,
    rememberMe,
    isLoading,
    emailError,
    passwordError,
    authError,
    handleEmailChange,
    handlePasswordChange,
    handleRememberMeToggle,
    handleLogin,
    handleSignUp,
    handleForgotPassword,
  } = useLoginScreen();

  return (
    <ScreenWrapper>
      <StatusBar style="light" />
      <Text style={styles.title}>IT'S SAMPLING TIME!</Text>
      <Text style={styles.subtitle}>
        Find new events & demos in your area, sample new products & earn
        points along the way!
      </Text>

      <View style={styles.formContainer}>
        <CustomInput
          label="Email:"
          value={email}
          onChangeText={handleEmailChange}
          placeholder="Enter email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          labelColor='white'
          editable={!isLoading}
          error={!!emailError || !!authError}
          errorMessage={emailError}
          inputBorderColor={Colors.blueColorMode}
          inputBorderWidth={2}
        />

        <CustomInput
          label="Password:"
          value={password}
          onChangeText={handlePasswordChange}
          placeholder="Enter password"
          secureTextEntry={true}
          autoCapitalize="none"
          autoCorrect={false}
          labelColor='white'
          editable={!isLoading}
          error={!!passwordError || !!authError}
          errorMessage={passwordError}
          inputBorderColor={Colors.blueColorMode}
          inputBorderWidth={2}
        />

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.rememberMeContainer}
            onPress={handleRememberMeToggle}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <View style={styles.checkbox}>
              {rememberMe && (
                <MaterialIcons name="check" size={isSmallDevice ? 16 : 18} color="#fff" />
              )}
            </View>
            <Text style={styles.rememberMeText}>Remember Me</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleForgotPassword}
            disabled={isLoading}
          >
            <View style={styles.forgotPasswordContainer}>
              <QuestionIcon
                size={isSmallDevice ? 18 : 20}
              />
              <Text style={styles.forgotPasswordText}>
                Forgot Password?
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {authError && (
          <View style={styles.centralErrorContainer}>
            <Text style={styles.centralErrorText}>
              {authError}
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <CustomButton
            title={isLoading ? 'Logging In...' : 'Log In'}
            onPress={handleLogin}
            variant="primary"
            disabled={isLoading}
          />
        </View>

        <View style={styles.signUpContainer}>
          <Text style={styles.signUpPrompt}>Don't have an account?</Text>
          <CustomButton
            title="Sign Up"
            onPress={handleSignUp}
            variant="secondary"
            disabled={isLoading}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default LoginScreen;

