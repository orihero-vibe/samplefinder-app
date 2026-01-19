import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';
import { SparkleIcon, CertifiedBrandAmbassadorIcon, CertifiedInfluencerIcon } from '@/icons';
import { Badge, Tier } from './index';
import BadgeItem from './BadgeItem';

interface EarnedSectionProps {
  eventBadges: Badge[];
  reviewBadges: Badge[];
  tiers: Tier[];
  totalPoints: number;
  onTierPress?: (tier: Tier, points: number) => void;
  onPointsPress?: (points: number, tier?: Tier) => void;
  onViewHistory?: () => void;
  isAmbassador?: boolean;
  isInfluencer?: boolean;
}

const EarnedSection: React.FC<EarnedSectionProps> = ({
  eventBadges,
  reviewBadges,
  tiers,
  totalPoints,
  onTierPress,
  onPointsPress,
  onViewHistory,
  isAmbassador = false,
  isInfluencer = false,
}) => {
  const [imageError, setImageError] = useState(false);

  // Get earned badges
  const earnedEventBadges = eventBadges.filter((badge) => badge.achieved);
  const earnedReviewBadges = reviewBadges.filter((badge) => badge.achieved);
  
  // Get the highest earned tier
  const earnedTiers = tiers.filter((tier) => tier.badgeEarned);
  const currentTier = earnedTiers.length > 0 
    ? earnedTiers[earnedTiers.length - 1] // Get the most recent earned tier
    : tiers[0]; // Default to first tier if none earned

  const handleViewHistory = () => {
    onViewHistory?.();
  };

  return (
    <View style={styles.card}>
      {/* Header with Sparkle Icon */}
      <View style={styles.headerContainer}>
        <SparkleIcon size={32} color={Colors.brandPurpleBright} circleColor="transparent" />
        <Text style={styles.headerTitle}>ACHIEVEMENTS</Text>
      </View>

      {/* Description Text */}
      <Text style={styles.descriptionText}>
        Keep Sampling, Keep Earning Badges & Points! Come Back To Track Your Progress.
      </Text>

      {/* Current Achievement Badge */}
      {currentTier && (
        <TouchableOpacity
          style={styles.badgeContainer}
          onPress={() => onTierPress?.(currentTier, totalPoints)}
          activeOpacity={0.7}
        >
          <View style={styles.badgeIconContainer}>
            {currentTier.imageURL && !imageError ? (
              <Image
                source={{ uri: currentTier.imageURL }}
                style={styles.tierImage}
                resizeMode="contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <Monicon name="ph:seal-fill" size={100} color={Colors.pinDarkBlue} />
            )}
          </View>
          <Text style={styles.tierName}>{currentTier.name}</Text>
        </TouchableOpacity>
      )}

      {/* Points Earned */}
      <TouchableOpacity
        style={styles.pointsContainer}
        onPress={() => onPointsPress?.(totalPoints, currentTier || undefined)}
        activeOpacity={0.7}
      >
        <Text style={styles.pointsValue}>{totalPoints.toLocaleString()}</Text>
        <Text style={styles.pointsLabel}>Points Earned</Text>
      </TouchableOpacity>

      {/* Certifications */}
      <View style={styles.certificationsContainer}>
        <View style={styles.certificationRow}>
          <CertifiedBrandAmbassadorIcon size={50} disabled={!isAmbassador} />
          <Text style={[styles.certificationText, !isAmbassador && { color: '#999999' }]}>
            Certified Brand Ambassador
          </Text>
        </View>
        <View style={styles.certificationRow}>
          <CertifiedInfluencerIcon size={50} disabled={!isInfluencer} />
          <Text style={[styles.certificationText, !isInfluencer && { color: '#999999' }]}>
            Certified Influencer
          </Text>
        </View>
      </View>

      {/* Activity Badges */}
      <View style={styles.activityBadgesContainer}>
        {earnedEventBadges.map((badge) => (
          <BadgeItem key={badge.id} badge={badge} />
        ))}
      </View>
      <View style={styles.activityBadgesContainer}>
        {earnedReviewBadges.map((badge) => (
          <BadgeItem key={badge.id} badge={badge} color={Colors.pinDarkBlue} />
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
    padding: 24,
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.pinDarkBlue,
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 1,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.pinDarkBlue,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
    lineHeight: 20,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeIconContainer: {
    marginBottom: 12,
  },
  tierImage: {
    width: 100,
    height: 100,
  },
  tierName: {
    fontSize: 22,
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
    gap: 12,
    marginBottom: 16,
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
    gap: 12,
    marginBottom: 16,
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

