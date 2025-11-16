import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import ScreenWrapper from '@/components/wrappers/ScreenWrapper';
import CustomButton from '@/components/shared/CustomButton';
import CodeInput, { CodeInputRef } from '@/components/shared/CodeInput';

type Props = NativeStackScreenProps<RootStackParamList, 'ConfirmAccount'>;

const ConfirmAccountScreen = ({ navigation, route }: Props) => {
  const [code, setCode] = useState('');
  const [phoneNumber] = useState(route?.params?.phoneNumber || '(***) *** 1234');
  const codeInputRef = useRef<CodeInputRef>(null);

  useEffect(() => {
    // Focus the code input when the screen mounts
    const timer = setTimeout(() => {
      codeInputRef.current?.focus();
    }, 100); // Small delay to ensure the component is fully rendered

    return () => clearTimeout(timer);
  }, []);

  const handleVerify = () => {
    if (code.length === 6) {
      // TODO: Implement verification logic
      console.log('Verify pressed with code:', code);
      // Navigate to MainTabs (which shows Home by default) after successful verification
      navigation.replace('MainTabs');
    }
  };

  const handleResendCode = () => {
    // TODO: Implement resend code logic
    console.log('Resend code pressed');
    setCode('');
  };

  return (
    <ScreenWrapper 
      contentBackgroundColor="#fff"
      contentContainerStyle={styles.wrapperContent}
    >
      <StatusBar style="light" />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>CONFIRM ACCOUNT</Text>
        
        <Text style={styles.instruction}>
          We've sent your code to {phoneNumber}.
        </Text>
        <Text style={styles.instruction}>
          Enter your code below:
        </Text>

        <CodeInput
          ref={codeInputRef}
          length={6}
          value={code}
          onChangeText={setCode}
          onCodeComplete={(completedCode) => {
            console.log('Code completed:', completedCode);
          }}
        />

        <View style={styles.buttonContainer}>
          <CustomButton
            title="Verify"
            onPress={handleVerify}
            variant="dark"
            disabled={code.length !== 6}
          />
        </View>

        <TouchableOpacity onPress={handleResendCode} style={styles.resendContainer}>
          <Text style={styles.resendText}>Resend code</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Quicksand_700Bold',
    color: '#2D1B69',
    textAlign: 'center',
    marginBottom: 24,
    textTransform: 'uppercase',
  },
  instruction: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
    marginBottom: 16,
  },
  resendContainer: {
    marginTop: 8,
  },
  resendText: {
    fontSize: 16,
    fontFamily: 'Quicksand_500Medium',
    color: '#999',
    textAlign: 'center',
  },
});

export default ConfirmAccountScreen;

