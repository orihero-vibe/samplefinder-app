import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import CodeInput, { CodeInputRef } from '@/components/shared/CodeInput';

interface CheckInCodeInputProps {
  onCodeSubmit: (code: string) => void;
  showError?: boolean;
}

const CheckInCodeInput: React.FC<CheckInCodeInputProps> = ({
  onCodeSubmit,
  showError = false,
}) => {
  const [code, setCode] = useState('');
  const codeInputRef = useRef<CodeInputRef>(null);

  const handleCodeComplete = (completeCode: string) => {
    setCode(completeCode);
    // Auto-submit when code is complete
    if (completeCode.length === 6) {
      onCodeSubmit(completeCode);
    }
  };

  const handleReSubmit = () => {
    // Re-submit the current code if it's complete
    if (code.length === 6) {
      onCodeSubmit(code);
    } else {
      // If code is not complete, focus the input
      codeInputRef.current?.focus();
    }
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    // Auto-submit when code reaches 6 digits
    if (newCode.length === 6) {
      onCodeSubmit(newCode);
    }
  };

  return (
    <View style={styles.container}>
      <CodeInput
        ref={codeInputRef}
        length={6}
        value={code}
        onChangeText={handleCodeChange}
        onCodeComplete={handleCodeComplete}
      />
      {showError && (
        <Text style={styles.errorText}>Incorrect Code</Text>
      )}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleReSubmit}
        activeOpacity={0.7}
      >
        <Text style={styles.submitButtonText}>Re-Submit Code</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#FF0000',
    marginTop: 8,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.white,
  },
});

export default CheckInCodeInput;

