import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '@/constants/Colors';
import { getLastAchievedBadge } from '@/constants';
import { CertifiedBrandAmbassadorIcon, CertifiedInfluencerIcon } from '@/icons';
import BadgeItem from '../../promotions/components/BadgeItem';

interface ProfileOverviewProps {
  username?: string;
  avatarUri?: string | null;
  onEditProfilePress?: () => void;
  isAmbassador?: boolean;
  isInfluencer?: boolean;
  eventCheckIns?: number;
  samplingReviews?: number;
}

const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  username = 'Username',
  avatarUri,
  onEditProfilePress,
  isAmbassador = false,
  isInfluencer = false,
  eventCheckIns = 0,
  samplingReviews = 0,
}) => {
  // Calculate last achieved badges
  const lastEventBadge = getLastAchievedBadge(eventCheckIns);
  const lastReviewBadge = getLastAchievedBadge(samplingReviews);
  return (
    <View style={styles.container}>
      <View style={styles.profilePictureContainer}>
        <View style={styles.avatarBorder}>
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={require('@/assets/locationImage.png')}
              style={styles.profileImage}
              resizeMode="contain"
            />
          )}
        </View>
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
          {lastEventBadge && (
            <BadgeItem 
              color={Colors.brandPurpleBright} 
              key={`event-${lastEventBadge}`} 
              size={32} 
              badge={{ count: lastEventBadge, label: '', achieved: true, id: 'eventCheckIns' }} 
              style={{ paddingTop: 6 }}
              isEventsBadge={true}
            />
          )}
          {lastReviewBadge && (
            <BadgeItem 
              color={Colors.pinDarkBlue} 
              key={`review-${lastReviewBadge}`} 
              size={32} 
              badge={{ count: lastReviewBadge, label: '', achieved: true, id: 'samplingReviews' }} 
              style={{ paddingTop: 6 }} 
            />
          )}
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
  avatarBorder: {
    width: 100,
    height: 100,
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
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
    left: 60,
    flexWrap: 'wrap',
    width: '45%',
    overflow: 'scroll',
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
  username: {
    fontSize: 24,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.pinBlueBlack,
    textAlign: 'center',
  },
  editProfileText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Regular',
    color: Colors.grayText,
  },
});

export default ProfileOverview;

