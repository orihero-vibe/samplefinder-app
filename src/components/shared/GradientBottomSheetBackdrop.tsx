import React, { type ComponentProps } from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import {
  SCREEN_GRADIENT_COLORS,
  SCREEN_GRADIENT_END,
  SCREEN_GRADIENT_LOCATIONS,
  SCREEN_GRADIENT_START,
} from '@/constants/ScreenGradient';

type GradientBottomSheetBackdropProps = ComponentProps<typeof BottomSheetBackdrop>;

/**
 * Same brand gradient as screen / modals, for @gorhom/bottom-sheet backdrops.
 */
const GradientBottomSheetBackdrop: React.FC<GradientBottomSheetBackdropProps> = (props) => (
  <BottomSheetBackdrop
    {...props}
    style={[props.style, styles.transparentBackdrop]}
  >
    <LinearGradient
      pointerEvents="none"
      colors={[...SCREEN_GRADIENT_COLORS]}
      locations={SCREEN_GRADIENT_LOCATIONS}
      start={SCREEN_GRADIENT_START}
      end={SCREEN_GRADIENT_END}
      style={StyleSheet.absoluteFillObject}
    />
    <View pointerEvents="none" style={styles.dim} />
  </BottomSheetBackdrop>
);

const styles = StyleSheet.create({
  transparentBackdrop: {
    backgroundColor: 'transparent',
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 8, 28, 0.42)',
  },
});

export default GradientBottomSheetBackdrop;
