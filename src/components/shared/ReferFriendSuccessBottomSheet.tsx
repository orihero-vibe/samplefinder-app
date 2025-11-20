import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';
import { SparkleIcon } from '@/icons';

interface ReferFriendSuccessBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  points?: number;
  onClose?: () => void;
  onViewRewards?: () => void;
}

const ReferFriendSuccessBottomSheet: React.FC<ReferFriendSuccessBottomSheetProps> = ({
  bottomSheetRef,
  points = 100,
  onClose,
  onViewRewards,
}) => {
  const snapPoints = useMemo(() => ['75%'], []);

  const renderBackdrop = useMemo(
    () => (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onClose={onClose}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView style={styles.content}>
        {/* Header with close button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <View style={styles.closeButtonCircle}>
              <Monicon name="mdi:close" size={20} color={Colors.pinDarkBlue} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Points Circle Graphic */}
        <View style={styles.pointsContainer}>
          {/* Small sparkles above */}
          <View style={styles.sparkleTopLeft}>
            <SparkleIcon size={24} color={Colors.pinDarkBlue} circleColor="transparent" />
          </View>
          <View style={styles.sparkleTopRight}>
            <SparkleIcon size={24} color={Colors.pinDarkBlue} circleColor="transparent" />
          </View>

          {/* Main Circle */}
          <View style={styles.pointsCircle}>
            {/* Top curved text - POINTS INBOUND! */}
            <View style={styles.topCurvedTextContainer}>
              <Text style={styles.curvedTextTop}>POINTS INBOUND!</Text>
            </View>

            {/* Center points value */}
            <Text style={styles.pointsValue}>{points}</Text>

            {/* Bottom curved text - CONGRATS! */}
            <View style={styles.bottomCurvedTextContainer}>
              <Text style={styles.curvedTextBottom}>CONGRATS!</Text>
            </View>
          </View>

          {/* Large sparkle to the right */}
          <View style={styles.sparkleRight}>
            <SparkleIcon size={48} color={Colors.pinDarkBlue} circleColor={Colors.pinDarkBlue} />
          </View>
        </View>

        {/* Thanks message */}
        <View style={styles.thanksContainer}>
          <Text style={styles.thanksText}>Thanks for Inviting</Text>
          <Text style={styles.thanksText}>a Friend!</Text>
        </View>

        {/* View Rewards Progress Link */}
        <TouchableOpacity
          onPress={onViewRewards}
          style={styles.rewardsLink}
          activeOpacity={0.7}
        >
          <SparkleIcon size={20} color={Colors.pinDarkBlue} circleColor="transparent" />
          <Text style={styles.rewardsLinkText}>View Rewards Progress</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: '#D0D0D0',
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    width: 200,
    height: 200,
  },
  sparkleTopLeft: {
    position: 'absolute',
    top: -10,
    left: 20,
    zIndex: 1,
  },
  sparkleTopRight: {
    position: 'absolute',
    top: -10,
    right: 20,
    zIndex: 1,
  },
  sparkleRight: {
    position: 'absolute',
    right: -30,
    top: '50%',
    transform: [{ translateY: -24 }],
    zIndex: 1,
  },
  pointsCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    borderColor: Colors.pinDarkBlue,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  topCurvedTextContainer: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
    transform: [{ rotate: '0deg' }],
  },
  curvedTextTop: {
    fontSize: 11,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.pinDarkBlue,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  pointsValue: {
    fontSize: 56,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.pinDarkBlue,
    marginVertical: 4,
    lineHeight: 64,
  },
  bottomCurvedTextContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  curvedTextBottom: {
    fontSize: 11,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.pinDarkBlue,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  thanksContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  thanksText: {
    fontSize: 24,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.pinDarkBlue,
    textAlign: 'center',
  },
  rewardsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  rewardsLinkText: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.pinDarkBlue,
  },
});

export default ReferFriendSuccessBottomSheet;

