import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';

interface ReferFriendButtonProps {
  onPress: () => void;
}

const ReferFriendButton: React.FC<ReferFriendButtonProps> = ({ onPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress} style={styles.button}>
        <Monicon name="mdi:account-multiple" size={24} color={Colors.white} />
        <Text style={styles.text}>Refer a Friend</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.white,
  },
});

export default ReferFriendButton;

