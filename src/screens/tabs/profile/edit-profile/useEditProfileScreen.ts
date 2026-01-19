import { useState, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getCurrentUser } from '@/lib/auth';
import { getUserProfile, updateUserProfile, UserProfileRow } from '@/lib/database';
import { updateEmail, updatePassword } from '@/lib/auth';
import { uploadAvatar, deleteAvatar, extractFileIdFromUrl } from '@/lib/storage';

export const useEditProfileScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');
  
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [authUser, setAuthUser] = useState<{ email: string; name?: string } | null>(null);
  
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [hasChanges, setHasChanges] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Get current authenticated user
      const user = await getCurrentUser();
      if (!user) {
        setError('Not authenticated. Please log in again.');
        setIsLoading(false);
        return;
      }

      setAuthUser({ email: user.email, name: user.name });

      // Fetch user profile from database
      const userProfile = await getUserProfile(user.$id);
      if (!userProfile) {
        setError('Profile not found. Please contact support.');
        setIsLoading(false);
        return;
      }

      setProfile(userProfile);
      setUsername(userProfile.username || '');
      setPhoneNumber(userProfile.phoneNumber || '');
      setEmail(user.email || '');
      setAvatarUri(userProfile.avatarURL || null);
      
      console.log('[EditProfileScreen] Profile loaded:', {
        username: userProfile.username,
        phoneNumber: userProfile.phoneNumber,
        email: user.email,
        hasAvatar: !!userProfile.avatarURL,
      });
    } catch (err: any) {
      console.error('[EditProfileScreen] Error loading profile:', err);
      setError(err?.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Load profile when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  // Track changes
  useEffect(() => {
    if (profile && authUser) {
      const hasUsernameChange = username !== (profile.username || '');
      const hasPhoneChange = phoneNumber !== (profile.phoneNumber || '');
      const hasEmailChange = email !== (authUser.email || '');
      const hasPasswordChange = password.length > 0 || newPassword.length > 0 || confirmPassword.length > 0;
      
      setHasChanges(hasUsernameChange || hasPhoneChange || hasEmailChange || hasPasswordChange);
    }
  }, [username, phoneNumber, email, password, newPassword, confirmPassword, profile, authUser]);

  const handleBackPress = () => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const validateForm = (): string | null => {
    if (!username.trim()) {
      return 'Username is required';
    }
    if (!phoneNumber.trim()) {
      return 'Phone number is required';
    }
    if (!email.trim()) {
      return 'Email is required';
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address';
    }
    
    // Check if email is changing
    const emailChanged = authUser && email !== authUser.email;
    
    // If email is changing, password is required
    if (emailChanged && !password) {
      return 'Current password is required to update email';
    }
    
    // Password validation (if any password fields are filled)
    if (password || newPassword || confirmPassword) {
      if (!password) {
        return 'Current password is required to change password';
      }
      if (newPassword && !confirmPassword) {
        return 'Please confirm your new password';
      }
      if (newPassword && newPassword.length < 8) {
        return 'New password must be at least 8 characters';
      }
      if (newPassword && confirmPassword && newPassword !== confirmPassword) {
        return 'New passwords do not match';
      }
    }
    return null;
  };

  const handleSaveUpdates = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    try {
      setIsSaving(true);
      setError('');

      if (!profile || !authUser) {
        throw new Error('Profile data not loaded');
      }

      const user = await getCurrentUser();
      if (!user) {
        throw new Error('Not authenticated. Please log in again.');
      }

      // Update profile in database (username, phone)
      const profileUpdates: any = {};
      if (username !== (profile.username || '')) {
        profileUpdates.username = username.trim();
      }
      if (phoneNumber !== (profile.phoneNumber || '')) {
        profileUpdates.phoneNumber = phoneNumber.trim();
      }

      if (Object.keys(profileUpdates).length > 0) {
        console.log('[EditProfileScreen] Updating profile:', profileUpdates);
        await updateUserProfile(profile.$id, profileUpdates);
      }

      // Update email if changed
      if (email !== authUser.email) {
        console.log('[EditProfileScreen] Updating email');
        // For email update, we need the current password
        if (!password) {
          throw new Error('Current password is required to update email');
        }
        await updateEmail(email.trim(), password);
      }

      // Update password if provided
      if (password && newPassword) {
        console.log('[EditProfileScreen] Updating password');
        await updatePassword(password, newPassword, confirmPassword);
        // Clear password fields after successful update
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      console.error('[EditProfileScreen] Error saving profile:', err);
      const errorMessage = err?.message || 'Failed to update profile. Please try again.';
      setError(errorMessage);
      Alert.alert('Update Failed', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const requestImagePickerPermissions = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your photo library to upload a profile picture.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleChangeProfilePicture = async () => {
    try {
      // Request permissions
      const hasPermission = await requestImagePickerPermissions();
      if (!hasPermission) {
        return;
      }

      // Show action sheet for image source
      Alert.alert(
        'Select Photo',
        'Choose an option',
        [
          { text: 'Camera', onPress: () => pickImage('camera') },
          { text: 'Photo Library', onPress: () => pickImage('library') },
          { text: 'Cancel', style: 'cancel' },
          ...(avatarUri ? [{ text: 'Remove Photo', style: 'destructive', onPress: handleRemovePhoto }] : []),
        ],
        { cancelable: true }
      );
    } catch (error: any) {
      console.error('[EditProfileScreen] Error in handleChangeProfilePicture:', error);
      Alert.alert('Error', 'Failed to open image picker. Please try again.');
    }
  };

  const pickImage = async (source: 'camera' | 'library') => {
    try {
      let result: ImagePicker.ImagePickerResult;

      if (source === 'camera') {
        // Check camera permissions
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus !== 'granted') {
          Alert.alert(
            'Permission Required',
            'We need access to your camera to take a photo.',
            [{ text: 'OK' }]
          );
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await handleUploadAvatar(imageUri);
      }
    } catch (error: any) {
      console.error('[EditProfileScreen] Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleUploadAvatar = async (imageUri: string) => {
    if (!profile || !authUser) {
      Alert.alert('Error', 'Profile not loaded. Please try again.');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setError('');

      const user = await getCurrentUser();
      if (!user) {
        throw new Error('Not authenticated. Please log in again.');
      }

      // Delete old avatar if exists
      if (profile.avatarURL) {
        const oldFileId = extractFileIdFromUrl(profile.avatarURL);
        if (oldFileId) {
          try {
            await deleteAvatar(oldFileId);
          } catch (deleteError) {
            console.warn('[EditProfileScreen] Failed to delete old avatar:', deleteError);
            // Continue even if deletion fails
          }
        }
      }

      // Upload new avatar
      const avatarUrl = await uploadAvatar(imageUri, user.$id);

      // Update profile with new avatar URL
      await updateUserProfile(profile.$id, { avatarURL: avatarUrl });

      // Update local state
      setAvatarUri(avatarUrl);
      
      // Reload profile to get updated data
      await loadProfile();
    } catch (err: any) {
      console.error('[EditProfileScreen] Error uploading avatar:', err);
      const errorMessage = err?.message || 'Failed to upload profile picture. Please try again.';
      setError(errorMessage);
      Alert.alert('Upload Failed', errorMessage);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!profile) {
      return;
    }

    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove your profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsUploadingAvatar(true);

              // Delete from storage if exists
              if (profile.avatarURL) {
                const fileId = extractFileIdFromUrl(profile.avatarURL);
                if (fileId) {
                  await deleteAvatar(fileId);
                }
              }

              // Update profile to remove avatar URL
              await updateUserProfile(profile.$id, { avatarURL: null });
              setAvatarUri(null);

              // Reload profile
              await loadProfile();
            } catch (err: any) {
              console.error('[EditProfileScreen] Error removing avatar:', err);
              Alert.alert('Error', 'Failed to remove profile picture. Please try again.');
            } finally {
              setIsUploadingAvatar(false);
            }
          },
        },
      ]
    );
  };

  return {
    isLoading,
    isSaving,
    error,
    profile,
    username,
    phoneNumber,
    email,
    password,
    newPassword,
    confirmPassword,
    hasChanges,
    avatarUri,
    isUploadingAvatar,
    setUsername,
    setPhoneNumber,
    setEmail,
    setPassword,
    setNewPassword,
    setConfirmPassword,
    handleBackPress,
    handleSaveUpdates,
    handleChangeProfilePicture,
    loadProfile,
  };
};

