import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { signup } from '@/lib/auth';

type SignUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

export const useSignUpScreen = () => {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showError, setShowError] = useState(false);
  const [showAgeVerificationModal, setShowAgeVerificationModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateFields = () => {
    return (
      firstName.trim() !== '' &&
      lastName.trim() !== '' &&
      phoneNumber.trim() !== '' &&
      dateOfBirth.trim() !== '' &&
      username.trim() !== '' &&
      email.trim() !== '' &&
      password.trim() !== ''
    );
  };

  useEffect(() => {
    // Show age verification modal when component mounts
    setShowAgeVerificationModal(true);
  }, []);

  const isFormValid = validateFields();

  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  const handleAgeVerificationAccept = () => {
    setShowAgeVerificationModal(false);
    setAgeVerified(true);
  };

  const handleTermsAccept = () => {
    setShowTermsModal(false);
  };

  const handleTermsLinkPress = () => {
    setShowTermsModal(true);
  };

  const handlePrivacyLinkPress = () => {
    setShowPrivacyModal(true);
  };

  const handleSignUp = async () => {
    if (!ageVerified) {
      setShowAgeVerificationModal(true);
      return;
    }
    
    if (!validateFields()) {
      setShowError(true);
      return;
    }

    setShowError(false);
    setErrorMessage('');
    setIsLoading(true);

    try {
      console.log('Starting sign up process...');
      
      await signup({
        email: email.trim(),
        password: password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        dateOfBirth: dateOfBirth.trim(),
        username: username.trim(),
      });

      console.log('Sign up successful!');
      // Navigate to ConfirmAccount page after successful sign up
      navigation.navigate('ConfirmAccount', { phoneNumber: phoneNumber.trim() });
    } catch (error: any) {
      console.error('Sign up error:', error);
      const errorMsg = error?.message || 'Sign up failed. Please try again.';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setErrorMessage('');
    setShowError(false);
  };

  return {
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
    ageVerified,
    isLoading,
    errorMessage,
    isFormValid,
    setFirstName: (text: string) => {
      setFirstName(text);
      clearError();
    },
    setLastName: (text: string) => {
      setLastName(text);
      clearError();
    },
    setPhoneNumber: (text: string) => {
      setPhoneNumber(text);
      clearError();
    },
    setDateOfBirth: (text: string) => {
      setDateOfBirth(text);
      clearError();
    },
    setUsername: (text: string) => {
      setUsername(text);
      clearError();
    },
    setEmail: (text: string) => {
      setEmail(text);
      clearError();
    },
    setPassword: (text: string) => {
      setPassword(text);
      clearError();
    },
    setShowAgeVerificationModal,
    setShowTermsModal,
    setShowPrivacyModal,
    handleSignIn,
    handleAgeVerificationAccept,
    handleTermsAccept,
    handleTermsLinkPress,
    handlePrivacyLinkPress,
    handleSignUp,
  };
};

