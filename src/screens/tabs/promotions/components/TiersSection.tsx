import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';
import TierItem, { Tier } from './TierItem';
import { SealCheckLightIcon } from '@/components';

interface TiersSectionProps {
  tiers: Tier[];
}

const TiersSection: React.FC<TiersSectionProps> = ({ tiers }) => {
  return (
    <View style={styles.cardWrapper}>
      <LinearGradient
        colors={[Colors.blueColorMode, Colors.brandPurpleWine, Colors.blueColorMode]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorderContainer}
      >
        <View style={styles.card}>
          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <SealCheckLightIcon />
              <Text style={styles.sectionTitle}>TIERS</Text>
            </View>
            <Text style={styles.sectionDescription}>
              As your point count grows, you'll advance tiers and get closer to earning rewards.
            </Text>
          </View>

          {/* Gradient Border Line */}
          <View style={styles.gradientBorder} />

          {/* Tier Items */}
          <View style={styles.tierItemsContainer}>
          {tiers.map((tier) => (
            <TierItem key={tier.id} tier={tier} />
          ))}
          </View>
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
    width: '100%',
    paddingVertical: 20,

  },
  gradientBorder: {
    height: 5,
    marginBottom: 20,
    backgroundColor: Colors.brandBlueBright,
  },
  sectionIconContainer: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flex: 2,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.pinDarkBlue,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.black,
    lineHeight: 20,
    flex: 3,
    paddingRight: 20,
    marginRight: 20,
    textAlignVertical: 'center',
  },
  tierItemsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

export default TiersSection;

