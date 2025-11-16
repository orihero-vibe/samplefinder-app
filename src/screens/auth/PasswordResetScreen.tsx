import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ScreenWrapper from '@/components/wrappers/ScreenWrapper';
import CustomButton from '@/components/shared/CustomButton';
import CustomInput from '@/components/shared/CustomInput';

const PasswordResetScreen = ({ navigation, route }: any) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleCreatePassword = () => {
    // TODO: Implement password creation logic
    console.log('Create password pressed', { password });
    // Navigate to login or success screen after password creation
  };

  return (
    <ScreenWrapper 
      contentBackgroundColor="#fff"
      contentContainerStyle={styles.wrapperContent}
    >
      <StatusBar style="light" />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>PASSWORD RESET</Text>
        
        <Text style={styles.instruction}>
          Almost there! For your security, please change your password to something you haven't used before.
        </Text>

        <View style={styles.formContainer}>
          <CustomInput
            label="Create Password"
            value={password}
            onChangeText={setPassword}
            placeholder=""
            secureTextEntry={!showPassword}
            showPasswordToggle={true}
            onTogglePassword={() => setShowPassword(!showPassword)}
            variant="underline"
            labelColor="#666"
          />

          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementText}>• minimum of 8 characters</Text>
            <Text style={styles.requirementText}>• may not include username</Text>
            <Text style={styles.requirementText}>• must include at least 1 Uppercase</Text>
            <Text style={styles.requirementText}>• must include at least 1 lowercase</Text>
            <Text style={styles.requirementText}>• must include 1 number</Text>
            <Text style={styles.requirementText}>• must include at least 1 special character</Text>
          </View>

          <View style={styles.buttonContainer}>
            <CustomButton
              title="Create Password"
              onPress={handleCreatePassword}
              variant="dark"
            />
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  wrapperContent: {
    paddingHorizontal: 30,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Quicksand_700Bold',
    color: '#2D1B69',
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  instruction: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
  },
  requirementsContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  requirementText: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: '#999',
    marginBottom: 8,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
  },
});

export default PasswordResetScreen;

