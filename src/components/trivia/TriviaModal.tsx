import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SparkleIcon, LocationPinIcon } from '../../icons';
import WrongAnswerIcon from '../../icons/WrongAnswerIcon';
import PointsBadgeIcon from '../../icons/PointsBadgeIcon';
import type { TriviaQuestion, SubmitAnswerResult } from '../../lib/database/trivia';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Re-export the TriviaQuestion type for convenience
export type { TriviaQuestion } from '../../lib/database/trivia';

interface TriviaModalProps {
  visible: boolean;
  question: TriviaQuestion;
  onClose: () => void;
  onSubmitAnswer: (answerIndex: number) => Promise<SubmitAnswerResult>;
  onAnswerResult?: (isCorrect: boolean, pointsAwarded: number) => void;
}

type AnswerState = 'idle' | 'submitting' | 'correct' | 'incorrect';

export const TriviaModal: React.FC<TriviaModalProps> = ({
  visible,
  question,
  onClose,
  onSubmitAnswer,
  onAnswerResult,
}) => {
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [pointsAwarded, setPointsAwarded] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(10);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  React.useEffect(() => {
    if (visible) {
      setSelectedAnswerIndex(null);
      setCorrectAnswerIndex(null);
      setAnswerState('idle');
      setPointsAwarded(0);
      setCountdown(10);
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

  // Countdown timer
  useEffect(() => {
    if (visible && answerState === 'idle' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [visible, answerState, countdown]);

  // Close modal when countdown reaches 0
  useEffect(() => {
    if (visible && answerState === 'idle' && countdown === 0) {
      handleClose();
    }
  }, [visible, answerState, countdown]);

  const handleAnswerPress = async (index: number) => {
    if (selectedAnswerIndex !== null || answerState === 'submitting') return; // Prevent multiple selections

    setSelectedAnswerIndex(index);
    setAnswerState('submitting');

    try {
      const result = await onSubmitAnswer(index);
      
      if (result.success) {
        const isCorrect = result.isCorrect ?? false;
        const points = result.pointsAwarded ?? 0;
        const correctIndex = result.correctAnswerIndex ?? null;
        
        setAnswerState(isCorrect ? 'correct' : 'incorrect');
        setPointsAwarded(points);
        setCorrectAnswerIndex(correctIndex);
        
        if (onAnswerResult) {
          onAnswerResult(isCorrect, points);
        }
      } else {
        // Handle error - treat as incorrect
        console.error('[TriviaModal] Submit answer failed:', result.error);
        setAnswerState('incorrect');
        setPointsAwarded(0);
        
        if (onAnswerResult) {
          onAnswerResult(false, 0);
        }
      }
    } catch (error) {
      console.error('[TriviaModal] Error submitting answer:', error);
      setAnswerState('incorrect');
      setPointsAwarded(0);
      
      if (onAnswerResult) {
        onAnswerResult(false, 0);
      }
    }
  };

  const handleClose = () => {
    setSelectedAnswerIndex(null);
    setCorrectAnswerIndex(null);
    setAnswerState('idle');
    setPointsAwarded(0);
    onClose();
  };

  const renderLocationIcon = () => (
    <View style={styles.locationIconContainer}>
      <Image
        source={require('../../assets/locationImage.png')}
        style={styles.locationImage}
        resizeMode="contain"
      />
    </View>
  );

  const renderAnswerButton = (answer: string, index: number) => {
    const isSelected = selectedAnswerIndex === index;
    const isSubmitting = answerState === 'submitting';
    const isCorrectAnswer = correctAnswerIndex === index;
    const showCorrectState = (answerState === 'correct' || answerState === 'incorrect') && isCorrectAnswer;
    const showIncorrectState = answerState === 'incorrect' && isSelected && !isCorrectAnswer;

    const getButtonStyle = () => {
      if (showCorrectState) {
        return [styles.answerButton, styles.answerButtonCorrect];
      } else if (showIncorrectState) {
        return [styles.answerButton, styles.answerButtonIncorrect];
      } else if (isSelected && isSubmitting) {
        return [styles.answerButton, styles.answerButtonSelected];
      }
      return styles.answerButton;
    };

    const getTextStyle = () => {
      if (showCorrectState) {
        return [styles.answerButtonText, styles.answerButtonTextCorrect];
      } else if (isSelected && isSubmitting) {
        return [styles.answerButtonText, styles.answerButtonTextSelected];
      } else if (showIncorrectState) {
        return [styles.answerButtonText, styles.answerButtonTextSelected];
      }
      return styles.answerButtonText;
    };

    return (
      <TouchableOpacity
        key={index}
        style={getButtonStyle()}
        onPress={() => handleAnswerPress(index)}
        disabled={selectedAnswerIndex !== null || isSubmitting}
        activeOpacity={0.8}
      >
        <View style={styles.answerButtonGradient}>
          {isSelected && isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={getTextStyle()}>
              {answer}
            </Text>
          )}
        </View>

      </TouchableOpacity>
    );
  };

  const renderResult = () => {
    if (answerState === 'submitting') {
      return (
        <View style={styles.resultContainer}>
          <Text style={styles.instructionText}>Checking your answer...</Text>
        </View>
      );
    }
    
    if (answerState === 'correct') {
      return (
        <View style={styles.resultContainer}>
          <Text style={styles.correctMessage}>That's Correct!</Text>
          <View style={styles.pointsBadgeContainer}>
            <PointsBadgeIcon size={140} points={pointsAwarded} />
          </View>
        </View>
      );
    } else if (answerState === 'incorrect') {
      return (
        <View style={styles.resultContainer}>
          <View style={styles.incorrectIconContainer}>
            <WrongAnswerIcon size={80} />
          </View>
          <Text style={styles.incorrectMessage}>Better luck next time!</Text>
        </View>
      );
    }
    return (
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          Earn points when you answer correctly!
        </Text>
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownValue}>{countdown}</Text>
        </View>
      </View>
    );
  };

  // Get brand name for title
  const brandName = question.client?.name || 'Brand';
  const title = `${brandName} Trivia!`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
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
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <View style={styles.closeButtonCircle}>
              <Text style={styles.closeButtonText}>✕</Text>
            </View>
          </TouchableOpacity>

          {renderLocationIcon()}

          <Text style={styles.title}>{title}</Text>

          <Text style={styles.question}>{question.question}</Text>

          <View style={styles.answersContainer}>
            {question.answers.map((answer, index) => renderAnswerButton(answer, index))}
          </View>

          {renderResult()}
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },
  locationIconContainer: {
    marginTop: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  locationImage: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  question: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  answersContainer: {
    width: '100%',
    marginBottom: 20,
  },
  answerButton: {
    marginBottom: 12,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#6B46C1',
  },
  answerButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 28,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerButtonSelected: {
    borderColor: '#6B46C1',
    backgroundColor: '#6B46C1',
  },
  answerButtonCorrect: {
    borderColor: '#6B46C1',
    backgroundColor: '#FFFFFF',
  },
  answerButtonIncorrect: {
    borderColor: '#DC2626',
    backgroundColor: '#DC2626',
  },
  answerButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  answerButtonTextSelected: {
    color: '#FFFFFF',
  },
  answerButtonTextCorrect: {
    color: '#6B46C1',
  },
  sparkleContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    flexDirection: 'row',
    transform: [{ translateY: -12 }],
    gap: 8,
  },
  sparkleContainerRight: {
    position: 'absolute',
    right: -24,
    top: '50%',
    flexDirection: 'column',
    transform: [{ translateY: -24 }],
    gap: 8,
  },
  resultContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  correctMessage: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  pointsBadgeContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '400',
  },
  countdownContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#6B46C1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  countdownValue: {
    fontSize: 40,
    fontWeight: '700',
    color: '#6B46C1',
  },
  incorrectIconContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incorrectMessage: {
    fontSize: 16,
    fontWeight: '400',
    color: '#4B5563',
    textAlign: 'center',
  },
});
