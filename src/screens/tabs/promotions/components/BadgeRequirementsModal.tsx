import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Linking,
  Dimensions,
  Alert,
} from 'react-native';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';
import CloseIcon from '@/components/shared/CloseIcon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BadgeRequirementsModalProps {
  visible: boolean;
  onClose: () => void;
}

const BadgeRequirementsModal: React.FC<BadgeRequirementsModalProps> = ({
  visible,
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

  const handleApply = async () => {
    const url = 'https://app.popbookings.com/vip/polarisbrandpromotions';
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        onClose();
      } else {
        Alert.alert(
          'Unable to Open Link',
          'Unable to open the application form. Please check your internet connection.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Error opening brand ambassador form:', error);
      Alert.alert(
        'Error',
        'Failed to open the application form. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
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
            <CloseIcon />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>BADGE REQUIREMENTS</Text>

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Certified Brand Ambassador */}
            <View style={styles.badgeSection}>
              <Text style={styles.badgeTitle}>Certified Brand Ambassador:</Text>
              <Text style={styles.badgeDescription}>
                Ipsum dolor sit amet, consectetur adipiscing elit. Fusce ac ligula massa. 
                Donec sed eleifend ligula, id venenatis enim. Duis hendrerit odio mattis 
                velit. Ut aliquet vehicula mauris, mattis imperdiet libero. vitae mi 
                elementum accumsan.
              </Text>
            </View>

            {/* Certified Influencer */}
            <View>
              <Text style={styles.badgeTitle}>Certified Influencer:</Text>
              <Text style={styles.badgeDescription}>
                Vivamus semper porttitor nibh, ut aliquet erat finibus non. Phasellus eu 
                venenatis enim. Duis hendrerit odio vitae mi elementum accumsan. mattis 
                imperdiet libero. vitae mi elementum accumsan. Etiam mattis ornare orci 
                vitae molestie. Proin tincidunt ut mi vestibulum ultrices. For more info 
                email Badges@Samplefinder.Com.
              </Text>
            </View>
          </ScrollView>

          {/* Apply Button */}
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApply}
            activeOpacity={0.8}
          >
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: SCREEN_WIDTH - 40,
    maxWidth: 500,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
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
    borderRadius: 12,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.pinDarkBlue,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: Colors.pinDarkBlue,
    textAlign: 'left',
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 24,
  },
  scrollView: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  badgeSection: {
    marginBottom: 20,
  },
  badgeTitle: {
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    color: '#666666',
    marginBottom: 8,
  },
  badgeDescription: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: '#666666',
    lineHeight: 24,
  },
  applyButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom:10
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.blueColorMode,

  },
});

export default BadgeRequirementsModal;
