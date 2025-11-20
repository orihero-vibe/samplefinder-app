import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';
import { LocationPinIcon } from '@/icons';
import CustomInput from '@/components/shared/CustomInput';
import CustomButton from '@/components/shared/CustomButton';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('Username');
  const [phoneNumber, setPhoneNumber] = useState('(215) 555-1212');
  const [email, setEmail] = useState('thesamplefinder@gmail.com');
  const [password, setPassword] = useState('');

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSaveUpdates = () => {
    // Handle save updates action
    console.log('Save updates pressed', {
      username,
      phoneNumber,
      email,
      password: password ? '***' : 'not changed',
    });
    // TODO: Implement actual save logic
    navigation.goBack();
  };

  const handleChangeProfilePicture = () => {
    // Handle change profile picture action
    console.log('Change profile picture pressed');
    // TODO: Implement image picker
  };

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
          <View style={styles.profilePictureContainer}>
            <LocationPinIcon size={100} color={Colors.blueColorMode} />
          </View>
          <Text style={styles.username}>{username}</Text>
          <TouchableOpacity onPress={handleChangeProfilePicture}>
            <Text style={styles.changePictureText}>Add / Change Profile Picture</Text>
          </TouchableOpacity>
        </View>

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

          <CustomInput
            label="Update Password"
            value={password}
            onChangeText={setPassword}
            type="password"
            placeholder="********"
            labelColor={Colors.blueColorMode}
            inputBorderColor={Colors.blueColorMode}
            showPasswordToggle={true}
          />
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Save Updates"
            onPress={handleSaveUpdates}
            variant="dark"
            size="large"
            style={styles.saveButton}
            textStyle={styles.saveButtonText}
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
  profilePictureContainer: {
    marginBottom: 16,
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
    color: '#666',
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
});

export default EditProfileScreen;

