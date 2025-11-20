import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';
import TierItem, { Tier } from './TierItem';

interface TiersSectionProps {
  tiers: Tier[];
}

const TiersSection: React.FC<TiersSectionProps> = ({ tiers }) => {
  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconContainer}>
          <Monicon name="ph:seal-check-light" size={24} color={Colors.pinDarkBlue} />
          <Text style={styles.sectionTitle}>TIERS</Text>
        </View>
        <Text style={styles.sectionDescription}>
          As your point count grows, you'll advance tiers and get closer to earning rewards.
        </Text>
      </View>

      {tiers.map((tier) => (
        <TierItem key={tier.id} tier={tier} />
      ))}
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
  },
  sectionIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.pinDarkBlue,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.black,
    lineHeight: 20,
  },
});

export default TiersSection;

