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
      <View style={[styles.logoWrapper, logoUrl && styles.logoWrapperWithBg]}>
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} style={styles.logoImage} resizeMode="contain" />
        ) : (
          <Image
            source={require('@/assets/locationImage.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pinContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 8,
  },
  logoWrapper: {
    width: 75,
    height: 75,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapperWithBg: {
    backgroundColor: Colors.white,
  },
  logoImage: {
    width: 75,
    height: 75,
  },
});

export default BrandLocationPin;

