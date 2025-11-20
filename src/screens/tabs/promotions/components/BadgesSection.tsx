import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';
import { SparkleIcon } from '@/icons';
import BadgeItem, { Badge } from './BadgeItem';

interface BadgesSectionProps {
  eventCheckIns: number;
  reviews: number;
  eventBadges: Badge[];
  reviewBadges: Badge[];
}

const BadgesSection: React.FC<BadgesSectionProps> = ({
  eventCheckIns,
  reviews,
  eventBadges,
  reviewBadges,
}) => {
  return (
    <View style={styles.card}>
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

      {/* Event Check-in Progress */}
      <View style={styles.progressSection}>
        <Text style={styles.progressText}>
          You've checked in at <Text style={styles.boldText}>{eventCheckIns}</Text> events!
        </Text>
        <View style={styles.badgesRow}>
          {eventBadges.map((badge) => (
            <BadgeItem  key={badge.id} badge={badge} />
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
            <BadgeItem color={Colors.brandBlueBright} key={badge.id} badge={badge} />
          ))}
        </View>
      </View>

      {/* Identifier Badges */}
      <View style={styles.identifierSection}>
        <View style={styles.identifierHeader}>
          <Text style={styles.identifierTitle}>Identifier Badges</Text>
          <TouchableOpacity style={styles.helpButton}>
            <Monicon name="mdi:help-circle" size={16} color="#999999" />
          </TouchableOpacity>
        </View>
        <View style={styles.identifierBadgeRow}>
          <View style={[styles.identifierBadgeCircle, { backgroundColor: Colors.orangeBA }]}>
            <Monicon name="mdi:account" size={24} color={Colors.white} />
            <View style={styles.badgeStarOverlay}>
              <SparkleIcon size={12} color={Colors.white} circleColor="transparent" />
            </View>
          </View>
          <Text style={styles.identifierBadgeText}>Certified Brand Ambassador</Text>
        </View>
        <View style={styles.identifierBadgeRow}>
          <View style={[styles.identifierBadgeCircle, { backgroundColor: Colors.pinkInfluencer }]}>
            <Monicon name="mdi:cellphone" size={24} color={Colors.white} />
            <View style={styles.badgeStarOverlay}>
              <SparkleIcon size={12} color={Colors.white} circleColor="transparent" />
            </View>
          </View>
          <Text style={[styles.identifierBadgeText, styles.disabledText]}>
            Certified Influencer
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    marginBottom: 20,
    flexDirection: 'row',
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
    gap: 12,
  },
  identifierSection: {
    marginTop: 8,
  },
  identifierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  identifierTitle: {
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.black,
  },
  helpButton: {
    padding: 4,
  },
  identifierBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  identifierBadgeCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeStarOverlay: {
    position: 'absolute',
    top: 2,
    right: 2,
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

