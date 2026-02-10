import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';
import { SmallBlueStarIcon, SmallStarIcon } from '@/icons';
import CustomButton from '@/components/shared/CustomButton';
import { Tier } from './TierItem';
import { CloseIcon } from '@/components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AchievementModalProps {
  visible: boolean;
  tier?: Tier | null;
  points?: number;
  message?: string;
  onClose: () => void;
  onShare?: () => void;
  onViewMoreEvents?: () => void;
}

const AchievementModal: React.FC<AchievementModalProps> = ({
  visible,
  tier,
  points = 100,
  message,
  onClose,
  onShare,
  onViewMoreEvents,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [imageError, setImageError] = useState(false);

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

  const handleViewMoreEvents = () => {
    if (onViewMoreEvents) {
      onViewMoreEvents();
    }
    onClose();
  };

  // Determine if tier is earned
  const isEarned = tier?.badgeEarned ?? false;
  const tierNumber = tier?.order ?? 1;
  const tierName = tier?.name ?? 'NewbieSampler';
  const currentPoints = tier?.currentPoints ?? 0;
  const requiredPoints = tier?.requiredPoints ?? 100;
  const progress = Math.min((currentPoints / requiredPoints) * 100, 100);

  // Get tier badge colors based on tier number
  const getTierBadgeColors = (tierNum: number) => {
    switch (tierNum) {
      case 1:
        return { primary: '#1E3A5F', secondary: '#4A5F7F' }; // Dark blue/purple
      case 2:
        return { primary: '#E91E63', secondary: '#F06292' }; // Pink/purple
      case 3:
        return { primary: '#FF9800', secondary: '#FFB74D' }; // Golden yellow/orange
      case 4:
        return { primary: '#9C27B0', secondary: '#BA68C8' }; // Purple
      case 5:
        return { primary: '#4CAF50', secondary: '#81C784' }; // Green
      default:
        return { primary: Colors.pinDarkBlue, secondary: Colors.blueColorMode };
    }
  };

  const badgeColors = getTierBadgeColors(tierNumber);

  // Get main message based on tier state
  const getMainMessage = () => {
    if (!isEarned) {
      return "You're On Your Way!";
    }
    if (tierNumber === 1) {
      return "Thanks for Joining!";
    }
    return "You've Leveled Up!";
  };

  // Get points message
  const getPointsMessage = () => {
    if (message) return message;
    
    if (isEarned) {
      if (tierNumber === 1) {
        return `You earned ${points} points with SampleFinder, just for signing up!`;
      }
      return `You reached **${requiredPoints.toLocaleString()}** points with SampleFinder, advancing you to the next Tier!`;
    }
    return `${currentPoints} / ${requiredPoints.toLocaleString()} points`;
  };

  const mainMessage = getMainMessage();
  const pointsMessage = getPointsMessage();

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
             <CloseIcon/>
            </View>
          </TouchableOpacity>

          {/* Badge with Tier Logo */}
          <View style={styles.badgeContainer}>
            {tier?.imageURL && !imageError ? (
              <Image
                source={{ uri: tier.imageURL }}
                style={styles.tierImage}
                resizeMode="contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <View style={[styles.fallbackBadge, { backgroundColor: badgeColors.primary }]}>
                <Monicon name="ph:seal-fill" size={120} color={Colors.white} />
              </View>
            )}
          </View>

          {/* Tier Name */}
          <Text style={styles.tierName}>{tierName}</Text>

          {/* Main Message */}
          <Text style={styles.mainMessage}>{mainMessage}</Text>

          {/* Points Message */}
          <Text style={styles.pointsMessage}>
            {pointsMessage.split('**').map((part, index) => 
              index % 2 === 1 ? (
                <Text key={index} style={styles.boldText}>{part}</Text>
              ) : (
                part
              )
            )}
          </Text>

          {/* Progress Bar (for in-progress state) */}
          {!isEarned && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
              </View>
            </View>
          )}

          {/* Points Indicator */}
          <View style={styles.pointsIndicatorContainer}>
            <SmallBlueStarIcon />
            <Text style={styles.pointsIndicatorText}>
              {isEarned ? 'You earned points!' : 'Keep earning points!'}
            </Text>
          </View>

          {/* Action Button */}
          <CustomButton
            title={isEarned ? 'Share' : 'View More Events'}
            onPress={isEarned ? handleShare : handleViewMoreEvents}
            variant="dark"
            size="medium"
            style={styles.actionButton}
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
  tierImage: {
    width: 200,
    height: 200,
  },
  fallbackBadge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierName: {
    fontSize: 20,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.pinDarkBlue,
    marginBottom: 12,
    textAlign: 'center',
  },
  mainMessage: {
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
  boldText: {
    fontFamily: 'Quicksand_700Bold',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#D0D0D0',
    borderRadius: 4,
  },
  pointsIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  pointsIndicatorText: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.pinDarkBlue,
  },
  actionButton: {
    width: '100%',
    marginTop: 8,
  },
});

export default AchievementModal;

