import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { RoundedLogoImage } from '@/components';

interface BrandLocationPinProps {
  logoUrl?: string | null;
}

const BrandLocationPin: React.FC<BrandLocationPinProps> = ({ logoUrl }) => {
  return (
    <View style={styles.pinContainer}>
      <RoundedLogoImage
        source={logoUrl ? { uri: logoUrl } : require('@/assets/locationImage.png')}
        width={75}
        height={75}
        backgroundColor={logoUrl ? Colors.white : undefined}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  pinContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 8,
  },
});

export default BrandLocationPin;

