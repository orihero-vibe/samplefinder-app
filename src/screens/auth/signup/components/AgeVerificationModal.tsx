import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface AgeVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({
  visible,
  onClose,
  onAccept,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.ageModalTitle}>Age Verification</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.ageModalText}>
              Any advertisements or promotions for gambling, alcohol, tobacco,
              cannabis or any other controlled substances are limited to app
              users 21 years of age or older.
            </Text>
          </View>
          <View style={styles.modalFooter}>
            <TouchableOpacity onPress={onAccept} style={styles.acceptButton}>
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  ageModalTitle: {
    fontSize: 20,
    fontFamily: 'Quicksand_700Bold',
    color: '#1E3A8A',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    maxHeight: 400,
  },
  ageModalText: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: '#666',
    lineHeight: 24,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  acceptButton: {
    alignSelf: 'flex-start',
  },
  acceptButtonText: {
    fontSize: 18,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#1E3A8A',
  },
});

