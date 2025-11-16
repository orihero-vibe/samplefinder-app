import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface DiscountMessageProps {
  message?: string;
}

const DiscountMessage: React.FC<DiscountMessageProps> = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <View style={styles.discountContainer}>
      <Text style={styles.discountText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  discountContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  discountText: {
    fontSize: 14,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
    lineHeight: 20,
  },
});

export default DiscountMessage;

