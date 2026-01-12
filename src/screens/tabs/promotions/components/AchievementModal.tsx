import React, { useState, useEffect } from 'react';
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
import { SparkleIcon } from '@/icons';
import CustomButton from '@/components/shared/CustomButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AchievementModalProps {
  visible: boolean;
  tierName?: string;
  points?: number;
  message?: string;
  onClose: () => void;
  onShare?: () => void;
}

const AchievementModal: React.FC<AchievementModalProps> = ({
  visible,
  tierName = 'NewbieSampler',
  points = 100,
  message,
  onClose,
  onShare,
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

  const handleShare = async () => {
    try {
      if (onShare) {
        await onShare();
      }
      // Close modal after sharing
      onClose();
    } catch (error) {
      console.error('Error in handleShare:', error);
      // Still close modal even if share fails
      onClose();
    }
  };

  const defaultMessage = message || `You earned ${points} points with SampleFinder, just for signing up!`;

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
            <View style={styles.closeButtonCircle}>
              <Monicon name="mdi:close" size={20} color={Colors.pinDarkBlue} />
            </View>
          </TouchableOpacity>

          {/* Badge Icon */}
          <View style={styles.badgeContainer}>
            <View style={styles.badgeIcon}>
              <Monicon name="ph:seal-fill" size={120} color={Colors.pinDarkBlue} />
              <View style={styles.checkmarkContainer}>
                <Monicon name="mdi:check" size={60} color={Colors.white} />
              </View>
            </View>
          </View>

          {/* Tier Name */}
          <Text style={styles.tierName}>{tierName}</Text>

          {/* Thanks Message */}
          <Text style={styles.thanksMessage}>Thanks for Joining!</Text>

          {/* Points Message */}
          <Text style={styles.pointsMessage}>{defaultMessage}</Text>

          {/* You Earned Points Badge */}
          <View style={styles.earnedPointsContainer}>
            <SparkleIcon size={16} color={Colors.pinDarkBlue} circleColor="transparent" />
            <Text style={styles.earnedPointsText}>You earned points!</Text>
          </View>

          {/* Share Button */}
          <CustomButton
            title="Share"
            onPress={handleShare}
            variant="dark"
            size="medium"
            style={styles.shareButton}
          />
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
    borderRadius: 24,
    padding: 24,
    width: SCREEN_WIDTH - 40,
    maxWidth: 400,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  closeButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContainer: {
    marginTop: 8,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: {
    position: 'relative',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 30,
    left: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  tierName: {
    fontSize: 20,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.pinDarkBlue,
    marginBottom: 12,
    textAlign: 'center',
  },
  thanksMessage: {
    fontSize: 28,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.pinDarkBlue,
    marginBottom: 16,
    textAlign: 'center',
  },
  pointsMessage: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.black,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  earnedPointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  earnedPointsText: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.pinDarkBlue,
  },
  shareButton: {
    width: '100%',
    marginTop: 8,
  },
});

export default AchievementModal;

