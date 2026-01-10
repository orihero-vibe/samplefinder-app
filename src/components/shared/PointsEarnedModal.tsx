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
import { MediumStarIcon, PointsBadgeIcon, SmallStarIcon, SparklesIcon } from '@/icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BADGE_COLOR = '#8B1538';

interface PointsEarnedModalProps {
  visible: boolean;
  points: number;
  title: string;
  onClose: () => void;
  onViewRewards?: () => void;
}

const PointsEarnedModal: React.FC<PointsEarnedModalProps> = ({
  visible,
  points,
  title,
  onClose,
  onViewRewards,
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
      <View style={styles.overlay}>
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

          {/* Decorative sparkles */}
          <View style={styles.sparkleTopLeft}>
            <MediumStarIcon size={36} />
          </View>
          <View style={styles.sparkleTopRight}>
            <SmallStarIcon size={24} />
          </View>

          {/* Points Badge */}
          <View style={styles.badgeContainer}>
            <PointsBadgeIcon size={180} points={points} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* View Rewards Progress */}
          {onViewRewards && (
            <TouchableOpacity
              style={styles.rewardsLink}
              onPress={onViewRewards}
              activeOpacity={0.7}
            >
              <SparklesIcon size={16} color={Colors.blueColorMode} />
              <Text style={styles.rewardsLinkText}>View Rewards Progress</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(75, 31, 86, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 340,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 30,
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
  sparkleTopLeft: {
    position: 'absolute',
    top: 40,
    left: 30,
  },
  sparkleTopRight: {
    position: 'absolute',
    top: 70,
    right: 40,
  },
  sparkleTopRightLarge: {
    position: 'absolute',
    top: 55,
    right: 25,
  },
  sparkleBottomRight: {
    position: 'absolute',
    bottom: 140,
    right: 30,
  },
  badgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.pinDarkBlue,
    marginBottom: 16,
    textAlign: 'center',
  },
  rewardsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rewardsLinkText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.blueColorMode,
  },
});

export default PointsEarnedModal;
