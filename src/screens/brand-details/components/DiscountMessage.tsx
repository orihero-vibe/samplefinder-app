import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface DiscountMessageProps {}

const DiscountMessage: React.FC<DiscountMessageProps> = () => {
  return (
    <View style={styles.discountContainer}>
      <Text style={styles.discountText}>Discount appears here</Text>
      <Text style={styles.discountText}>when you check in at event!</Text>
      <Text style={styles.discountText}>Check In Code provided on-site.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  discountContainer: {
    paddingHorizontal: 40,
    marginBottom: 28,
    marginTop: 8,
    alignItems: 'center',
  },
  discountText: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
    lineHeight: 26,
    textAlign: 'center',
  },
});

export default DiscountMessage;

