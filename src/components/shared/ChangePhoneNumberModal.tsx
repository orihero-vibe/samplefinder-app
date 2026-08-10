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

export interface ChangePhoneNumberModalProps {
  visible: boolean;
  phoneNumber: string;
  password: string;
  onChangePhoneNumber: (text: string) => void;
  onChangePassword: (text: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  errorMessage?: string;
  isLoading?: boolean;
}

/**
 * Corrects a mistyped phone number from the verification screen.
 *
 * Without this the screen is a dead end: the code goes to the wrong number,
 * Resend just sends it there again, and the routing gate returns the user here
 * on every launch. The password is required because Appwrite's
 * account.updatePhone takes it.
 */
const ChangePhoneNumberModal: React.FC<ChangePhoneNumberModalProps> = ({
  visible,
  phoneNumber,
  password,
  onChangePhoneNumber,
  onChangePassword,
  onSubmit,
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

  const canSubmit = phoneNumber.replace(/\D/g, '').length >= 10 && !!password;

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
              <Text style={styles.title}>Change Phone Number</Text>
              <Text style={styles.description}>
                Enter the correct number and your password. We'll text a new code straight away.
              </Text>

              <View style={styles.inputWrapper}>
                <CustomInput
                  label="Phone Number"
                  value={phoneNumber}
                  onChangeText={onChangePhoneNumber}
                  type="phone"
                  placeholder="( )"
                  autoFormat
                  labelColor={Colors.blueColorMode}
                  inputBorderColor={Colors.blueColorMode}
                  autoFocus
                  editable={!isLoading}
                />

                <CustomInput
                  label="Password"
                  value={password}
                  onChangeText={onChangePassword}
                  type="password"
                  placeholder="Enter your password"
                  labelColor={Colors.blueColorMode}
                  inputBorderColor={Colors.blueColorMode}
                  showPasswordToggle={true}
                  returnKeyType="done"
                  onSubmitEditing={isLoading || !canSubmit ? undefined : onSubmit}
                  editable={!isLoading}
                  error={!!errorMessage}
                  errorMessage={errorMessage}
                />
              </View>

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.pinDarkBlue} />
                  <Text style={styles.loadingText}>Updating your number...</Text>
                </View>
              ) : (
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onSubmit}
                    activeOpacity={0.7}
                    disabled={!canSubmit}
                  >
                    <Text style={[styles.confirmText, !canSubmit && styles.confirmTextDisabled]}>
                      Update &amp; Send Code
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

export default ChangePhoneNumberModal;
