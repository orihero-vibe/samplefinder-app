import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getSetting } from '@/lib/database/settings';
import { PRIVACY_POLICY } from '@/constants/LegalContent';

interface PrivacyModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  visible,
  onClose,
  onAccept,
}) => {
  const [content, setContent] = useState<string>(PRIVACY_POLICY);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPrivacyContent = async () => {
      if (visible) {
        setIsLoading(true);
        try {
          // Try to fetch from database first, fallback to static content
          const setting = await getSetting('privacy_policy');
          if (setting && setting.value) {
            setContent(setting.value);
          }
        } catch (error) {
          console.error('Error fetching privacy policy:', error);
          // Use static content as fallback (already set in initial state)
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchPrivacyContent();
  }, [visible]);

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
            <Text style={styles.termsModalTitle}>Privacy Policy</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2D1B69" />
              </View>
            ) : (
              <Text style={styles.termsModalText}>{content}</Text>
            )}
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity onPress={onAccept} style={styles.acceptButtonTerms}>
              <Text style={styles.acceptButtonTextTerms}>Accept</Text>
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
  termsModalTitle: {
    fontSize: 20,
    fontFamily: 'Quicksand_700Bold',
    color: '#2D1B69',
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
  termsModalText: {
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
  acceptButtonTerms: {
    alignSelf: 'flex-start',
  },
  acceptButtonTextTerms: {
    fontSize: 18,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#2D1B69',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

