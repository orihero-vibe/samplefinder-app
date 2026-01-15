import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { requestNotificationPermissions } from '@/lib/notifications';

interface PushNotificationModalProps {
  visible: boolean;
  onClose: () => void;
  onEnable: () => void;
  onNotNow: () => void;
}

export const PushNotificationModal: React.FC<PushNotificationModalProps> = ({
  visible,
  onClose,
  onEnable,
  onNotNow,
}) => {
  const handleEnable = async () => {
    // Request notification permissions
    await requestNotificationPermissions();
    onEnable();
  };

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
            <Text style={styles.modalTitle}>Push Notifications</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#1E3A8A" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.modalText}>
              Enable push notifications to receive important updates, alerts for upcoming events, personalized recommendations and more!
            </Text>
          </View>
          <View style={styles.modalFooter}>
            <TouchableOpacity onPress={handleEnable} style={styles.enableButton}>
              <Text style={styles.enableButtonText}>Enable Notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onNotNow} style={styles.notNowButton}>
              <Text style={styles.notNowButtonText}>Not Now</Text>
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Quicksand_700Bold',
    color: '#1E3A8A',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalText: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: '#666',
    lineHeight: 24,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
  },
  enableButton: {
    marginBottom: 12,
  },
  enableButtonText: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: '#1E3A8A',
  },
  notNowButton: {
    marginTop: 4,
  },
  notNowButtonText: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: '#999',
  },
});
