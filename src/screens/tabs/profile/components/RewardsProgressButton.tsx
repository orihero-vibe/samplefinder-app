import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ViewStarIcon } from '@/icons';
import { Colors } from '@/constants/Colors';

interface RewardsProgressButtonProps {
  onPress?: () => void;
}

const RewardsProgressButton: React.FC<RewardsProgressButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <ViewStarIcon size={24} color={Colors.blueColorMode} />
      <Text style={styles.text}>View Rewards Progress</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 24,
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.blueColorMode,
  },
});

export default RewardsProgressButton;

