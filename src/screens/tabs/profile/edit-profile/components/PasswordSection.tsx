import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CustomInput from '@/components/shared/CustomInput';
import { Colors } from '@/constants/Colors';

interface PasswordSectionProps {
  password: string;
  newPassword: string;
  confirmPassword: string;
  onPasswordChange: (text: string) => void;
  onNewPasswordChange: (text: string) => void;
  onConfirmPasswordChange: (text: string) => void;
  isLoading: boolean;
}

export const PasswordSection: React.FC<PasswordSectionProps> = ({
  password,
  newPassword,
  confirmPassword,
  onPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  isLoading,
}) => {
  return (
    <View style={styles.passwordSection}>
      <Text style={styles.sectionTitle}>Change Password (Optional)</Text>
      <Text style={styles.sectionSubtitle}>
        Leave blank if you don't want to change your password
      </Text>
      
      <CustomInput
        label="Current Password"
        value={password}
        onChangeText={onPasswordChange}
        type="password"
        placeholder="Enter current password"
        labelColor={Colors.blueColorMode}
        inputBorderColor={Colors.blueColorMode}
        showPasswordToggle={true}
      />

      <CustomInput
        label="New Password"
        value={newPassword}
        onChangeText={onNewPasswordChange}
        type="password"
        placeholder="Enter new password"
        labelColor={Colors.blueColorMode}
        inputBorderColor={Colors.blueColorMode}
        showPasswordToggle={true}
      />

      <CustomInput
        label="Confirm New Password"
        value={confirmPassword}
        onChangeText={onConfirmPasswordChange}
        type="password"
        placeholder="Confirm new password"
        labelColor={Colors.blueColorMode}
        inputBorderColor={Colors.blueColorMode}
        showPasswordToggle={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  passwordSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: 'Quicksand_400Regular',
    color: '#666',
    marginBottom: 16,
  },
});

