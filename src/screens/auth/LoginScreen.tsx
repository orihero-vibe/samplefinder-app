import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenWrapper from '@/components/wrappers/ScreenWrapper';
import CustomInput from '@/components/shared/CustomInput';
import CustomButton from '@/components/shared/CustomButton';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { login } from '@/lib/auth';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!password) {
      setError('Please enter your password');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('[LoginScreen] Starting login process...');
      const user = await login({
        email: email.trim(),
        password: password,
      });

      console.log('[LoginScreen] Login successful:', {
        id: user.$id,
        email: user.email,
        emailVerification: user.emailVerification,
      });

      // Always navigate to confirm account page after login to verify email OTP
      console.log('[LoginScreen] Navigating to ConfirmAccount for email verification');
      navigation.navigate('ConfirmAccount', {});
    } catch (error: any) {
      console.error('[LoginScreen] Login error:', error);
      const errorMsg = error?.message || 'Login failed. Please check your credentials.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

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
          onChangeText={(text) => {
            setEmail(text);
            setError(''); // Clear error when user types
          }}
          placeholder="Enter email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          labelColor='white'
          editable={!isLoading}
        />

        <CustomInput
          label="Password:"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError(''); // Clear error when user types
          }}
          placeholder="Enter password"
          secureTextEntry={true}
          autoCapitalize="none"
          autoCorrect={false}
          labelColor='white'
          editable={!isLoading}
        />

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.rememberMeContainer}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <View style={styles.checkbox}>
              {rememberMe && (
                <MaterialIcons name="check" size={18} color="#fff" />
              )}
            </View>
            <Text style={styles.rememberMeText}>Remember Me</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleForgotPassword}
            disabled={isLoading}
          >
            <View style={styles.forgotPasswordContainer}>
              <MaterialIcons name="help-outline" size={20} color="#fff" />
              <Text style={styles.forgotPasswordText}>
                Forgot Password?
              </Text>
            </View>
          </TouchableOpacity>
        </View>

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

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontFamily: 'Quicksand_700Bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
  },
  errorContainer: {
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#2D1B69',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rememberMeText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
  },
  forgotPasswordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    marginLeft: 4,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  signUpContainer: {
    alignItems: 'center',
  },
  signUpPrompt: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Quicksand_500Medium',
    marginBottom: 12,
  },
});

export default LoginScreen;

