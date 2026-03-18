import React from 'react';
import { View, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RoundedLogoImage } from '@/components';

const { height: screenHeight } = Dimensions.get('window');
const isSmallDevice = screenHeight < 700;
const isMediumDevice = screenHeight >= 700 && screenHeight < 800;

interface AuthHeaderProps {
  leftElement?: React.ReactNode;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ leftElement }) => {
  const { top } = useSafeAreaInsets();
  const headerHeight = isSmallDevice ? 60 : 80;
  const totalHeight = !!top ? top + headerHeight : headerHeight;
  const logoWidth = isSmallDevice ? 220 : isMediumDevice ? 250 : 280;
  const logoHeight = isSmallDevice ? 60 : isMediumDevice ? 70 : 80;
  
  return (
    <ImageBackground
      source={require('@/assets/header.png')}
      style={[styles.headerBackground, { height: totalHeight }]}
      resizeMode="cover"
    >
      <View
        style={[
          styles.headerRow,
          { paddingTop: !!top ? top : (isSmallDevice ? 20 : 40) },
        ]}
      >
        <View style={styles.leftSlot}>{leftElement}</View>
        <View style={styles.logoSlot}>
          <RoundedLogoImage
            source={require('@/assets/logo.png')}
            width={logoWidth}
            height={logoHeight}
            resizeMode="contain"
          />
        </View>
        <View style={styles.rightSlot} />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  headerBackground: {
    width: '100%',
    paddingBottom: 20,
    height: isSmallDevice ? 100 : 120
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  leftSlot: {
    minWidth: 44,
  },
  logoSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSlot: {
    minWidth: 44,
  },
});

export default AuthHeader;


