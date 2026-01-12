import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface CodeInputProps {
  length?: number;
  onCodeComplete?: (code: string) => void;
  value?: string;
  onChangeText?: (code: string) => void;
}

export interface CodeInputRef {
  focus: () => void;
}

const CodeInput = forwardRef<CodeInputRef, CodeInputProps>(({
  length = 6,
  onCodeComplete,
  value: controlledValue,
  onChangeText,
}, ref) => {
  const [code, setCode] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const isControlled = controlledValue !== undefined;

  useEffect(() => {
    if (isControlled && controlledValue !== undefined) {
      const codeArray = controlledValue.split('').slice(0, length);
      const newCode = [...codeArray, ...Array(length - codeArray.length).fill('')];
      setCode(newCode);
    }
  }, [controlledValue, length, isControlled]);

  const handleChange = (text: string, index: number) => {
    // Only allow numeric input
    const numericText = text.replace(/[^0-9]/g, '');

    if (numericText.length > 1) {
      // Handle paste
      const pastedCode = numericText.slice(0, length);
      const newCode = [...code];
      pastedCode.split('').forEach((char, i) => {
        if (index + i < length) {
          newCode[index + i] = char;
        }
      });
      setCode(newCode);

      const codeString = newCode.join('');
      onChangeText?.(codeString);

      // Focus the next empty input or the last one
      const nextIndex = Math.min(index + pastedCode.length, length - 1);
      inputRefs.current[nextIndex]?.focus();

      if (codeString.length === length) {
        onCodeComplete?.(codeString);
      }
      return;
    }

    const newCode = [...code];
    newCode[index] = numericText;
    setCode(newCode);

    const codeString = newCode.join('');
    onChangeText?.(codeString);

    // Move to next input if there's a value
    if (numericText && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if code is complete
    if (codeString.length === length && codeString.split('').every(digit => digit !== '')) {
      onCodeComplete?.(codeString);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRefs.current[0]?.focus();
    },
  }));

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <TouchableOpacity
          key={index}
          activeOpacity={1}
          onPress={() => handleFocus(index)}
          style={styles.inputWrapper}
        >
          <View style={[styles.circle, code[index] && styles.circleFilled]}>
            <TextInput
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={styles.input}
              value={code[index] || ''}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginVertical: 16,
  },
  inputWrapper: {
    alignItems: 'center',
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleFilled: {
    backgroundColor: '#B8B8B8',
  },
  input: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#2D1B69',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
});

export default CodeInput;

