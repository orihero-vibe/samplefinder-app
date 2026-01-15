import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '@/constants/Colors';
import { CertifiedBrandAmbassadorIcon, CertifiedInfluencerIcon } from '@/icons';
import BadgeItem from '../../promotions/components/BadgeItem';

interface ProfileOverviewProps {
  username?: string;
  onEditProfilePress?: () => void;
  isAmbassador?: boolean;
  isInfluencer?: boolean;
  eventCheckIns?: number;
  samplingReviews?: number;
}

const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  username = 'Username',
  onEditProfilePress,
  isAmbassador = false,
  isInfluencer = false,
  eventCheckIns = 0,
  samplingReviews = 0,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.profilePictureContainer}>
        <Image
          source={require('@/assets/locationImage.png')}
          style={styles.profileImage}
          resizeMode="contain"
        />
        {/* Badge indicators on profile picture */}
        <View style={styles.profileBadgesContainer}>
          {isAmbassador && (
            <View style={styles.profileBadge}>
              <CertifiedBrandAmbassadorIcon size={34} />
            </View>
          )}
          {isInfluencer && (
            <View style={styles.profileBadge}>
              <CertifiedInfluencerIcon size={34} />
            </View>
          )}
          {/* {eventCheckIns >= 30 && (
            <View style={[styles.profileBadge, styles.eventsBadge]}>
              <Text style={styles.badgeNumber}>{Math.min(eventCheckIns, 99)}</Text>
              <Text style={styles.badgeLabel}>EVENTS</Text>
            </View>
          )}
          {samplingReviews >= 10 && (
            <BadgeItem color={Colors.pinDarkBlue} key={samplingReviews} size={36} 
            badge={{ count: samplingReviews, label: '', achieved: true, id: 'samplingReviews' }} 
            style={{  marginTop: 8 }} />
          )} */}
        </View>
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
    position: 'relative',
    marginBottom: 16,
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
  },
  profileBadgesContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    top: 70,
    right: -40,
    flexWrap: 'wrap',
    maxWidth: 150,
  },
  profileBadge: {
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  eventsBadge: {
    backgroundColor: Colors.brandPurpleBright,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewsBadge: {
    backgroundColor: Colors.pinDarkBlue,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeNumber: {
    fontSize: 14,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 16,
  },
  badgeLabel: {
    fontSize: 7,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 9,
  },
  username: {
    fontSize: 32,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.brandPurpleDeep,
    marginBottom: 8,
    textAlign: 'center',
  },
  editProfileText: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.brandPurpleBright,
  },
});

export default ProfileOverview;

