import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export interface PersonalInfoData {
  tierStatus?: string;
}

interface PersonalInfoSectionProps {
  data?: PersonalInfoData;
}

// Note: personal/contact details (date of birth, phone number, email) are
// intentionally NOT rendered here. This section is captured into the shared
// profile image, so any PII shown would leak when a user shares their profile.
// Keep this section limited to non-sensitive, shareable info.
const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  data = {
    tierStatus: 'NewbieSampler',
  },
}) => {
  const rows: { label: string; value?: string }[] = [
    { label: 'TIER STATUS:', value: data.tierStatus },
  ];

  return (
    <View style={styles.container}>
      {rows.map(({ label, value }) =>
        value ? (
          <View key={label} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
          </View>
        ) : null,
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
    marginRight: 8,
    width: '40%',
    includeFontPadding: false,
  },
  infoValue: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.pinBlueBlack,
    flex: 1,
    flexShrink: 1,
    includeFontPadding: false,
  },
});

export default PersonalInfoSection;

