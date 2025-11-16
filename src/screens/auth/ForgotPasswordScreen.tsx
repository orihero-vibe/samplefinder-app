import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ScreenWrapper from '@/components/wrappers/ScreenWrapper';
import CustomInput from '@/components/shared/CustomInput';
import CustomButton from '@/components/shared/CustomButton';

const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    // TODO: Implement password reset logic
    console.log('Submit pressed', { email });
    // Navigate to password reset code verification screen
    navigation.navigate('PasswordReset', { phoneNumber: '(***) **** 1234' });
  };

  return (
    <ScreenWrapper contentBackgroundColor="#fff">
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.title}>FORGOT PASSWORD?</Text>
        <Text style={styles.instructions}>
          Enter your email below to reset your password.
        </Text>

        <View style={styles.formContainer}>
          <CustomInput
            label="Email Address:"
            value={email}
            onChangeText={setEmail}
            placeholder="name@gmail.com"
            keyboardType="email-address"
            labelColor="#333"
            inputBorderColor="#2D1B69"
          />

          <View style={styles.buttonContainer}>
            <CustomButton
              title="Submit"
              onPress={handleSubmit}
              variant="dark"
            />
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Quicksand_700Bold',
    color: '#2D1B69',
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  instructions: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  formContainer: {
    width: '100%',
  },
  buttonContainer: {
    marginTop: 8,
  },
});

export default ForgotPasswordScreen;

