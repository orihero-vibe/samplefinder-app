import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Rating descriptions
const RATING_DESCRIPTIONS: { [key: number]: string } = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Almost Perfect!',
  5: 'Perfect!',
};

// Feedback tags
const FEEDBACK_TAGS = [
  'Staff',
  'Swag',
  'Sample',
  'Presentation',
  'Experience',
  'Professionalism',
  'Other',
];

interface ReviewModalProps {
  visible: boolean;
  eventName?: string;
  brandName?: string;
  onClose: () => void;
  onSubmit: (reviewText: string, rating: number, tags?: string[], purchased?: boolean) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [purchased, setPurchased] = useState<boolean | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  useEffect(() => {
    if (visible) {
      // Reset state when modal opens
      setRating(0);
      setReviewText('');
      setSelectedTags([]);
      setPurchased(null);
      
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

  const handleStarPress = (starIndex: number) => {
    setRating(starIndex + 1);
  };

  const handleTagPress = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (rating === 0) {
      return;
    }
    
    onSubmit(reviewText, rating, selectedTags, purchased ?? undefined);
    onClose();
  };

  const handleClose = () => {
    setRating(0);
    setReviewText('');
    setSelectedTags([]);
    setPurchased(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity 
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
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
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <View style={styles.closeButtonCircle}>
                <Monicon name="mdi:close" size={16} color={Colors.pinDarkBlue} />
              </View>
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>How Did Sampling Go?</Text>
            </View>

            {/* Star Rating */}
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleStarPress(index)}
                    style={styles.starButton}
                  >
                    <Monicon
                      name={index < rating ? 'mdi:star' : 'mdi:star-outline'}
                      size={36}
                      color={Colors.pinDarkBlue}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {rating > 0 && (
                <Text style={styles.ratingDescription}>
                  {RATING_DESCRIPTIONS[rating]}
                </Text>
              )}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* What Did You Like? */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What Did You Like?</Text>
              <View style={styles.tagsContainer}>
                {FEEDBACK_TAGS.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tag,
                      selectedTags.includes(tag) && styles.tagSelected,
                    ]}
                    onPress={() => handleTagPress(tag)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        selectedTags.includes(tag) && styles.tagTextSelected,
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Did You Purchase The Product? */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Did You Purchase The Product?</Text>
              <View style={styles.purchaseContainer}>
                <TouchableOpacity
                  style={[
                    styles.purchaseButton,
                    purchased === true && styles.purchaseButtonSelected,
                  ]}
                  onPress={() => setPurchased(true)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.purchaseButtonText,
                      purchased === true && styles.purchaseButtonTextSelected,
                    ]}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.purchaseButton,
                    purchased === false && styles.purchaseButtonSelected,
                  ]}
                  onPress={() => setPurchased(false)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.purchaseButtonText,
                      purchased === false && styles.purchaseButtonTextSelected,
                    ]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Add Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Add Details:</Text>
              <TextInput
                style={styles.reviewInput}
                multiline
                numberOfLines={4}
                placeholder="Expandable field for user to fill out with their review."
                placeholderTextColor="#999"
                value={reviewText}
                onChangeText={setReviewText}
                maxLength={500}
                textAlignVertical="top"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                rating === 0 && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              activeOpacity={0.7}
              disabled={rating === 0}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(75, 31, 86, 0.7)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 80,
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.92,
    maxWidth: 400,
    backgroundColor: Colors.white,
    borderRadius: 16,
    maxHeight: '85%',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
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
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.pinDarkBlue,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  starButton: {
    padding: 2,
  },
  ratingDescription: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.pinDarkBlue,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 16,
  },
  section: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.pinDarkBlue,
    textAlign: 'center',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  tag: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.pinDarkBlue,
    backgroundColor: Colors.white,
  },
  tagSelected: {
    backgroundColor: Colors.pinDarkBlue,
  },
  tagText: {
    fontSize: 13,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.pinDarkBlue,
  },
  tagTextSelected: {
    color: Colors.white,
  },
  purchaseContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  purchaseButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.pinDarkBlue,
    backgroundColor: Colors.white,
    minWidth: 60,
    alignItems: 'center',
  },
  purchaseButtonSelected: {
    backgroundColor: Colors.pinDarkBlue,
  },
  purchaseButtonText: {
    fontSize: 13,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.pinDarkBlue,
  },
  purchaseButtonTextSelected: {
    color: Colors.white,
  },
  reviewInput: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.pinDarkBlue,
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  submitButton: {
    backgroundColor: Colors.blueColorMode,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.white,
  },
});

export default ReviewModal;

