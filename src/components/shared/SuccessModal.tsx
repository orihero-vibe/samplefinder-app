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

interface SuccessModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  title = 'Success',
  message,
  onClose,
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
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <ModalBackdrop containerStyle={styles.backdropContainer}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <View style={styles.closeButtonCircle}>
              <Monicon name="mdi:close" size={16} color={Colors.pinDarkBlue} />
            </View>
          </TouchableOpacity>

          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Monicon name="mdi:check" size={32} color={Colors.white} />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* OK Button */}
          <TouchableOpacity
            style={styles.okButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.okButtonText}>OK</Text>
          </TouchableOpacity>
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
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 340,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  closeButtonCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.success,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.grayText,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  okButton: {
    backgroundColor: Colors.blueColorMode,
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 25,
  },
  okButtonText: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.white,
  },
});

export default SuccessModal;
