import React from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Monicon } from '@monicon/native';
import { MapIcon, SampleFinderIcon } from '@/icons';

interface MainHeaderProps {
  onMapPress?: () => void;
  onListPress?: () => void;
  location?: string;
  showLeftIcons?: boolean;
  activeView?: 'map' | 'list';
}

const MainHeader: React.FC<MainHeaderProps> = ({
  onMapPress,
  onListPress,
  location = 'Pennsylvania Convention Center',
  showLeftIcons = true,
  activeView = 'list',
}) => {
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground
      source={require('@/assets/main-header-bg.png')}
      style={[styles.background, { paddingTop: insets.top + 10 }]}
      resizeMode="cover"
    >
      <View style={styles.header}>
        <View style={styles.leftSection}>
          {showLeftIcons && (
            <>
              <TouchableOpacity onPress={onMapPress} style={styles.iconButton}>
                <MapIcon size={20} color={activeView === 'map' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onListPress} style={styles.iconButton}>
                <Monicon name="mdi:format-list-bulleted" size={24} color={activeView === 'list' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'} />
              </TouchableOpacity>
            </>
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
  background: {
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

