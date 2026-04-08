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
import ModalBackdrop from '@/components/shared/ModalBackdrop';

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

  const openExternalLink = async (url: string, errorMessage: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Unable to Open Link', errorMessage, [{ text: 'OK' }]);
      }
    } catch (error: any) {
      console.error('Error opening external link:', error);
      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
    }
  };

  const handleApply = async () => {
    const url = 'https://app.popbookings.com/vip/polarisbrandpromotions';
    await openExternalLink(
      url,
      'Unable to open the application form. Please check your internet connection.'
    );
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <ModalBackdrop containerStyle={styles.backdropContainer}>
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
                To earn the Certified Brand Ambassador badge, you must be registered as a
                brand ambassador in the PopBookings talent database for Polaris Brand
                Promotions. If you aren't already registered, click here:{' '}
                <Text
                  style={styles.linkText}
                  onPress={() =>
                    openExternalLink(
                      'https://app.popbookings.com/vip/polarisbrandpromotions',
                      'Unable to open PopBookings. Please check your internet connection.'
                    )
                  }
                >
                  PopBookings
                </Text>
                .{' '}
                To request this badge, please send an email from the email address linked
                to your SampleFinder account along with a link to your PopBookings account
                to{' '}
                <Text
                  style={styles.linkText}
                  onPress={() =>
                    openExternalLink(
                      'mailto:brandambassador@samplefinder.com',
                      'Unable to open email app. Please try again later.'
                    )
                  }
                >
                  brandambassador@samplefinder.com
                </Text>
                .
              </Text>
            </View>

            {/* Certified Influencer */}
            <View>
              <Text style={styles.badgeTitle}>Certified Influencer:</Text>
              <Text style={styles.badgeDescription}>
                To earn the Certified Influencer badge, you must have a public social
                media account with over 5,000 users on one of the following platforms:
                Facebook, X or Instagram. To request this badge, please send an email
                from the email address linked to your SampleFinder account along with
                link(s) to your social media account(s) to{' '}
                <Text
                  style={styles.linkText}
                  onPress={() =>
                    openExternalLink(
                      'mailto:influencer@samplefinder.com',
                      'Unable to open email app. Please try again later.'
                    )
                  }
                >
                  influencer@samplefinder.com
                </Text>
                .
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
      </ModalBackdrop>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdropContainer: {
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
  linkText: {
    color: Colors.blueColorMode,
    textDecorationLine: 'underline',
    fontFamily: 'Quicksand_700Bold',
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
