import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Monicon } from '@monicon/native';

interface CheckInSuccessProps {
  onLeaveReview: () => void;
}

const CheckInSuccess: React.FC<CheckInSuccessProps> = ({ onLeaveReview }) => {
  return (
    <View style={styles.container}>
      {/* Barcode Section */}
      <View style={styles.barcodeSection}>
        <View style={styles.barcodeRow}>
          <Text style={styles.barcodeText}>Scan to save $1 on today's purchase</Text>
          <View style={styles.barcodeContainer}>
            {/* Barcode representation - using lines to simulate barcode */}
            <View style={styles.barcode}>
              {Array.from({ length: 50 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.barcodeLine,
                    { width: i % 3 === 0 ? 3 : 2, height: 60 },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.barcodeNumber}>012345 678912</Text>
          </View>
        </View>
      </View>

      {/* Points Earned Graphic */}
      <View style={styles.pointsContainer}>
        <View style={styles.pointsCircle}>
          <Text style={styles.pointsLabel}>YOU EARNED POINTS!</Text>
          <Text style={styles.pointsValue}>###</Text>
          <View style={styles.congratsBadge}>
            <Monicon name="mdi:star" size={24} color={Colors.blueColorMode} />
            <Text style={styles.congratsText}>CONGRATS!</Text>
          </View>
        </View>
      </View>

      {/* Leave A Review Button */}
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
              size={20}
              color={Colors.white}
            />
          ))}
        </View>
      </TouchableOpacity>
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
    marginBottom: 32,
    width: '100%',
  },
  barcodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  barcodeText: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
    textAlign: 'center',
    flex: 1,
    minWidth: 200,
  },
  barcodeContainer: {
    alignItems: 'center',
  },
  barcode: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginBottom: 8,
    backgroundColor: Colors.white,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  barcodeLine: {
    backgroundColor: Colors.black,
  },
  barcodeNumber: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.black,
    letterSpacing: 2,
  },
  pointsContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  pointsCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: Colors.blueColorMode,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: Colors.white,
  },
  pointsLabel: {
    position: 'absolute',
    top: 20,
    fontSize: 12,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
    textTransform: 'uppercase',
  },
  pointsValue: {
    fontSize: 48,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
    marginTop: 20,
  },
  congratsBadge: {
    position: 'absolute',
    bottom: -15,
    right: -20,
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  congratsText: {
    fontSize: 10,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
    marginTop: 2,
  },
  reviewButton: {
    backgroundColor: Colors.blueColorMode,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 250,
  },
  reviewButtonText: {
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.white,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
});

export default CheckInSuccess;

