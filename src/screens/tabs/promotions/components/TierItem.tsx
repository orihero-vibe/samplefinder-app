import { Colors } from '@/constants/Colors';
import { Monicon } from '@monicon/native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface Tier {
  id: string;
  name: string;
  currentPoints: number;
  requiredPoints: number;
  badgeEarned: boolean;
}

interface TierItemProps {
  tier: Tier;
}

const TierItem: React.FC<TierItemProps> = ({ tier }) => {
  const progress = Math.min((tier.currentPoints / tier.requiredPoints) * 100, 100);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Monicon name="ph:seal-fill" size={24} color={Colors.pinDarkBlue} />
      </View>
      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.name}>{tier.name}</Text>
          {tier.badgeEarned ? (
            <Text style={styles.badgeEarnedText}>Badge Earned!</Text>
          ) : (
            <Text style={styles.points}>
              {tier.currentPoints} / {tier.requiredPoints.toLocaleString()} points
            </Text>
          )}
        </View>
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
    gap: 12,
  },
  iconContainer: {
    paddingTop: 4,
  },
  info: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.black,
    flex: 1,
  },
  points: {
    fontSize: 12,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.black,
  },
  badgeEarnedText: {
    fontSize: 12,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.success,
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

