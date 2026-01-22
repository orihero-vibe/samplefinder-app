import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';
import { LocationPinIcon } from '@/icons';

interface BrandLocationPinProps {
  logoUrl?: string | null;
}

const BrandLocationPin: React.FC<BrandLocationPinProps> = ({ logoUrl }) => {
  return (
    <View style={styles.pinContainer}>
      {logoUrl ? (
        <Image source={{ uri: logoUrl }} style={styles.logoImage} resizeMode="cover" />
      ) : (
        <Image
        source={require('@/assets/locationImage.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pinContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  logoImage: {
    width: 75,
    height: 75,
  },
});

export default BrandLocationPin;

