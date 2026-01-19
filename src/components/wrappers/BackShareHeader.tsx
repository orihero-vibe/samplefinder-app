import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Platform } from 'react-native';
import { Monicon } from '@monicon/native';
import { BellOutlineIcon } from '@/icons/BellOutlineIcon';

interface BackShareHeaderProps {
  onBack?: () => void;
  onShare?: () => void;
  onNotifications?: () => void;
}

const BackShareHeader: React.FC<BackShareHeaderProps> = ({ onBack, onShare, onNotifications }) => {
  return (
    <ImageBackground
      source={require('@/assets/main-header-bg.png')}
      style={styles.headerBackground}
      resizeMode="cover"
    >
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={onBack} style={styles.iconButton}>
            <Monicon name="mdi:arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onShare} style={styles.iconButton}>
            <Monicon name="mdi:share-variant" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {onNotifications && (
            <TouchableOpacity onPress={onNotifications} style={styles.iconButton}>
              <BellOutlineIcon/>
            </TouchableOpacity>
          )}
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
  headerBackground: {
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

export default BackShareHeader;

