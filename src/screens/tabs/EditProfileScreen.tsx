import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Monicon } from '@monicon/native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/Colors';
import CustomInput from '@/components/shared/CustomInput';
import CustomButton from '@/components/shared/CustomButton';
import { getCurrentUser } from '@/lib/auth';
import { getUserProfile, updateUserProfile, UserProfileRow } from '@/lib/database';
import { updateEmail, updatePassword } from '@/lib/auth';
import { uploadAvatar, deleteAvatar, extractFileIdFromUrl } from '@/lib/storage';

const EditProfileScreen = () => {
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

      Alert.alert('Success', 'Profile picture updated successfully!');
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

              Alert.alert('Success', 'Profile picture removed successfully!');
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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ImageBackground
          source={require('@/assets/main-header-bg.png')}
          style={styles.headerBackground}
          resizeMode="cover"
        >
          <View style={styles.header}>
            <View style={styles.leftSection}>
              <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
                <Monicon name="mdi:arrow-left" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.rightSection}>
              <Monicon name="mdi:map-marker" size={20} color="#FFFFFF" />
              <Text style={styles.appTitle}>SampleFinder</Text>
            </View>
          </View>
        </ImageBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.blueColorMode} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (error && !profile) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ImageBackground
          source={require('@/assets/main-header-bg.png')}
          style={styles.headerBackground}
          resizeMode="cover"
        >
          <View style={styles.header}>
            <View style={styles.leftSection}>
              <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
                <Monicon name="mdi:arrow-left" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.rightSection}>
              <Monicon name="mdi:map-marker" size={20} color="#FFFFFF" />
              <Text style={styles.appTitle}>SampleFinder</Text>
            </View>
          </View>
        </ImageBackground>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <CustomButton
            title="Retry"
            onPress={loadProfile}
            variant="dark"
            size="medium"
            style={styles.retryButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground
        source={require('@/assets/main-header-bg.png')}
        style={styles.headerBackground}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <View style={styles.leftSection}>
            <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
              <Monicon name="mdi:arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.rightSection}>
            <Monicon name="mdi:map-marker" size={20} color="#FFFFFF" />
            <Text style={styles.appTitle}>SampleFinder</Text>
          </View>
        </View>
      </ImageBackground>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            onPress={handleChangeProfilePicture}
            disabled={isUploadingAvatar}
            style={styles.avatarContainer}
          >
            <View style={styles.avatarBorder}>
              {isUploadingAvatar ? (
                <ActivityIndicator size="large" color={Colors.blueColorMode} />
              ) : avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Monicon name="mdi:account" size={60} color={Colors.blueColorMode} />
                </View>
              )}
              <View style={styles.cameraIconContainer}>
                <View style={styles.cameraIconBackground}>
                  <Monicon name="mdi:camera" size={24} color={Colors.white} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.username}>{username || 'User'}</Text>
          <TouchableOpacity onPress={handleChangeProfilePicture} disabled={isUploadingAvatar}>
            <Text style={styles.changePictureText}>
              {isUploadingAvatar ? 'Uploading...' : avatarUri ? 'Change Profile Picture' : 'Add Profile Picture'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorMessageContainer}>
            <Text style={styles.errorMessageText}>{error}</Text>
          </View>
        ) : null}

        {/* Input Fields */}
        <View style={styles.inputsContainer}>
          <CustomInput
            label="Update Username"
            value={username}
            onChangeText={setUsername}
            type="text"
            placeholder="Enter username"
            labelColor={Colors.blueColorMode}
            inputBorderColor={Colors.blueColorMode}
          />

          <CustomInput
            label="Update Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            type="phone"
            placeholder="( )"
            labelColor={Colors.blueColorMode}
            inputBorderColor={Colors.blueColorMode}
            autoFormat={true}
          />

          <CustomInput
            label="Update Email"
            value={email}
            onChangeText={setEmail}
            type="email"
            placeholder="name@gmail.com"
            labelColor={Colors.blueColorMode}
            inputBorderColor={Colors.blueColorMode}
          />

          {/* Password Section */}
          <View style={styles.passwordSection}>
            <Text style={styles.sectionTitle}>Change Password (Optional)</Text>
            <Text style={styles.sectionSubtitle}>
              Leave blank if you don't want to change your password
            </Text>
            
            <CustomInput
              label="Current Password"
              value={password}
              onChangeText={setPassword}
              type="password"
              placeholder="Enter current password"
              labelColor={Colors.blueColorMode}
              inputBorderColor={Colors.blueColorMode}
              showPasswordToggle={true}
            />

            <CustomInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              type="password"
              placeholder="Enter new password"
              labelColor={Colors.blueColorMode}
              inputBorderColor={Colors.blueColorMode}
              showPasswordToggle={true}
            />

            <CustomInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              type="password"
              placeholder="Confirm new password"
              labelColor={Colors.blueColorMode}
              inputBorderColor={Colors.blueColorMode}
              showPasswordToggle={true}
            />
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <CustomButton
            title={isSaving ? 'Saving...' : 'Save Updates'}
            onPress={handleSaveUpdates}
            variant="dark"
            size="large"
            style={styles.saveButton}
            textStyle={styles.saveButtonText}
            disabled={isSaving || !hasChanges}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerBackground: {
    paddingTop: Platform.OS === 'android' ? 30 : 60,
    paddingBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconButton: {
    padding: 5,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appTitle: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarBorder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Colors.blueColorMode,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.blueColorMode,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  username: {
    fontSize: 32,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.black,
    marginBottom: 8,
  },
  changePictureText: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.blueColorMode,
  },
  inputsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: Colors.blueColorMode,
  },
  saveButtonText: {
    color: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.blueColorMode,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Quicksand_500Medium',
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.blueColorMode,
    marginTop: 10,
  },
  errorMessageContainer: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
  },
  errorMessageText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: '#FF6B6B',
    textAlign: 'center',
  },
  passwordSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: 'Quicksand_400Regular',
    color: '#666',
    marginBottom: 16,
  },
});

export default EditProfileScreen;

