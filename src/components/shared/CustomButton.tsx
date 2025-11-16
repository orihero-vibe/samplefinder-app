import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'dark' | 'outline' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = true,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.baseButton];
    
    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryButton);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryButton);
        break;
      case 'dark':
        baseStyle.push(styles.darkButton);
        break;
      case 'outline':
        baseStyle.push(styles.outlineButton);
        break;
      case 'text':
        baseStyle.push(styles.textButton);
        break;
    }
    
    // Size styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallButton);
        break;
      case 'medium':
        baseStyle.push(styles.mediumButton);
        break;
      case 'large':
        baseStyle.push(styles.largeButton);
        break;
    }
    
    // Width
    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }
    
    // Disabled styles
    if (disabled || loading) {
      baseStyle.push(styles.disabled);
      if (variant === 'dark') {
        baseStyle.push(styles.disabledDark);
      }
    }
    
    return baseStyle;
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyle: TextStyle[] = [];
    
    // Variant text styles
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryText);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryText);
        break;
      case 'dark':
        baseStyle.push(styles.darkText);
        break;
      case 'outline':
        baseStyle.push(styles.outlineText);
        break;
      case 'text':
        baseStyle.push(styles.textButtonText);
        break;
    }
    
    // Size text styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallText);
        break;
      case 'medium':
        baseStyle.push(styles.mediumText);
        break;
      case 'large':
        baseStyle.push(styles.largeText);
        break;
    }
    
    // Disabled text styles
    if (disabled || loading) {
      if (variant === 'dark') {
        baseStyle.push(styles.disabledDarkText);
      } else if (variant === 'text') {
        baseStyle.push(styles.disabledTextButtonText);
      }
    }
    
    return baseStyle;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator 
          color={variant === 'primary' ? '#2D1B69' : '#fff'} 
        />
      );
    }

    const textElement = (
      <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
    );

    if (icon) {
      return (
        <View style={styles.iconContainer}>
          {iconPosition === 'left' && icon}
          {textElement}
          {iconPosition === 'right' && icon}
        </View>
      );
    }

    return textElement;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  // Variants
  primaryButton: {
    backgroundColor: '#fff',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#fff',
  },
  darkButton: {
    backgroundColor: '#2D1B69',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2D1B69',
  },
  textButton: {
    backgroundColor: 'transparent',
  },
  // Sizes
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  mediumButton: {
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  largeButton: {
    paddingVertical: 18,
    paddingHorizontal: 50,
  },
  // Width
  fullWidth: {
    width: '100%',
  },
  // Text styles
  primaryText: {
    color: '#2D1B69',
    fontFamily: 'Quicksand_700Bold',
  },
  secondaryText: {
    color: '#fff',
    fontFamily: 'Quicksand_700Bold',
  },
  darkText: {
    color: '#fff',
    fontFamily: 'Quicksand_700Bold',
  },
  outlineText: {
    color: '#2D1B69',
    fontFamily: 'Quicksand_700Bold',
  },
  textButtonText: {
    color: '#2D1B69',
    fontFamily: 'Quicksand_600SemiBold',
  },
  // Size text styles
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 18,
  },
  largeText: {
    fontSize: 20,
  },
  // Disabled styles
  disabled: {
    opacity: 0.6,
  },
  disabledDark: {
    backgroundColor: '#E0E0E0',
    opacity: 1,
  },
  disabledDarkText: {
    color: '#999',
  },
  disabledTextButtonText: {
    color: '#999',
  },
  // Icon container
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});

export default CustomButton;
