import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';
import CodeInput, { CodeInputRef } from '@/components/shared/CodeInput';

interface CheckInCodeInputProps {
  onCodeSubmit: (code: string) => void;
  showError?: boolean;
  isSubmitting?: boolean;
}

const CheckInCodeInput: React.FC<CheckInCodeInputProps> = ({
  onCodeSubmit,
  showError = false,
  isSubmitting = false,
}) => {
  const [code, setCode] = useState('');
  const codeInputRef = useRef<CodeInputRef>(null);

  const handleCodeComplete = (completeCode: string) => {
    setCode(completeCode);
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    
    if (code.length === 6) {
      onCodeSubmit(code);
    } else {
      codeInputRef.current?.focus();
    }
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const buttonText = showError ? 'Re-Submit Code' : 'Submit';

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
        style={[
          styles.submitButton,
          showError && styles.submitButtonError,
          isSubmitting && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        activeOpacity={0.7}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <Text style={styles.submitButtonText}>{buttonText}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#FF0000',
    marginTop: 4,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: Colors.blueColorMode,
    paddingVertical: 16,
    borderRadius: 25,
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonError: {
    backgroundColor: '#FF0000',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.white,
  },
});

export default CheckInCodeInput;

