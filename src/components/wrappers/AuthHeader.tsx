import React from 'react';
import { View, Image, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: screenHeight } = Dimensions.get('window');
const isSmallDevice = screenHeight < 700;
const isMediumDevice = screenHeight >= 700 && screenHeight < 800;

const AuthHeader = () => {
  const { top } = useSafeAreaInsets();
  const headerHeight = isSmallDevice ? 60 : 80;
  const totalHeight = !!top ? top + headerHeight : headerHeight;
  
  return (
    <ImageBackground
      source={require('@/assets/header.png')}
      style={[styles.headerBackground, { height: totalHeight }]}
      resizeMode="cover"
    >
      <View style={[styles.headerContent, { paddingTop: !!top ? top : (isSmallDevice ? 20 : 40) }]}>
        <Image
          source={require('@/assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  headerBackground: {
    width: '100%',
    paddingBottom: isSmallDevice ? 6 : 10,
    height: isSmallDevice ? 100 : 120
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: isSmallDevice ? 220 : isMediumDevice ? 250 : 280,
    height: isSmallDevice ? 60 : isMediumDevice ? 70 : 80,
  },
});

export default AuthHeader;


