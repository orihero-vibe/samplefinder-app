import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  SCREEN_GRADIENT_COLORS,
  SCREEN_GRADIENT_END,
  SCREEN_GRADIENT_LOCATIONS,
  SCREEN_GRADIENT_START,
} from '@/constants/ScreenGradient';

interface ModalBackdropProps {
  children: React.ReactNode;
  /** Merged with the root container (typically flex, padding, alignment). */
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Full-screen brand gradient plus a light dim layer — use behind modal cards instead of flat rgba overlays.
 */
const ModalBackdrop: React.FC<ModalBackdropProps> = ({ children, containerStyle }) => (
  <View style={[styles.root, containerStyle]}>
    <LinearGradient
      pointerEvents="none"
      colors={[...SCREEN_GRADIENT_COLORS]}
      locations={SCREEN_GRADIENT_LOCATIONS}
      start={SCREEN_GRADIENT_START}
      end={SCREEN_GRADIENT_END}
      style={StyleSheet.absoluteFill}
    />
    <View pointerEvents="none" style={styles.dim} />
    {children}
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 8, 28, 0.42)',
  },
});

export default ModalBackdrop;
