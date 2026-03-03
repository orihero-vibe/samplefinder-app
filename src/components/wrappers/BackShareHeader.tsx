import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Monicon } from '@monicon/native';
import { BellOutlineIcon } from '@/icons/BellOutlineIcon';
import BellWithStarIcon from '@/icons/BellWithStarIcon';
import SampleFinderIcon from '@/icons/SampleFinderIcon';
import { ShareIcon } from '@/icons';

interface BackShareHeaderProps {
  onBack?: () => void;
  onShare?: () => void;
  onNotifications?: () => void;
  hasUnreadNotifications?: boolean;
}

const BackShareHeader: React.FC<BackShareHeaderProps> = ({ onBack, onShare, onNotifications, hasUnreadNotifications }) => {
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground
      source={require('@/assets/main-header-bg.png')}
      style={[styles.headerBackground, { paddingTop: insets.top + 10 }]}
      resizeMode="cover"
    >
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={onBack} style={styles.iconButton}>
            <Monicon name="mdi:arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onShare} style={styles.iconButton}>
            <ShareIcon size={20} color="#FFFFFF" />
          </TouchableOpacity>
          {onNotifications && (
            <TouchableOpacity onPress={onNotifications} style={styles.iconButton}>
              {hasUnreadNotifications ? (
                <BellWithStarIcon size={21} color="#FFFFFF" />
              ) : (
                <BellOutlineIcon size={21} color="white" />
              )}
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.rightSection}>
        <SampleFinderIcon width={160} color="#FFFFFF" />
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  headerBackground: {
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
    gap: 20,
  },
  iconButton: {
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

