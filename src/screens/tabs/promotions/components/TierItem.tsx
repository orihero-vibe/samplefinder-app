import { Colors } from '@/constants/Colors';
import { getTierDisplayParts } from '@/utils/formatters';
import { Monicon } from '@monicon/native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface Tier {
  id: string;
  name: string;
  currentPoints: number;
  requiredPoints: number;
  badgeEarned: boolean;
  imageURL?: string | null;
  order?: number; // Tier order/level (1, 2, 3, etc.)
}

interface TierItemProps {
  tier: Tier;
  onIconPress?: (tier: Tier) => void;
}

const TierItem: React.FC<TierItemProps> = ({ tier, onIconPress }) => {
  const progress = Math.min((tier.currentPoints / tier.requiredPoints) * 100, 100);
  const [imageError, setImageError] = React.useState(false);
  const { main, subtitle } = getTierDisplayParts(tier.name);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={!onIconPress}
          onPress={() => onIconPress?.(tier)}
        >
          {tier.imageURL && !imageError ? (
            <Image
              source={{ uri: tier.imageURL }}
              style={styles.tierImage}
              resizeMode="contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <Monicon name="ph:seal-fill" size={80} color={Colors.pinDarkBlue} />
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{main}</Text>
          {subtitle ? <Text style={styles.nameSubtitle}>{subtitle}</Text> : null}
        </View>
        {tier.badgeEarned ? (
          <Text style={styles.badgeEarnedText}>Badge Earned!</Text>
        ) : (
          <Text style={styles.points}>
            {tier.currentPoints} / {tier.requiredPoints.toLocaleString()} points
          </Text>
        )}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  iconContainer: {
    paddingTop: 4,
  },
  tierImage: {
    width: 80,
    height: 80,
  },
  info: {
    flex: 1,
    justifyContent: 'space-around',
    paddingLeft: 10
  },
  nameRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: 4,
  },
  name: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
  },
  nameSubtitle: {
    fontSize: 12,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.blueColorMode,
  },
  points: {
    fontSize: 16,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.pinBlueBlack,
  },
  badgeEarnedText: {
    fontSize: 16,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.pinBlueBlack,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#D0D0D0',
    borderRadius: 4,
  },
});

export default TierItem;

