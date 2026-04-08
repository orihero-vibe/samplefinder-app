import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import CustomInput from './CustomInput';
import CustomButton from './CustomButton';
import { Colors } from '@/constants/Colors';
import ModalBackdrop from '@/components/shared/ModalBackdrop';

interface ZipCodeModalProps {
  visible: boolean;
  onZipCodeSubmit: (zipCode: string) => void;
  onZipCodeChange?: (zipCode: string) => void;
  onDismiss?: () => void;
  isLoading?: boolean;
  error?: string;
}

const ZipCodeModal: React.FC<ZipCodeModalProps> = ({
  visible,
  onZipCodeSubmit,
  onZipCodeChange,
  onDismiss,
  isLoading = false,
  error,
}) => {
  const [zipCode, setZipCode] = useState('');

  const handleZipCodeChange = (text: string) => {
    setZipCode(text);
    if (onZipCodeChange) {
      onZipCodeChange(text);
    }
  };

  const handleSubmit = () => {
    const trimmed = zipCode.trim();
    if (trimmed.length >= 2) {
      onZipCodeSubmit(trimmed);
    }
  };

  const handleDismiss = () => {
    if (isLoading) return;
    onDismiss?.();
  };

  const canSubmit = zipCode.trim().length >= 2;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss ?? (() => {})}
      statusBarTranslucent
    >
      <ModalBackdrop containerStyle={styles.backdropContainer}>
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
              <Text style={styles.title}>Enter your location</Text>
              <Text style={styles.description}>
                Location access was denied. Enter your city, address, or ZIP code to find nearby events.
              </Text>

              <CustomInput
                label="City, address, or ZIP code"
                value={zipCode}
                onChangeText={handleZipCodeChange}
                placeholder="e.g. Austin, TX or 78701"
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
                  disabled={!canSubmit || isLoading}
                  fullWidth
                />
                {onDismiss && (
                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleDismiss}
                    disabled={isLoading}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.skipButtonText}>Use map without location</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ModalBackdrop>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdropContainer: {
    flex: 1,
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
    marginTop: 40,
  },
  skipButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.white,
    textDecorationLine: 'underline',
  },
});

export default ZipCodeModal;
