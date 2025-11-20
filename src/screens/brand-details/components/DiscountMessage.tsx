import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface DiscountMessageProps {
}

const DiscountMessage: React.FC<DiscountMessageProps> = () => {
  const message = `Discount appears here 
  when you check in at event! 
  Check In Code provided on-site.`;
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
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  discountText: {
    fontSize: 20,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
    lineHeight: 24,
    textAlign: 'center',
  },
});

export default DiscountMessage;

