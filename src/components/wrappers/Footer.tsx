import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: screenHeight } = Dimensions.get('window');
const isSmallDevice = screenHeight < 700;
const isMediumDevice = screenHeight >= 700 && screenHeight < 800;

const Footer = () => {
  const { bottom } = useSafeAreaInsets();
  const footerHeight = isSmallDevice ? 60 : isMediumDevice ? 70 : 80;
  
  return (
    <View style={[styles.footer, { height: footerHeight,  }]}>
      <Image
        source={require('@/assets/footer.png')}
        style={styles.footerImage}
        resizeMode="stretch"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    paddingVertical: 0,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  footerImage: {
    width: '100%',
    height: isSmallDevice ? 60 : isMediumDevice ? 70 : 80,
  },
});

export default Footer;

