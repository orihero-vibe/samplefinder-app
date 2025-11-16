import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Footer = () => {
  const { bottom } = useSafeAreaInsets();
  return (
    <View style={styles.footer}>
      <Image
        source={require('@/assets/footer.png')}
        style={[styles.footerImage, { bottom: 0 }]}
        resizeMode="stretch"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    paddingVertical: 0,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  footerImage: {
    width: '100%',
    height: 80,
  },
});

export default Footer;

