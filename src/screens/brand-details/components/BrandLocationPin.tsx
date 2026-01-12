import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';

interface BrandLocationPinProps {
  logoUrl?: string | null;
}

const BrandLocationPin: React.FC<BrandLocationPinProps> = ({ logoUrl }) => {
  return (
    <View style={styles.pinContainer}>
      {logoUrl ? (
        <Image source={{ uri: logoUrl }} style={styles.logoImage} resizeMode="cover" />
      ) : (
        <View style={styles.pinWrapper}>
          <Monicon name="mdi:map-marker" size={80} color={Colors.blueColorMode} />
          <View style={styles.pinOverlay}>
            <Monicon name="mdi:magnify" size={18} color={Colors.white} />
          </View>
        </View>
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
  pinWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinOverlay: {
    position: 'absolute',
    top: 18,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
});

export default BrandLocationPin;

