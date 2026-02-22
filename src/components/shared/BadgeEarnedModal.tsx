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
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { SmallBlueStarIcon } from '@/icons';
import BadgeEarnedPopupIcon from '@/icons/BadgeEarnedPopupIcon';
import { CloseIcon } from '@/components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type BadgeType = 'events' | 'reviews';

interface BadgeEarnedModalProps {
  visible: boolean;
  badgeType: BadgeType;
  badgeNumber: number;
  achievementCount: number;
  onClose: () => void;
  onShare?: () => void;
}

const BadgeEarnedModal: React.FC<BadgeEarnedModalProps> = ({
  visible,
  badgeType,
  badgeNumber,
  achievementCount,
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
      onClose();
    } catch (error) {
      console.error('Error in handleShare:', error);
      onClose();
    }
  };

  const getBadgeName = (): string => {
    return badgeType === 'events' ? 'Events Badge' : 'Review Badge';
  };

  const getAchievementMessage = (): string => {
    const activity = badgeType === 'events' ? 'events' : 'reviews';
    return `You made it to ${achievementCount} ${activity} using SampleFinder!`;
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
          <LinearGradient
            colors={['#95268B','#6C0331','#090188','#090188']}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientContainer}
          >
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <View style={styles.closeButtonCircle}>
                <CloseIcon color={Colors.white} />
              </View>
            </TouchableOpacity>

            {/* Badge Icon */}
            <View style={styles.badgeContainer}>
              <BadgeEarnedPopupIcon value={badgeNumber} size={165} />
            </View>
            <Text style={styles.badgeName}>{getBadgeName()}</Text>
            </LinearGradient>

            {/* Badge Name */}
            <View style={styles.badgeInfoContainer}>
              {/* Congratulations Message */}
              <Text style={styles.congratulationsText}>Congratulations!</Text>

              {/* Achievement Description */}
              <Text style={styles.achievementMessage}>{getAchievementMessage()}</Text>

              {/* Points Earned Indicator */}
              <View style={styles.pointsIndicatorContainer}>
                <SmallBlueStarIcon />
                <Text style={styles.pointsIndicatorText}>You earned points!</Text>
              </View>
            </View>

            {/* Share Button */}
            <View style={styles.shareButtonContainer}>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShare}
                activeOpacity={0.8}
              >
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(75, 31, 86, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    width: SCREEN_WIDTH - 40,
    maxWidth: 400,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  gradientContainer: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
    paddingTop: 40,
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
  badgeInfoContainer:{
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  badgeName: {
    fontSize: 20,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  congratulationsText: {
    fontSize: 28,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
    marginBottom: 16,
    textAlign: 'center',
  },
  achievementMessage: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.pinBlueBlack,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  pointsIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsIndicatorText: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.blueColorMode,
  },
  shareButtonContainer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  shareButton: {
    width: '100%',
    backgroundColor: '#090188',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
  },
});

export default BadgeEarnedModal;
