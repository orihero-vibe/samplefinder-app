import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import CustomInput from './CustomInput';
import CustomButton from './CustomButton';
import { Colors } from '@/constants/Colors';

interface ZipCodeModalProps {
  visible: boolean;
  onZipCodeSubmit: (zipCode: string) => void;
  onZipCodeChange?: (zipCode: string) => void;
  isLoading?: boolean;
  error?: string;
}

const ZipCodeModal: React.FC<ZipCodeModalProps> = ({
  visible,
  onZipCodeSubmit,
  onZipCodeChange,
  isLoading = false,
  error,
}) => {
  const [zipCode, setZipCode] = useState('');

  const handleZipCodeChange = (text: string) => {
    setZipCode(text);
    // Notify parent to clear error when user starts typing
    if (onZipCodeChange) {
      onZipCodeChange(text);
    }
  };

  const handleSubmit = () => {
    const trimmedZip = zipCode.trim();
    if (trimmedZip.length >= 5) {
      onZipCodeSubmit(trimmedZip);
    }
  };

  const isValidZip = zipCode.trim().length >= 5;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            bounces={false}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalContent}>
              <Text style={styles.title}>Enter Your ZIP Code</Text>
              <Text style={styles.description}>
                Location access was denied. Please enter your ZIP code to find nearby events.
              </Text>

              <CustomInput
                label="ZIP Code"
                value={zipCode}
                onChangeText={handleZipCodeChange}
                placeholder="12345"
                type="numeric"
                keyboardType="number-pad"
                maxLength={10}
                labelColor={Colors.white}
                error={!!error}
                errorMessage={error}
                containerStyle={styles.inputContainer}
              />

              <View style={styles.buttonContainer}>
                <CustomButton
                  title="Continue"
                  onPress={handleSubmit}
                  variant="primary"
                  size="medium"
                  loading={isLoading}
                  disabled={!isValidZip || isLoading}
                  fullWidth
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalContent: {
    backgroundColor: Colors.brandPurpleDeep,
    borderRadius: 24,
    padding: 24,
    alignSelf: 'stretch',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.white,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 8,
  },
});

export default ZipCodeModal;
