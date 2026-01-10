import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '@/constants/Colors';

interface ProfileOverviewProps {
  username?: string;
  onEditProfilePress?: () => void;
}

const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  username = 'Username',
  onEditProfilePress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.profilePictureContainer}>
        <Image
          source={require('@/assets/locationImage.png')}
          style={{ width: 100, height: 100 }}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.username}>{username}</Text>
      <TouchableOpacity onPress={onEditProfilePress}>
        <Text style={styles.editProfileText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profilePictureContainer: {
    marginBottom: 16,
  },
  username: {
    fontSize: 32,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.brandPurpleDeep,
    marginBottom: 8,
  },
  editProfileText: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.brandPurpleBright,
  },
});

export default ProfileOverview;

