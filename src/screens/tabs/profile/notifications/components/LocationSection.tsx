import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';

interface LocationSectionProps {
  enableLocationAccess: boolean;
  shareLocationWithBrands: boolean;
  onLocationAccessChange: (value: boolean) => void;
  onShareLocationChange: (value: boolean) => void;
}

export const LocationSection: React.FC<LocationSectionProps> = ({
  enableLocationAccess,
  shareLocationWithBrands,
  onLocationAccessChange,
  onShareLocationChange,
}) => {
  return (
    <View style={[styles.section, styles.firstSection]}>
      <View style={styles.sectionHeader}>
        <View style={styles.iconContainer}>
          <Monicon name="mdi:map-marker" size={24} color={Colors.black} />
        </View>
        <View style={styles.sectionHeaderText}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.sectionDescription}>Required for event discovery</Text>
        </View>
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingContent}>
          <Text style={styles.settingLabel}>Enable Location Access</Text>
        </View>
        <Switch
          value={enableLocationAccess}
          onValueChange={onLocationAccessChange}
          trackColor={{ false: '#E0E0E0', true: Colors.blueColorMode }}
          thumbColor={Colors.white}
        />
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingContent}>
          <Text style={styles.settingLabel}>Share location with brands</Text>
        </View>
        <Switch
          value={shareLocationWithBrands}
          onValueChange={onShareLocationChange}
          trackColor={{ false: '#E0E0E0', true: Colors.blueColorMode }}
          thumbColor={Colors.white}
        />
      </View>

      <Text style={styles.settingDescription}>
        Allow brands to see your approximate location during events.
      </Text>
      <View style={styles.settingDescriptionSpacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  firstSection: {
    paddingTop: 20,
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
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: '#666666',
    marginTop: 4,
    marginBottom: 8,
    paddingLeft: 0,
  },
  settingDescriptionSpacer: {
    height: 8,
  },
});

