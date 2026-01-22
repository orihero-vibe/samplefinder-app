import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';
import { CertifiedInfluencerIcon, CertifiedBrandAmbassadorIcon } from '@/icons';
import BadgeItem, { Badge } from './BadgeItem';
import BadgeRequirementsModal from './BadgeRequirementsModal';

interface BadgesSectionProps {
  eventCheckIns: number;
  reviews: number;
  eventBadges: Badge[];
  reviewBadges: Badge[];
  isAmbassador?: boolean;
  isInfluencer?: boolean;
}

const BadgesSection: React.FC<BadgesSectionProps> = ({
  eventCheckIns,
  reviews,
  eventBadges,
  reviewBadges,
  isAmbassador = false,
  isInfluencer = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.cardWrapper}>
      <LinearGradient
        colors={[Colors.badgePurpleLight, Colors.badgePurpleLight , Colors.blueColorMode, Colors.blueColorMode]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorderContainer}
      >
        <View style={styles.card}>
          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <View style={styles.sectionIcon}>
                <Monicon name="streamline:star-2-remix" size={24} color={Colors.pinDarkBlue} />
              </View>
              <Text style={styles.sectionTitle}>BADGES</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Earn badges as you sample and leave reviews! You'll earn points as you go.
            </Text>
          </View>

          {/* Gradient Border Line */}
          <View style={styles.gradientBorder}/>

          {/* Event Check-in Progress */}
          <View style={styles.progressSection}>
        <Text style={styles.progressText}>
          You've checked in at <Text style={styles.boldText}>{eventCheckIns}</Text> events!
        </Text>
        <View style={styles.badgesRow}>
          {eventBadges.map((badge) => (
            <BadgeItem key={badge.id} badge={badge} isEventsBadge={true} />
          ))}
        </View>
      </View>

      {/* Review Progress */}
      <View style={styles.progressSection}>
        <Text style={styles.progressText}>
          You've left <Text style={styles.boldText}>{reviews}</Text> reviews!
        </Text>
        <View style={styles.badgesRow}>
          {reviewBadges.map((badge) => (
            <BadgeItem color={Colors.pinDarkBlue} key={badge.id} badge={badge} />
          ))}
        </View>
      </View>

      {/* Identifier Badges */}
      <View style={styles.identifierSection}>
        <View style={styles.identifierHeader}>
          <Text style={styles.identifierTitle}>Identifier Badges</Text>
          <TouchableOpacity hitSlop={10} onPress={handleOpenModal}>
            <Monicon name="mdi:help-circle-outline" size={18} color="#999999" />
          </TouchableOpacity>
        </View>
        <View style={styles.identifierBadgeRow}>
          <CertifiedBrandAmbassadorIcon size={50} disabled={!isAmbassador} />
          <Text style={[styles.identifierBadgeText, !isAmbassador && styles.disabledText]}>
            Certified Brand Ambassador
          </Text>
        </View>
        <View style={styles.identifierBadgeRow}>
          <CertifiedInfluencerIcon size={50} disabled={!isInfluencer} />
          <Text style={[styles.identifierBadgeText, !isInfluencer && styles.disabledText]}>
            Certified Influencer
          </Text>
        </View>
      </View>

          {/* Badge Requirements Modal */}
          <BadgeRequirementsModal
            visible={modalVisible}
            onClose={handleCloseModal}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  gradientBorderContainer: {
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    paddingBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  gradientBorder: {
    height: 5,
    marginBottom: 20,
    backgroundColor: Colors.badgePurpleLight,
  },
  sectionIconContainer: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flex: 2,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  sectionIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.blueColorMode,
    borderRadius: 50,
    padding: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.pinDarkBlue,
  },
  sectionDescription: {
    fontSize: 17,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.black,
    lineHeight: 22,
    flex: 3,
  },
  progressSection: {
    marginBottom: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  boldText: {
    fontFamily: 'Quicksand_700Bold',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  identifierSection: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  identifierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  identifierTitle: {
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.black,
  },
  identifierBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  identifierBadgeText: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.black,
    flex: 1,
  },
  disabledText: {
    color: '#999999',
  },
});

export default BadgesSection;

