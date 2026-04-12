import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { formatPhoneNumber, formatDate } from '@/utils/formatters';
import { QuestionIcon, OutlinedQuestionIcon } from '@/icons';
import { Colors } from '@/constants';

export type InputType = 
  | 'text'
  | 'email'
  | 'password'
  | 'phone'
  | 'date'
  | 'numeric';

interface CustomInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  type?: InputType;
  labelColor?: string;
  inputBorderColor?: string;
  inputBorderWidth?: number;
  error?: boolean;
  errorMessage?: string;
  showPasswordToggle?: boolean;
  helpIcon?: boolean;
  /** Use filled-circle DOB-style asset instead of stroke-only QuestionIcon */
  helpIconVariant?: 'default' | 'outlined';
  onHelpPress?: () => void;
  containerStyle?: object;
  autoFormat?: boolean; // Enable automatic formatting for phone/date
  inputTextColor?: string;
  placeholderTextColor?: string;
  /** Full rounded border vs bottom border only (e.g. password reset) */
  inputStyleVariant?: 'boxed' | 'underline';
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  type = 'text',
  labelColor = '#000',
  inputTextColor = Colors.brandBlueBright,
  inputBorderColor,
  inputBorderWidth,
  error = false,
  errorMessage,
  showPasswordToggle,
  helpIcon = false,
  helpIconVariant = 'default',
  onHelpPress,
  containerStyle,
  autoFormat = true,
  placeholderTextColor: placeholderTextColorProp,
  inputStyleVariant = 'boxed',
  keyboardType,
  secureTextEntry,
  ...textInputProps
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  // Determine if this is a password input
  const isPassword = type === 'password' || secureTextEntry;
  const shouldShowPasswordToggle = isPassword && (showPasswordToggle !== false);
  
  // Determine keyboard type based on input type
  const getKeyboardType = (): TextInputProps['keyboardType'] => {
    if (keyboardType) return keyboardType;
    switch (type) {
      case 'email':
        return 'email-address';
      case 'phone':
        return 'phone-pad';
      case 'numeric':
      case 'date':
        return 'numeric';
      default:
        return 'default';
    }
  };

  // Handle text change with formatting
  const handleTextChange = (text: string) => {
    if (autoFormat) {
      if (type === 'phone') {
        const formatted = formatPhoneNumber(text);
        onChangeText(formatted);
      } else if (type === 'date') {
        const formatted = formatDate(text);
        onChangeText(formatted);
      } else {
        onChangeText(text);
      }
    } else {
      onChangeText(text);
    }
  };

  // Get placeholder based on type
  const getPlaceholder = (): string => {
    if (placeholder !== undefined) return placeholder;
    switch (type) {
      case 'email':
        return 'name@gmail.com';
      case 'phone':
        return '( )';
      case 'date':
        return 'MM/DD/YYYY';
      case 'password':
        return '********';
      default:
        return 'Text';
    }
  };

  // Determine border color
  const getBorderColor = (): string => {
    if (error) return '#F51616';
    if (inputBorderColor) return inputBorderColor;
    return '#2D1B69';
  };

  const fieldAccentColor = error ? '#F51616' : getBorderColor();
  const placeholderColor = placeholderTextColorProp ?? '#999';
  const resolvedInputTextColor = error ? '#F51616' : inputTextColor;
  const isUnderline = inputStyleVariant === 'underline';
  const bottomBorderWidth = inputBorderWidth ?? (isUnderline ? 1 : undefined);

  // Determine if password should be visible
  const shouldShowPassword = isPassword && !isPasswordVisible;

  const inputDynamicStyle = isUnderline
    ? {
        borderWidth: 0,
        borderBottomWidth: bottomBorderWidth ?? 1,
        borderBottomColor: getBorderColor(),
        borderRadius: 0,
        backgroundColor: 'transparent',
        color: resolvedInputTextColor,
      }
    : {
        borderColor: getBorderColor(),
        ...(inputBorderWidth != null ? { borderWidth: inputBorderWidth } : {}),
        color: resolvedInputTextColor,
      };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: error ? '#F51616' : labelColor }]}>
            {label}
          </Text>
          {helpIcon && (
            <TouchableOpacity 
              style={styles.helpIcon} 
              onPress={onHelpPress}
              activeOpacity={0.7}
            >
              {helpIconVariant === 'outlined' ? (
                <OutlinedQuestionIcon size={20} circleFill={fieldAccentColor} />
              ) : (
                <QuestionIcon size={20} color={fieldAccentColor} />
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              isUnderline && styles.inputUnderline,
              inputDynamicStyle,
              !isUnderline && error && styles.inputError,
              shouldShowPasswordToggle && styles.inputWithIcon,
            ]}
            value={value}
            onChangeText={handleTextChange}
            placeholder={getPlaceholder()}
            placeholderTextColor={placeholderColor}
            secureTextEntry={shouldShowPassword}
            keyboardType={getKeyboardType()}
            autoCapitalize={type === 'email' || type === 'password' ? 'none' : 'sentences'}
            autoCorrect={type === 'email' || type === 'password' ? false : true}
            {...textInputProps}
          />
          {shouldShowPasswordToggle && (
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              style={styles.eyeIcon}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={isPasswordVisible ? 'visibility-off' : 'visibility'}
                size={24}
                color={error ? fieldAccentColor : inputBorderColor ?? '#666'}
              />
            </TouchableOpacity>
          )}
        </View>
        {error && errorMessage && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}
      </View>
    </View>
  );
};

const { height: screenHeight } = Dimensions.get('window');
const isSmallDevice = screenHeight < 700;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: isSmallDevice ? 12 : 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 6 : 8,
  },
  label: {
    fontSize: isSmallDevice ? 14 : 16,
    fontFamily: 'Quicksand_700Bold',
  },
  helpIcon: {
    marginLeft: 8,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    width: '100%',
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: isSmallDevice ? 12 : 14,
    paddingHorizontal: 20,
    fontSize: isSmallDevice ? 14 : 16,
    color: '#333',
    fontFamily: 'Quicksand_700Bold',
    borderWidth: 1,
    borderColor: '#1D0A74',
  },
  inputUnderline: {
    borderRadius: 0,
    paddingHorizontal: 4,
    paddingVertical: isSmallDevice ? 10 : 12,
  },
  inputWithIcon: {
    paddingRight: 55,
  },
  inputError: {
    borderColor: '#F51616',
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    minWidth: 40,
  },
  errorText: {
    color: '#F51616',
    fontSize: 12,
    fontFamily: 'Quicksand_700Bold',
    marginTop: 4,
    paddingHorizontal: 4,
  },
});

export default CustomInput;
