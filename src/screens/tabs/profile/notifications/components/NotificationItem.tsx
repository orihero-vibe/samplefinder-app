import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SparkleNotificationIcon } from '@/icons/SparkleNotificationIcon';
import { Colors } from '@/constants/Colors';

export interface Notification {
  id: string;
  title: string;
  description: string;
  icon?: string;
  timestamp?: Date;
  isRead?: boolean;
}

interface NotificationItemProps {
  notification: Notification;
  onPress?: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress(notification.id);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, !notification.isRead && styles.unreadContainer]} 
      activeOpacity={0.7}
      onPress={handlePress}
    >
      {!notification.isRead && <View style={styles.unreadIndicator} />}
      <View style={styles.iconContainer}>
        <SparkleNotificationIcon size={56} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.description}>{notification.description}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    position: 'relative',
  },
  unreadContainer: {
    backgroundColor: '#F8F5FF',
  },
  unreadIndicator: {
    position: 'absolute',
    left: 8,
    top: '50%',
    marginTop: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1D0A74',
  },
  iconContainer: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.black,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: '#666666',
    lineHeight: 20,
  },
});
