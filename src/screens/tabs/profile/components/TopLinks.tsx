import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';

interface TopLinksProps {
  onReferFriendPress?: () => void;
  onLogOutPress?: () => void;
}

const TopLinks: React.FC<TopLinksProps> = ({ onReferFriendPress, onLogOutPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onReferFriendPress} style={styles.referFriendButton}>
        <Monicon name="mdi:account-multiple" size={24} color={Colors.brandPurpleDeep} />
        <Text style={styles.referFriendText}>Refer a Friend</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onLogOutPress} style={styles.logOutButton}>
        <Text style={styles.logOutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  referFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  referFriendText: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.brandPurpleDeep,
  },
  logOutButton: {
    padding: 5,
  },
  logOutText: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.black,
  },
});

export default TopLinks;

