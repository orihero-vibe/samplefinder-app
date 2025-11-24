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

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    // TODO: Implement login logic
    console.log('Login pressed', { email, password, rememberMe });
    console.log('Navigating to ConfirmAccount...');
    try {
      // Navigate to confirm account page after login
      navigation.navigate('ConfirmAccount', { phoneNumber: email });
      console.log('Navigation called successfully');
    } catch (error) {
      console.error('Navigation error:', error);
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
          onChangeText={setEmail}
          placeholder="Enter email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          labelColor='white'
        />

        <CustomInput
          label="Password:"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          secureTextEntry={true}
          autoCapitalize="none"
          autoCorrect={false}
          labelColor='white'
        />

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.rememberMeContainer}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.8}
          >
            <View style={styles.checkbox}>
              {rememberMe && (
                <MaterialIcons name="check" size={18} color="#fff" />
              )}
            </View>
            <Text style={styles.rememberMeText}>Remember Me</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleForgotPassword}>
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
            title="Log In"
            onPress={handleLogin}
            variant="primary"
          />
        </View>

        <View style={styles.signUpContainer}>
          <Text style={styles.signUpPrompt}>Don't have an account?</Text>
          <CustomButton
            title="Sign Up"
            onPress={handleSignUp}
            variant="secondary"
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

