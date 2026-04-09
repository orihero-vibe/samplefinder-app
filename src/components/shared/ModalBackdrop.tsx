import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';

interface ModalBackdropProps {
  children: React.ReactNode;
  /** Merged with the root container (typically flex, padding, alignment). */
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Full-screen single-color overlay used behind modal cards.
 */
const ModalBackdrop: React.FC<ModalBackdropProps> = ({ children, containerStyle }) => (
  <View style={[styles.root, containerStyle]}>
    <View pointerEvents="none" style={styles.overlay} />
    {children}
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgb(145, 1, 104, 0.62)',
  },
});

export default ModalBackdrop;
