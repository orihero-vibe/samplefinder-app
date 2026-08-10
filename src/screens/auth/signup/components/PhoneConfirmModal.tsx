import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';
import ModalBackdrop from '@/components/shared/ModalBackdrop';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface PhoneConfirmModalProps {
  visible: boolean;
  phoneNumber: string;
  onConfirm: () => void;
  onEdit: () => void;
}

/** Display the number in full — checking it is the entire point of this step. */
const formatUsPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  const local = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  if (local.length !== 10) return phone;
  return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
};

/**
 * Last check on the destination number before the account is created.
 *
 * A typo here is expensive: the code goes to a stranger's phone, and because
 * Appwrite enforces unique account phones, the mistyped number is then held by
 * a dead unverified account and its real owner can never sign up. Unsolicited
 * codes also generate the carrier complaints that drive A2P filtering.
 */
export const PhoneConfirmModal: React.FC<PhoneConfirmModalProps> = ({
  visible,
  phoneNumber,
  onConfirm,
  onEdit,
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

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onEdit}>
      <ModalBackdrop containerStyle={styles.backdropContainer}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onEdit} />
        <Animated.View
          style={[
            styles.modalContainer,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onEdit}>
            <View style={styles.closeButtonCircle}>
              <Monicon name="mdi:close" size={16} color={Colors.pinDarkBlue} />
            </View>
          </TouchableOpacity>

          <View style={styles.content}>
            <Text style={styles.title}>Is this your number?</Text>
            <Text style={styles.description}>We'll text your verification code to:</Text>

            <Text style={styles.phoneNumber}>{formatUsPhone(phoneNumber)}</Text>

            <Text style={styles.hint}>
              Check it carefully — you'll need this code to finish signing up.
            </Text>

            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={onConfirm} activeOpacity={0.7}>
                <Text style={styles.confirmText}>Yes, send the code</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={onEdit} activeOpacity={0.7}>
                <Text style={styles.cancelText}>Edit number</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
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
    lineHeight: 21,
    textAlign: 'center',
  },
  phoneNumber: {
    fontSize: 24,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
    textAlign: 'center',
    marginVertical: 14,
    letterSpacing: 0.5,
  },
  hint: {
    fontSize: 13,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.grayText,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 12,
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
  cancelText: {
    fontSize: 16,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.grayText,
  },
});
