import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';
import { SparkleIcon } from '@/icons';
import { Badge, Tier } from './index';

interface EarnedSectionProps {
  eventBadges: Badge[];
  reviewBadges: Badge[];
  tiers: Tier[];
  onTierPress?: (tier: Tier, points: number) => void;
  onPointsPress?: (points: number, tier?: Tier) => void;
}

const EarnedSection: React.FC<EarnedSectionProps> = ({
  eventBadges,
  reviewBadges,
  tiers,
  onTierPress,
  onPointsPress,
}) => {
  // Get earned badges
  const earnedEventBadges = eventBadges.filter((badge) => badge.achieved);
  const earnedReviewBadges = reviewBadges.filter((badge) => badge.achieved);
  
  // Get the highest earned tier
  const earnedTiers = tiers.filter((tier) => tier.badgeEarned);
  const currentTier = earnedTiers.length > 0 
    ? earnedTiers[earnedTiers.length - 1] // Get the most recent earned tier
    : null;

  // Calculate total points earned
  // For now, we'll use the tier's required points as a proxy for points earned
  // In a real app, this would come from the backend
  const totalPointsEarned = earnedTiers.reduce((sum, tier) => sum + tier.requiredPoints, 0);

  const handleViewHistory = () => {
    // Handle view history action
    console.log('View history pressed');
  };

  return (
    <View style={styles.card}>
      {/* Current Achievement Badge */}
      {currentTier && (
        <TouchableOpacity
          style={styles.badgeContainer}
          onPress={() => onTierPress?.(currentTier, totalPointsEarned)}
          activeOpacity={0.7}
        >
          <View style={styles.badgeIconContainer}>
            <Monicon name="ph:seal-fill" size={120} color={Colors.pinDarkBlue} />
          </View>
          <Text style={styles.tierName}>{currentTier.name}</Text>
        </TouchableOpacity>
      )}

      {/* Points Earned */}
      <TouchableOpacity
        style={styles.pointsContainer}
        onPress={() => onPointsPress?.(totalPointsEarned, currentTier || undefined)}
        activeOpacity={0.7}
      >
        <Text style={styles.pointsValue}>{totalPointsEarned.toLocaleString()}</Text>
        <Text style={styles.pointsLabel}>Points Earned</Text>
      </TouchableOpacity>

      {/* Certifications */}
      <View style={styles.certificationsContainer}>
        <View style={styles.certificationRow}>
          <View style={[styles.certificationIcon, { backgroundColor: Colors.orangeBA }]}>
            <Monicon name="mdi:account" size={24} color={Colors.white} />
            <View style={styles.certificationSparkle}>
              <SparkleIcon size={12} color={Colors.white} circleColor="transparent" />
            </View>
          </View>
          <Text style={styles.certificationText}>Certified Brand Ambassador</Text>
        </View>
        <View style={styles.certificationRow}>
          <View style={[styles.certificationIcon, { backgroundColor: Colors.pinkInfluencer }]}>
            <Monicon name="mdi:cellphone" size={24} color={Colors.white} />
            <View style={styles.certificationSparkle}>
              <SparkleIcon size={12} color={Colors.white} circleColor="transparent" />
            </View>
          </View>
          <Text style={styles.certificationText}>Certified Influencer</Text>
        </View>
      </View>

      {/* Activity Badges */}
      <View style={styles.activityBadgesContainer}>
        {earnedEventBadges.map((badge) => (
          <View key={badge.id} style={styles.activityBadgeItem}>
            <View style={[styles.activityBadgeCircle, { backgroundColor: Colors.badgePurpleLight }]}>
              <Text style={styles.activityBadgeNumber}>#{badge.count}</Text>
              <View style={styles.activityBadgeSparkle}>
                <SparkleIcon size={10} color={Colors.white} circleColor="transparent" />
              </View>
            </View>
            <Text style={[styles.activityBadgeLabel, { color: Colors.badgePurpleLight }]}>
              EVENTS
            </Text>
          </View>
        ))}
        {earnedReviewBadges.map((badge) => (
          <View key={badge.id} style={styles.activityBadgeItem}>
            <View style={[styles.activityBadgeCircle, { backgroundColor: Colors.pinDarkBlue }]}>
              <Text style={styles.activityBadgeNumber}>#{badge.count}</Text>
              <View style={styles.activityBadgeSparkle}>
                <SparkleIcon size={10} color={Colors.white} circleColor="transparent" />
              </View>
            </View>
            <Text style={[styles.activityBadgeLabel, { color: Colors.pinDarkBlue }]}>
              REVIEWS
            </Text>
          </View>
        ))}
      </View>

      {/* View History Button */}
      <TouchableOpacity style={styles.viewHistoryButton} onPress={handleViewHistory}>
        <Monicon name="mdi:refresh" size={20} color={Colors.pinDarkBlue} />
        <View style={styles.viewHistoryTextSpacer} />
        <Text style={styles.viewHistoryText}>View History</Text>
      </TouchableOpacity>
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
    alignItems: 'center',
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  badgeIconContainer: {
    marginBottom: 12,
  },
  tierName: {
    fontSize: 24,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.pinDarkBlue,
    textAlign: 'center',
  },
  pointsContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  pointsValue: {
    fontSize: 48,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.pinkInfluencer,
    marginBottom: 4,
  },
  pointsLabel: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.pinDarkBlue,
  },
  certificationsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  certificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  certificationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  certificationSparkle: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  certificationText: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.pinDarkBlue,
    flex: 1,
  },
  activityBadgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
  },
  activityBadgeItem: {
    alignItems: 'center',
    width: 60,
    marginHorizontal: 8,
    marginBottom: 12,
  },
  activityBadgeCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  activityBadgeNumber: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.white,
  },
  activityBadgeSparkle: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  activityBadgeLabel: {
    fontSize: 10,
    fontFamily: 'Quicksand_600SemiBold',
    textAlign: 'center',
  },
  viewHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  viewHistoryTextSpacer: {
    width: 8,
  },
  viewHistoryText: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.pinDarkBlue,
  },
});

export default EarnedSection;

