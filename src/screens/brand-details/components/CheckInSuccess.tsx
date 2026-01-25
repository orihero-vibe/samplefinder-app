import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Monicon } from '@monicon/native';
import PointsBadge from './PointsBadge';

// Maroon/burgundy color for the badge
const BADGE_COLOR = '#8B1538';

interface CheckInSuccessProps {
  onLeaveReview?: () => void;
  pointsEarned?: number;
  showReviewButton?: boolean;
  discount?: number | null;
  discountImageURL?: string | null;
}

const CheckInSuccess: React.FC<CheckInSuccessProps> = ({
  onLeaveReview,
  pointsEarned = 10,
  showReviewButton = true,
  discount,
  discountImageURL,
}) => {
  // Only show discount section if there's a discount or discount image
  const hasDiscount = discount != null || discountImageURL;

  return (
    <View style={styles.container}>
      {/* Barcode/Discount Section - only show if discount exists */}
      {hasDiscount && (
        <View style={styles.barcodeSection}>
          <View style={styles.barcodeRow}>
            {discount != null && (
              <Text style={styles.barcodeText}>
                Scan to save ${discount} on{'\n'}today's purchase
              </Text>
            )}
            {discountImageURL ? (
              <View style={styles.barcodeContainer}>
                <Image
                  source={{ uri: discountImageURL }}
                  style={styles.discountImage}
                  resizeMode="contain"
                />
              </View>
            ) : (
              <View style={styles.barcodeContainer}>
                {/* Fallback barcode representation */}
                <View style={styles.barcode}>
                  {Array.from({ length: 40 }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.barcodeLine,
                        {
                          width: i % 4 === 0 ? 2.5 : i % 3 === 0 ? 1.5 : 1,
                          height: 50,
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Points Earned Badge */}
      <PointsBadge points={pointsEarned} />

      {/* Leave A Review Button */}
      {showReviewButton && onLeaveReview && (
        <TouchableOpacity
          style={styles.reviewButton}
          onPress={onLeaveReview}
          activeOpacity={0.7}
        >
          <Text style={styles.reviewButtonText}>Leave A Review</Text>
          <View style={styles.starsContainer}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Monicon
                key={i}
                name="mdi:star-outline"
                size={18}
                color={Colors.white}
              />
            ))}
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  barcodeSection: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  barcodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  barcodeText: {
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    color: BADGE_COLOR,
    lineHeight: 22,
    flex: 1,
  },
  barcodeContainer: {
    alignItems: 'center',
  },
  barcode: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 1.5,
    marginBottom: 4,
    backgroundColor: Colors.white,
  },
  barcodeLine: {
    backgroundColor: Colors.black,
  },
  barcodeNumber: {
    fontSize: 10,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.black,
    letterSpacing: 1,
  },
  discountImage: {
    width: 150,
    height: 60,
    backgroundColor: Colors.white,
  },
  reviewButton: {
    backgroundColor: Colors.blueColorMode,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginHorizontal: 20,
  },
  reviewButtonText: {
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.white,
    marginBottom: 6,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
});

export default CheckInSuccess;

