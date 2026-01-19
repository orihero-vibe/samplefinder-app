import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';

export interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface NotificationSectionProps {
  enablePushNotifications: boolean;
  notificationSettings: NotificationSetting[];
  onPushNotificationsChange: (value: boolean) => void;
  onNotificationToggle: (id: string) => void;
}

export const NotificationSection: React.FC<NotificationSectionProps> = ({
  enablePushNotifications,
  notificationSettings,
  onPushNotificationsChange,
  onNotificationToggle,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.iconContainer}>
          <Monicon name="mdi:bell" size={24} color={Colors.black} />
        </View>
        <View style={styles.sectionHeaderText}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <Text style={styles.sectionDescription}>Manage your notification preferences</Text>
        </View>
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingContent}>
          <Text style={styles.settingLabel}>Enable Push Notifications</Text>
        </View>
        <Switch
          value={enablePushNotifications}
          onValueChange={onPushNotificationsChange}
          trackColor={{ false: '#E0E0E0', true: Colors.blueColorMode }}
          thumbColor={Colors.white}
        />
      </View>

      <Text style={styles.subHeading}>Choose which notifications you'd like to receive:</Text>
      <View style={styles.subHeadingSpacer} />

      {notificationSettings.map((setting) => (
        <View 
          key={setting.id} 
          style={[
            styles.notificationSettingRow,
            !enablePushNotifications && styles.notificationSettingRowDisabled,
          ]}
        >
          <View style={styles.settingContent}>
            <Text style={[
              styles.settingLabel,
              !enablePushNotifications && styles.settingLabelDisabled,
            ]}>
              {setting.label}
            </Text>
            <Text style={[
              styles.notificationDescription,
              !enablePushNotifications && styles.notificationDescriptionDisabled,
            ]}>
              {setting.description}
            </Text>
          </View>
          <Switch
            value={setting.enabled}
            onValueChange={() => onNotificationToggle(setting.id)}
            trackColor={{ false: '#E0E0E0', true: Colors.blueColorMode }}
            thumbColor={Colors.white}
            disabled={!enablePushNotifications}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.black,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: '#666666',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  notificationSettingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  notificationSettingRowDisabled: {
    opacity: 0.5,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.black,
    marginBottom: 4,
  },
  settingLabelDisabled: {
    color: '#999999',
  },
  notificationDescription: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: '#666666',
    lineHeight: 20,
  },
  notificationDescriptionDisabled: {
    color: '#AAAAAA',
  },
  subHeading: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: '#666666',
    marginTop: 8,
  },
  subHeadingSpacer: {
    height: 8,
  },
});

