import { Colors } from '@/constants/Colors';
import { Monicon } from '@monicon/native';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export interface Tier {
  id: string;
  name: string;
  currentPoints: number;
  requiredPoints: number;
  badgeEarned: boolean;
  imageURL?: string | null;
}

interface TierItemProps {
  tier: Tier;
}

const TierItem: React.FC<TierItemProps> = ({ tier }) => {
  const progress = Math.min((tier.currentPoints / tier.requiredPoints) * 100, 100);
  const [imageError, setImageError] = React.useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
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
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{tier.name}</Text>
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
  name: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
  },
  points: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Normal',
    color: Colors.black,
  },
  badgeEarnedText: {
    fontSize: 16,
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

