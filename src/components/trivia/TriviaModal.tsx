import React, { useState } from 'react';
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
import { SparkleIcon, LocationPinIcon } from '../../icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface TriviaQuestion {
  id: string;
  question: string;
  answers: string[];
  correctAnswerIndex: number;
  points: number;
}

interface TriviaModalProps {
  visible: boolean;
  question: TriviaQuestion;
  onClose: () => void;
  onAnswerSelected?: (isCorrect: boolean, points: number) => void;
}

type AnswerState = 'idle' | 'correct' | 'incorrect';

export const TriviaModal: React.FC<TriviaModalProps> = ({
  visible,
  question,
  onClose,
  onAnswerSelected,
}) => {
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  React.useEffect(() => {
    if (visible) {
      setSelectedAnswerIndex(null);
      setAnswerState('idle');
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

  const handleAnswerPress = (index: number) => {
    if (selectedAnswerIndex !== null) return; // Prevent multiple selections

    setSelectedAnswerIndex(index);
    const isCorrect = index === question.correctAnswerIndex;
    setAnswerState(isCorrect ? 'correct' : 'incorrect');

    if (onAnswerSelected) {
      onAnswerSelected(isCorrect, isCorrect ? question.points : 0);
    }
  };

  const handleClose = () => {
    setSelectedAnswerIndex(null);
    setAnswerState('idle');
    onClose();
  };

  const renderLocationIcon = () => (
    <View style={styles.locationIconContainer}>
      <LocationPinIcon size={80} color="#6B46C1" magnifyingGlassColor="#FFFFFF" />
    </View>
  );

  const renderAnswerButton = (answer: string, index: number) => {
    const isSelected = selectedAnswerIndex === index;
    const isCorrect = index === question.correctAnswerIndex;
    const showCorrectState = answerState === 'correct' && isCorrect;
    const showIncorrectState = answerState === 'incorrect' && isSelected && !isCorrect;

    let buttonStyle = styles.answerButton;
    let textStyle = styles.answerButtonText;

    if (isSelected) {
      if (showCorrectState) {
        buttonStyle = [styles.answerButton, styles.answerButtonCorrect];
      } else if (showIncorrectState) {
        buttonStyle = [styles.answerButton, styles.answerButtonIncorrect];
      } else {
        buttonStyle = [styles.answerButton, styles.answerButtonSelected];
      }
    }

    return (
      <TouchableOpacity
        key={index}
        style={buttonStyle}
        onPress={() => handleAnswerPress(index)}
        disabled={selectedAnswerIndex !== null}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={
            isSelected && !showIncorrectState
              ? ['#6B46C1', '#9333EA']
              : showIncorrectState
              ? ['#DC2626', '#B91C1C']
              : ['#FFFFFF', '#FFFFFF']
          }
          style={styles.answerButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text
            style={[
              textStyle,
              isSelected && !showIncorrectState && styles.answerButtonTextSelected,
              showIncorrectState && styles.answerButtonTextIncorrect,
            ]}
          >
            {answer}
          </Text>
        </LinearGradient>
        {showCorrectState && (
          <View style={styles.sparkleContainer}>
            <SparkleIcon size={16} color="#9333EA" />
            <SparkleIcon size={16} color="#9333EA" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderResult = () => {
    if (answerState === 'correct') {
      return (
        <View style={styles.resultContainer}>
          <Text style={styles.correctMessage}>That's Correct!</Text>
          <View style={styles.pointsBadgeContainer}>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsBadgeLabel}>YOU EARNED POINTS!</Text>
              <View style={styles.pointsValueContainer}>
                <Text style={styles.pointsValue}>{question.points}</Text>
                <SparkleIcon size={20} color="#DC2626" />
              </View>
              <Text style={styles.pointsCongrats}>CONGRATS!</Text>
            </View>
            <View style={styles.sparkleContainerRight}>
              <SparkleIcon size={16} color="#9333EA" />
              <SparkleIcon size={16} color="#9333EA" />
            </View>
          </View>
        </View>
      );
    } else if (answerState === 'incorrect') {
      return (
        <View style={styles.resultContainer}>
          <View style={styles.incorrectIconContainer}>
            <View style={styles.incorrectIcon}>
              <Text style={styles.incorrectX}>✕</Text>
            </View>
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
        <View style={styles.pointsIndicator}>
          <Text style={styles.pointsIndicatorValue}>{question.points}</Text>
        </View>
      </View>
    );
  };

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

          <Text style={styles.title}>Brand Name Trivia!</Text>

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
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  answerButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  answerButtonSelected: {
    borderColor: '#9333EA',
  },
  answerButtonCorrect: {
    borderColor: '#9333EA',
  },
  answerButtonIncorrect: {
    borderColor: '#DC2626',
  },
  answerButtonText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    textAlign: 'center',
  },
  answerButtonTextSelected: {
    color: '#FFFFFF',
  },
  answerButtonTextIncorrect: {
    color: '#FFFFFF',
  },
  sparkleContainer: {
    position: 'absolute',
    right: 12,
    top: '50%',
    flexDirection: 'row',
    transform: [{ translateY: -8 }],
    gap: 4,
  },
  sparkleContainerRight: {
    position: 'absolute',
    right: -20,
    top: '50%',
    flexDirection: 'row',
    transform: [{ translateY: -8 }],
    gap: 4,
  },
  resultContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  correctMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  pointsBadgeContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  pointsBadge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  pointsBadgeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  pointsValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#DC2626',
    marginRight: 4,
  },
  pointsCongrats: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 8,
  },
  instructionContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  pointsIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#9333EA',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  pointsIndicatorValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B46C1',
  },
  incorrectIconContainer: {
    marginBottom: 16,
  },
  incorrectIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#DC2626',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  incorrectX: {
    fontSize: 48,
    color: '#DC2626',
    fontWeight: 'bold',
  },
  incorrectMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
});

