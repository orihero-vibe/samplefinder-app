import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import * as Notifications from 'expo-notifications';
import { signup } from '@/lib/auth';
import { isValidEmail, isValidPhoneNumber, isValidDate } from '@/utils/formatters';
import { checkUsernameExists } from '@/lib/database/users';

type SignUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  zipCode?: string;
  dateOfBirth?: string;
  username?: string;
  email?: string;
  password?: string;
}

export const useSignUpScreen = () => {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showPushNotificationModal, setShowPushNotificationModal] = useState(false);
  const [showAgeVerificationModal, setShowAgeVerificationModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Debounce timer for username checking
  const usernameCheckTimer = useRef<NodeJS.Timeout | null>(null);

  // Validation functions
  const validateFirstName = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'First Name is required';
    }
    // Only alphabetic characters and spaces (for names like "Mary Jane")
    if (!/^[A-Za-z\s]+$/.test(value.trim())) {
      return 'First Name must contain only letters';
    }
    return undefined;
  };

  const validateLastName = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'Last Name is required';
    }
    // Only alphabetic characters and spaces
    if (!/^[A-Za-z\s]+$/.test(value.trim())) {
      return 'Last Name must contain only letters';
    }
    return undefined;
  };

  const validatePhoneNumber = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'Phone Number is required';
    }
    if (!isValidPhoneNumber(value)) {
      return 'Please enter a valid 10-digit phone number';
    }
    return undefined;
  };

  const validateZipCode = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'Zip Code is required';
    }
    // US Zip code validation (5 digits or 5+4 format)
    if (!/^\d{5}(-\d{4})?$/.test(value.trim())) {
      return 'Please enter a valid 5-digit zip code';
    }
    return undefined;
  };

  const validateDateOfBirth = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'Date of Birth is required';
    }
    if (!isValidDate(value)) {
      // Check if it's a format issue or invalid date
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dateRegex.test(value)) {
        return 'Date must be in MM/DD/YYYY format';
      }
      const [month, day, year] = value.split('/').map(Number);
      if (month < 1 || month > 12) {
        return 'Invalid month. Please enter a valid date';
      }
      if (year < 1900 || year > new Date().getFullYear()) {
        return 'Date cannot be in the future or before 1900';
      }
      return 'Please enter a valid date';
    }
    return undefined;
  };

  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'Email is required';
    }
    if (!isValidEmail(value.trim())) {
      return 'Please enter a valid email address';
    }
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'Password is required';
    }
    // Password must have at least 1 digit, 1 uppercase, 1 lowercase, and 1 special character
    const hasDigit = /\d/.test(value);
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
    
    if (!hasDigit || !hasUpperCase || !hasLowerCase || !hasSpecialChar) {
      return 'Password must contain at least 1 digit, 1 uppercase letter, 1 lowercase letter, and 1 special character';
    }
    return undefined;
  };

  const validateUsername = async (value: string): Promise<string | undefined> => {
    if (!value.trim()) {
      return 'Username is required';
    }
    // Check if username exists (debounced)
    try {
      const exists = await checkUsernameExists(value.trim());
      if (exists) {
        return 'Username already taken';
      }
    } catch (error) {
      console.error('Error checking username:', error);
      // Don't block signup if check fails, but show warning
    }
    return undefined;
  };

  // Update field errors
  const updateFieldError = (field: keyof FieldErrors, error: string | undefined) => {
    setFieldErrors(prev => {
      if (error) {
        return { ...prev, [field]: error };
      } else {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
    });
  };

  // Validate all fields
  const validateAllFields = async (): Promise<boolean> => {
    const errors: FieldErrors = {};
    
    const firstNameError = validateFirstName(firstName);
    if (firstNameError) errors.firstName = firstNameError;
    
    const lastNameError = validateLastName(lastName);
    if (lastNameError) errors.lastName = lastNameError;
    
    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) errors.phoneNumber = phoneError;
    
    const zipCodeError = validateZipCode(zipCode);
    if (zipCodeError) errors.zipCode = zipCodeError;
    
    const dobError = validateDateOfBirth(dateOfBirth);
    if (dobError) errors.dateOfBirth = dobError;
    
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;
    
    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;
    
    // Check username if it's not empty
    if (username.trim()) {
      const usernameError = await validateUsername(username);
      if (usernameError) errors.username = usernameError;
    } else {
      errors.username = 'Username is required';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Debounced username check
  useEffect(() => {
    if (usernameCheckTimer.current) {
      clearTimeout(usernameCheckTimer.current);
    }

    if (!username.trim()) {
      updateFieldError('username', undefined);
      return;
    }

    // Only check if username looks valid (at least 3 characters)
    if (username.trim().length < 3) {
      updateFieldError('username', undefined);
      return;
    }

    setIsCheckingUsername(true);
    usernameCheckTimer.current = setTimeout(async () => {
      try {
        const error = await validateUsername(username);
        updateFieldError('username', error);
      } catch (error) {
        console.error('Error checking username:', error);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500); // 500ms debounce

    return () => {
      if (usernameCheckTimer.current) {
        clearTimeout(usernameCheckTimer.current);
      }
    };
  }, [username]);

  useEffect(() => {
    // Check notification permissions before showing modal
    const checkNotificationPermissions = async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
          // Only show modal if permissions are not already granted
          setShowPushNotificationModal(true);
        } else {
          // Permissions already granted, skip modal and show age verification
          setShowAgeVerificationModal(true);
        }
      } catch (error) {
        console.error('Error checking notification permissions:', error);
        // On error, show the modal anyway
        setShowPushNotificationModal(true);
      }
    };
    
    checkNotificationPermissions();
  }, []);

  // Real-time validation for fields (except username which is debounced)
  const handleFirstNameChange = (text: string) => {
    setFirstName(text);
    const error = validateFirstName(text);
    updateFieldError('firstName', error);
    setShowError(false);
    setErrorMessage('');
  };

  const handleLastNameChange = (text: string) => {
    setLastName(text);
    const error = validateLastName(text);
    updateFieldError('lastName', error);
    setShowError(false);
    setErrorMessage('');
  };

  const handlePhoneNumberChange = (text: string) => {
    setPhoneNumber(text);
    const error = validatePhoneNumber(text);
    updateFieldError('phoneNumber', error);
    setShowError(false);
    setErrorMessage('');
  };

  const handleZipCodeChange = (text: string) => {
    setZipCode(text);
    const error = validateZipCode(text);
    updateFieldError('zipCode', error);
    setShowError(false);
    setErrorMessage('');
  };

  const handleDateOfBirthChange = (text: string) => {
    setDateOfBirth(text);
    const error = validateDateOfBirth(text);
    updateFieldError('dateOfBirth', error);
    setShowError(false);
    setErrorMessage('');
  };

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    setShowError(false);
    setErrorMessage('');
    // Username validation is handled by useEffect with debounce
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    const error = validateEmail(text);
    updateFieldError('email', error);
    setShowError(false);
    setErrorMessage('');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    const error = validatePassword(text);
    updateFieldError('password', error);
    setShowError(false);
    setErrorMessage('');
  };

  // Check if form is valid (all fields filled and no errors)
  const isFormValid = 
    firstName.trim() !== '' &&
    lastName.trim() !== '' &&
    phoneNumber.trim() !== '' &&
    zipCode.trim() !== '' &&
    dateOfBirth.trim() !== '' &&
    username.trim() !== '' &&
    email.trim() !== '' &&
    password.trim() !== '' &&
    Object.keys(fieldErrors).length === 0;

  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  const handlePushNotificationEnable = () => {
    setShowPushNotificationModal(false);
    setShowAgeVerificationModal(true);
  };

  const handlePushNotificationNotNow = () => {
    setShowPushNotificationModal(false);
    setShowAgeVerificationModal(true);
  };

  const handleAgeVerificationAccept = () => {
    setShowAgeVerificationModal(false);
    setAgeVerified(true);
  };

  const handleAgeVerificationDismiss = () => {
    setShowAgeVerificationModal(false);
    setAgeVerified(false);
  };

  const handleTermsAccept = () => {
    setShowTermsModal(false);
    setTermsAccepted(true);
  };

  const handlePrivacyAccept = () => {
    setShowPrivacyModal(false);
    setPrivacyAccepted(true);
  };

  const handleTermsLinkPress = () => {
    setShowTermsModal(true);
  };

  const handlePrivacyLinkPress = () => {
    setShowPrivacyModal(true);
  };

  const getUserFriendlyErrorMessage = (error: any): string => {
    const errorMessage = error?.message || '';
    
    // Check for email validation errors
    if (errorMessage.toLowerCase().includes('email') && 
        (errorMessage.toLowerCase().includes('valid') || errorMessage.toLowerCase().includes('invalid'))) {
      // Return the actual backend message if it's clear, otherwise use custom message
      return errorMessage.includes('email') && errorMessage.length < 100 
        ? errorMessage 
        : 'Please enter a valid email address.';
    }
    
    // Check for duplicate email/username
    if (errorMessage.toLowerCase().includes('already exists') || 
        errorMessage.toLowerCase().includes('duplicate') ||
        errorMessage.toLowerCase().includes('already registered')) {
      if (errorMessage.toLowerCase().includes('email')) {
        return 'This email is already registered. Please use a different email or sign in.';
      }
      if (errorMessage.toLowerCase().includes('username')) {
        return 'This username is already taken. Please choose a different username.';
      }
      return 'An account with these details already exists.';
    }
    
    // Check for password errors
    if (errorMessage.toLowerCase().includes('password')) {
      // Return the actual backend message if it's clear, otherwise use custom message
      return errorMessage.includes('password') && errorMessage.length < 100 
        ? errorMessage 
        : 'Password does not meet requirements. Please check and try again.';
    }
    
    // Check for phone number errors
    if (errorMessage.toLowerCase().includes('phone')) {
      return errorMessage.includes('phone') && errorMessage.length < 100 
        ? errorMessage 
        : 'Please enter a valid phone number.';
    }
    
    // Network or server errors
    if (errorMessage.toLowerCase().includes('network') || 
        errorMessage.toLowerCase().includes('fetch') || 
        errorMessage.toLowerCase().includes('timeout')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    // Default - return actual error message if available and reasonable length
    return errorMessage && errorMessage.length < 100 
      ? errorMessage 
      : 'Sign up failed. Please try again.';
  };

  const handleSignUp = async () => {
    if (!ageVerified) {
      setShowAgeVerificationModal(true);
      return;
    }

    // Validate T&C and Privacy acceptance
    if (!termsAccepted) {
      setErrorMessage('Please accept the Terms & Conditions to continue.');
      setShowTermsModal(true);
      return;
    }

    if (!privacyAccepted) {
      setErrorMessage('Please accept the Privacy Policy to continue.');
      setShowPrivacyModal(true);
      return;
    }
    
    // Validate all fields before submission
    const isValid = await validateAllFields();
    if (!isValid) {
      setShowError(true);
      return;
    }

    // Double-check email validation to prevent hanging
    const emailError = validateEmail(email);
    if (emailError) {
      updateFieldError('email', emailError);
      setShowError(true);
      return;
    }

    setShowError(false);
    setErrorMessage('');
    setIsLoading(true);

    try {
      await signup({
        email: email.trim(),
        password: password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        zipCode: zipCode.trim(),
        dateOfBirth: dateOfBirth.trim(),
        username: username.trim(),
      });

      navigation.navigate('ConfirmAccount', { phoneNumber: phoneNumber.trim() });
    } catch (error: any) {
      console.error('Sign up error:', error);
      const errorMsg = getUserFriendlyErrorMessage(error);
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    firstName,
    lastName,
    phoneNumber,
    zipCode,
    dateOfBirth,
    username,
    email,
    password,
    fieldErrors,
    isCheckingUsername,
    showError,
    showPushNotificationModal,
    showAgeVerificationModal,
    showTermsModal,
    showPrivacyModal,
    ageVerified,
    isLoading,
    errorMessage,
    isFormValid,
    setFirstName: handleFirstNameChange,
    setLastName: handleLastNameChange,
    setPhoneNumber: handlePhoneNumberChange,
    setZipCode: handleZipCodeChange,
    setDateOfBirth: handleDateOfBirthChange,
    setUsername: handleUsernameChange,
    setEmail: handleEmailChange,
    setPassword: handlePasswordChange,
    setShowPushNotificationModal,
    setShowAgeVerificationModal,
    setShowTermsModal,
    setShowPrivacyModal,
    handleSignIn,
    handlePushNotificationEnable,
    handlePushNotificationNotNow,
    handleAgeVerificationAccept,
    handleAgeVerificationDismiss,
    handleTermsAccept,
    handlePrivacyAccept,
    handleTermsLinkPress,
    handlePrivacyLinkPress,
    handleSignUp,
  };
};
