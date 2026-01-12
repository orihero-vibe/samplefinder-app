import { Colors } from '@/constants/Colors';
import { Monicon } from '@monicon/native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PromotionsHeaderProps {
  totalPoints?: number;
}

const PromotionsHeader: React.FC<PromotionsHeaderProps> = ({ totalPoints = 0 }) => {
  return (
    <View style={styles.container}>
      <View style={styles.starIconContainer}>
        <Monicon name="mage:stars-a" size={80} color={Colors.blueColorMode} />
      </View>
      <Text style={styles.title}>ACHIEVEMENTS</Text>
      <Text style={styles.motivationalText}>
        Keep Sampling, Keep Earning Badges & Points! Come Back To Track Your Progress.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  starIconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.white,
    marginBottom: 12,
    textAlign: 'center',
  },

  motivationalText: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.white,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
});

export default PromotionsHeader;

