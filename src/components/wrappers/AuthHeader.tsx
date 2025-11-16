import React from 'react';
import { View, Image, StyleSheet, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AuthHeader = () => {
  const { top } = useSafeAreaInsets();
  return (
    <ImageBackground
      source={require('@/assets/header.png')}
      style={[styles.headerBackground, { height: !!top ? top + 80 : 80 }]}
      resizeMode="cover"
    >
      <View style={[styles.headerContent, { paddingTop: !!top ? top : 40 }]}>
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
    paddingBottom: 10,
    height: 120
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 280,
    height: 80,
  },
});

export default AuthHeader;


