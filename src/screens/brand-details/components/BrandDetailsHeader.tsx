import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Platform } from 'react-native';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';

interface BrandDetailsHeaderProps {
  onBack: () => void;
  onShare: () => void;
}

const BrandDetailsHeader: React.FC<BrandDetailsHeaderProps> = ({ onBack, onShare }) => {
  return (
    <ImageBackground
      source={require('@/assets/main-header-bg.png')}
      style={styles.headerBackground}
      resizeMode="cover"
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Monicon name="mdi:arrow-left" size={24} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onShare} style={styles.headerButton}>
          <Monicon name="mdi:share-variant" size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <Monicon name="mdi:map-marker" size={20} color={Colors.white} />
          <Text style={styles.headerTitle}>SampleFinder</Text>
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
  headerButton: {
    padding: 5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.white,
  },
});

export default BrandDetailsHeader;

