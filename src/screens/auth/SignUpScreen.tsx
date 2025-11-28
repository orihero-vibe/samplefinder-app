import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import ScreenWrapper from '@/components/wrappers/ScreenWrapper';
import CustomInput from '@/components/shared/CustomInput';
import CustomButton from '@/components/shared/CustomButton';
import { signup } from '@/lib/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

const SignUpScreen = ({ navigation }: Props) => {
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

  useEffect(() => {
    // Show age verification modal when component mounts
    setShowAgeVerificationModal(true);
  }, []);

  const isFormValid = validateFields();

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
          onChangeText={(text) => {
            setFirstName(text);
            setErrorMessage(''); // Clear error when user types
            setShowError(false);
          }}
          type="text"
          labelColor="#000"
          error={showError && !firstName.trim()}
        />

        <CustomInput
          label="Last Name"
          value={lastName}
          onChangeText={(text) => {
            setLastName(text);
            setErrorMessage(''); // Clear error when user types
            setShowError(false);
          }}
          type="text"
          labelColor="#000"
          error={showError && !lastName.trim()}
        />

        <CustomInput
          label="Phone Number"
          value={phoneNumber}
          onChangeText={(text) => {
            setPhoneNumber(text);
            setErrorMessage(''); // Clear error when user types
            setShowError(false);
          }}
          type="phone"
          labelColor="#000"
          error={showError && !phoneNumber.trim()}
        />

        <CustomInput
          label="Date Of Birth"
          value={dateOfBirth}
          onChangeText={(text) => {
            setDateOfBirth(text);
            setErrorMessage(''); // Clear error when user types
            setShowError(false);
          }}
          type="date"
          labelColor="#000"
          helpIcon={true}
          error={showError && !dateOfBirth.trim()}
        />

        <CustomInput
          label="Username"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            setErrorMessage(''); // Clear error when user types
            setShowError(false);
          }}
          type="text"
          labelColor="#000"
          error={showError && !username.trim()}
        />

        <CustomInput
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrorMessage(''); // Clear error when user types
            setShowError(false);
          }}
          type="email"
          labelColor="#000"
          error={showError && !email.trim()}
        />

        <CustomInput
          label="Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrorMessage(''); // Clear error when user types
            setShowError(false);
          }}
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

      {/* Age Verification Modal */}
      <Modal
        visible={showAgeVerificationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAgeVerificationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.ageModalTitle}>Age Verification</Text>
              <TouchableOpacity
                onPress={() => setShowAgeVerificationModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.ageModalText}>
                Any advertisements or promotions for gambling, alcohol, tobacco,
                cannabis or any other controlled substances are limited to app
                users 21 years of age or older.
              </Text>
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={handleAgeVerificationAccept}
                style={styles.acceptButton}
              >
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Terms & Conditions Modal */}
      <Modal
        visible={showTermsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.termsModalTitle}>Terms & Conditions</Text>
              <TouchableOpacity
                onPress={() => setShowTermsModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.termsModalText}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
                {'\n\n'}
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                quae ab illo inventore veritatis et quasi architecto beatae vitae
                dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas
                sit aspernatur aut odit aut fugit, sed quia consequuntur magni
                dolores eos qui ratione voluptatem sequi nesciunt.
                {'\n\n'}
                Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,
                consectetur, adipisci velit, sed quia non numquam eius modi
                tempora incidunt ut labore et dolore magnam aliquam quaerat
                voluptatem.
              </Text>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={handleTermsAccept}
                style={styles.acceptButtonTerms}
              >
                <Text style={styles.acceptButtonTextTerms}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.termsModalTitle}>Privacy Policy</Text>
              <TouchableOpacity
                onPress={() => setShowPrivacyModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.termsModalText}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
                {'\n\n'}
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                quae ab illo inventore veritatis et quasi architecto beatae vitae
                dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas
                sit aspernatur aut odit aut fugit, sed quia consequuntur magni
                dolores eos qui ratione voluptatem sequi nesciunt.
                {'\n\n'}
                Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,
                consectetur, adipisci velit, sed quia non numquam eius modi
                tempora incidunt ut labore et dolore magnam aliquam quaerat
                voluptatem.
              </Text>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={() => setShowPrivacyModal(false)}
                style={styles.acceptButtonTerms}
              >
                <Text style={styles.acceptButtonTextTerms}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 30,
    paddingVertical: 0,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Quicksand_700Bold',
    color: '#2D1B69',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
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
  buttonContainer: {
    marginTop: 8,
    marginBottom: 20,
    position: 'relative',
  },
  loader: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  signInPrompt: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
  },
  signInLink: {
    color: '#2D1B69',
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
  },
  termsText: {
    color: '#999',
    fontSize: 12,
    fontFamily: 'Quicksand_400Regular',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  termsLink: {
    color: '#2D1B69',
    fontFamily: 'Quicksand_600SemiBold',
  },
  legalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  legalButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 8,
  },
  legalButtonText: {
    color: '#2D1B69',
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    textDecorationLine: 'underline',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  ageModalTitle: {
    fontSize: 20,
    fontFamily: 'Quicksand_700Bold',
    color: '#1E3A8A',
  },
  termsModalTitle: {
    fontSize: 20,
    fontFamily: 'Quicksand_700Bold',
    color: '#2D1B69',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    maxHeight: 400,
  },
  ageModalText: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: '#666',
    lineHeight: 24,
  },
  termsModalText: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: '#666',
    lineHeight: 24,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  acceptButton: {
    alignSelf: 'flex-start',
  },
  acceptButtonText: {
    fontSize: 18,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#1E3A8A',
  },
  acceptButtonTerms: {
    alignSelf: 'flex-start',
  },
  acceptButtonTextTerms: {
    fontSize: 18,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#2D1B69',
  },
});

export default SignUpScreen;
