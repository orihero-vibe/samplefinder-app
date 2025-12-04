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
        <View style={styles.largePin}>
          <Monicon name="mdi:map-marker" size={48} color={Colors.blueColorMode} />
          <View style={styles.pinOverlay}>
            <Monicon name="mdi:magnify" size={20} color={Colors.white} />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pinContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  largePin: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.blueColorMode,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pinOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.blueColorMode,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
});

export default BrandLocationPin;

