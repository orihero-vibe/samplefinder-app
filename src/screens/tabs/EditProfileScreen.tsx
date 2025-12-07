import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';
import CustomInput from '@/components/shared/CustomInput';
import CustomButton from '@/components/shared/CustomButton';
import { useEditProfileScreen } from './profile/edit-profile/useEditProfileScreen';
import { ProfilePictureSection, PasswordSection } from './profile/edit-profile/components';
import styles from './profile/edit-profile/styles';

const EditProfileScreen = () => {
  const {
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
  } = useEditProfileScreen();

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
        <ProfilePictureSection
          username={username}
          avatarUri={avatarUri}
          isUploadingAvatar={isUploadingAvatar}
          onChangePicture={handleChangeProfilePicture}
        />

        {error ? (
          <View style={styles.errorMessageContainer}>
            <Text style={styles.errorMessageText}>{error}</Text>
          </View>
        ) : null}

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

          <PasswordSection
            password={password}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            onPasswordChange={setPassword}
            onNewPasswordChange={setNewPassword}
            onConfirmPasswordChange={setConfirmPassword}
            isLoading={isSaving}
          />
        </View>

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

export default EditProfileScreen;
