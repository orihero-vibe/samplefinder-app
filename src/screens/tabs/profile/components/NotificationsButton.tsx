import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';

interface NotificationsButtonProps {
  onPress?: () => void;
}

const NotificationsButton: React.FC<NotificationsButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Monicon name="mdi:bell" size={24} color={Colors.brandPurpleDeep} />
      <Text style={styles.text}>Notifications</Text>
      <Monicon name="mdi:chevron-right" size={24} color={Colors.brandPurpleDeep} />
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
  },
  text: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.brandPurpleDeep,
  },
});

export default NotificationsButton;

