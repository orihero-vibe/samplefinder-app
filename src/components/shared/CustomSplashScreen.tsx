import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';

const CustomSplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/splash.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default CustomSplashScreen;
