import React, { useState, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';
import { getTierDisplayParts } from '@/utils/formatters';
import { CertifiedBrandAmbassadorIcon, CertifiedInfluencerIcon } from '@/icons';
import { Badge, Tier } from './index';
import BadgeItem from './BadgeItem';

interface EarnedSectionProps {
  eventBadges: Badge[];
  reviewBadges: Badge[];
  tiers: Tier[];
  totalPoints: number;
  onTierPress?: (tier: Tier, points: number) => void;
  onPointsPress?: (points: number, tier?: Tier) => void;
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
  const currentTierDisplayParts = currentTier ? getTierDisplayParts(currentTier.name) : null;

  return (
    <View style={styles.cardWrapper}>
      <LinearGradient
        colors={[Colors.badgePurpleLight, Colors.badgePurpleLight, Colors.blueColorMode, Colors.blueColorMode]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorderContainer}
      >
        <View style={styles.card}>
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
              {currentTierDisplayParts && (
                <View style={styles.tierNameRow}>
                  <Text style={styles.tierName}>{currentTierDisplayParts.main}</Text>
                  {currentTierDisplayParts.subtitle ? (
                    <Text style={styles.tierNameSubtitle}>{currentTierDisplayParts.subtitle}</Text>
                  ) : null}
                </View>
              )}
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
          {(isAmbassador || isInfluencer) && (
            <View style={styles.certificationsContainer}>
              {isAmbassador && (
                <View style={styles.certificationRow}>
                  <CertifiedBrandAmbassadorIcon size={50} disabled={false} />
                  <Text style={styles.certificationText}>
                    Certified Brand Ambassador
                  </Text>
                </View>
              )}
              {isInfluencer && (
                <View style={styles.certificationRow}>
                  <CertifiedInfluencerIcon size={50} disabled={false} />
                  <Text style={styles.certificationText}>
                    Certified Influencer
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Activity Badges */}
          {earnedEventBadges.length > 0 && (
          <View style={styles.activityBadgesContainer}>
            {earnedEventBadges.map((badge) => (
              <BadgeItem key={badge.id} badge={badge} isEventsBadge />
            ))}
          </View>
          )}
          {earnedReviewBadges.length > 0 && (
          <View style={styles.activityBadgesContainer}>
            {earnedReviewBadges.map((badge) => (
              <BadgeItem key={badge.id} badge={badge} color={Colors.pinDarkBlue} />
            ))}
          </View>
          )}
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
    padding: 24,
    alignItems: 'center',
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
  tierNameRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'baseline',
    gap: 4,
  },
  tierName: {
    fontSize: 22,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.pinDarkBlue,
    textAlign: 'center',
  },
  tierNameSubtitle: {
    fontSize: 12,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.pinDarkBlue,
    textAlign: 'center',
  },
  pointsContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  pointsValue: {
    fontSize: 50,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: Colors.brandPurpleBright,
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
    alignItems: 'center',
  },
  certificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  certificationText: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.pinDarkBlue,
  },
  activityBadgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
});

export default memo(EarnedSection);

