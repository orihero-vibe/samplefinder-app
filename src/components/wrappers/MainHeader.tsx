import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Platform } from 'react-native';
import { Monicon } from '@monicon/native';

interface MainHeaderProps {
  onMapPress?: () => void;
  onListPress?: () => void;
  location?: string;
}

const MainHeader: React.FC<MainHeaderProps> = ({
  onMapPress,
  onListPress,
  location = 'Pennsylvania Convention Center',
}) => {
  return (
    <ImageBackground
      source={require('@/assets/main-header-bg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={onMapPress} style={styles.iconButton}>
            <Monicon name="mdi:map" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onListPress} style={styles.iconButton}>
            <Monicon name="mdi:format-list-bulleted" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.rightSection}>
          <Monicon name="mdi:map-marker" size={20} color="#FFFFFF" />
          <Text style={styles.appTitle}>SampleFinder</Text>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    paddingTop: Platform.OS === 'android' ? 30 : 60,
    paddingBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconButton: {
    padding: 5,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appTitle: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: '#FFFFFF',
  },
});

export default MainHeader;

