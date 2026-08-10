import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';
import CustomInput from '@/components/shared/CustomInput';
import ModalBackdrop from '@/components/shared/ModalBackdrop';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface PasswordPromptModalProps {
  visible: boolean;
  /** Why the password is being asked for; shown under the title. */
  description: string;
  value: string;
  onChangeValue: (text: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  errorMessage?: string;
  isLoading?: boolean;
}

/**
 * Asks for the account password on its own, for a single stated reason.
 *
 * Changing the phone number needs the password because Appwrite's
 * account.updatePhone requires it — but borrowing the "Current Password" field
 * from the Change Password section made it read as though a new password were
 * also required. This keeps the two intents separate.
 */
export const PasswordPromptModal: React.FC<PasswordPromptModalProps> = ({
  visible,
  description,
  value,
  onChangeValue,
  onConfirm,
  onCancel,
  errorMessage,
  isLoading = false,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  const handleClose = () => {
    if (isLoading) return;
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <ModalBackdrop containerStyle={styles.backdropContainer}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
          disabled={isLoading}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoider}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              styles.modalContainer,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            {!isLoading && (
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <View style={styles.closeButtonCircle}>
                  <Monicon name="mdi:close" size={16} color={Colors.pinDarkBlue} />
                </View>
              </TouchableOpacity>
            )}

            <View style={styles.content}>
              <Text style={styles.title}>Confirm Your Password</Text>
              <Text style={styles.description}>{description}</Text>

              <View style={styles.inputWrapper}>
                <CustomInput
                  label="Password"
                  value={value}
                  onChangeText={onChangeValue}
                  type="password"
                  placeholder="Enter your password"
                  labelColor={Colors.blueColorMode}
                  inputBorderColor={Colors.blueColorMode}
                  showPasswordToggle={true}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={isLoading ? undefined : onConfirm}
                  editable={!isLoading}
                  error={!!errorMessage}
                  errorMessage={errorMessage}
                />
              </View>

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.pinDarkBlue} />
                  <Text style={styles.loadingText}>Saving...</Text>
                </View>
              ) : (
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onConfirm}
                    activeOpacity={0.7}
                    disabled={!value}
                  >
                    <Text style={[styles.confirmText, !value && styles.confirmTextDisabled]}>
                      Confirm &amp; Save
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onCancel}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </ModalBackdrop>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdropContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  keyboardAvoider: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.88,
    maxWidth: 380,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 32,
    paddingTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  closeButtonCircle: {
    width: 24,
    height: 24,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.pinDarkBlue,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins_500Medium',
    color: Colors.blueColorMode,
    marginBottom: 12,
    lineHeight: 30,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.grayText,
    marginBottom: 8,
    lineHeight: 21,
    textAlign: 'center',
  },
  inputWrapper: {
    width: '100%',
  },
  actionsContainer: {
    width: '100%',
  },
  actionButton: {
    paddingVertical: 8,
    alignItems: 'flex-start',
  },
  confirmText: {
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
  },
  confirmTextDisabled: {
    color: '#B0B0B0',
  },
  cancelText: {
    fontSize: 16,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.grayText,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.grayText,
  },
});
