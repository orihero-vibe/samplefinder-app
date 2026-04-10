import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import type { ComponentProps } from 'react';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import GradientBottomSheetBackdrop from '@/components/shared/GradientBottomSheetBackdrop';
import { LinearGradient } from 'expo-linear-gradient';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';
import CustomButton from './CustomButton';
import { buildReferralUrl } from '@/lib/deepLink';

interface ReferFriendBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  referralCode?: string;
  refereePts?: number | null;
  referrerPts?: number | null;
  onClose?: () => void;
  onReferSuccess?: () => void;
}

const ReferFriendBottomSheet: React.FC<ReferFriendBottomSheetProps> = ({
  bottomSheetRef,
  referralCode = 'JNKLOW',
  refereePts,
  referrerPts,
  onClose,
  onReferSuccess,
}) => {
  const snapPoints = useMemo(() => ['50%'], []);

  const renderBackdrop = useMemo(
    () => (props: ComponentProps<typeof GradientBottomSheetBackdrop>) => (
      <GradientBottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.55}
      />
    ),
    []
  );

  const referralUrl = buildReferralUrl(referralCode);

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(referralUrl);
      Alert.alert('Copied!', 'Referral link copied to clipboard');
    } catch (error) {
      console.error('Failed to copy code:', error);
      Alert.alert('Error', 'Failed to copy referral link');
    }
  };

  const handleReferFriend = async () => {
    try {
      await Share.share({
        message: `Join me on SampleFinder! Use my referral link to get ${refereePts ?? ''} bonus points: ${referralUrl}`,
      });
      bottomSheetRef.current?.close();
    } catch (error) {
      console.error('Failed to share referral link:', error);
    }
  };

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
          <Text style={styles.title}>Share with a Friend!</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Monicon name="mdi:close" size={24} color={Colors.pinDarkBlue} />
          </TouchableOpacity>
        </View>

        {/* Referral Code Box */}
        <TouchableOpacity onPress={handleCopyCode} activeOpacity={0.8}>
          <LinearGradient
            colors={[Colors.brandPurpleDeep, Colors.brandPurpleBright, Colors.brandPurpleWine]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.referralCodeBox}
          >
            <Text style={styles.referralCodeLabel}>Your Referral Code</Text>
            <Text style={styles.referralCode}>{referralCode}</Text>
            <Text style={styles.tapToCopyText}>tap to copy</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Points Info */}
        <View style={styles.pointsInfo}>
          <Text style={styles.pointsText}>Send {refereePts ?? '...'} Points</Text>
          <Text style={styles.pointsText}>Earn {referrerPts ?? '...'} Points</Text>
        </View>

        {/* Refer Button */}
        <CustomButton
          title="Refer A Friend"
          onPress={handleReferFriend}
          variant="dark"
          size="medium"
          style={styles.referButton}
        />

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          * Points balance will be updated when they activate their SampleFinder account.
        </Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.pinDarkBlue,
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  referralCodeBox: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.brandPurpleBright,
    alignItems: 'center',
  },
  referralCodeLabel: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.white,
    marginBottom: 12,
  },
  referralCode: {
    fontSize: 36,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.white,
    letterSpacing: 4,
    marginBottom: 8,
  },
  tapToCopyText: {
    fontSize: 12,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.white,
    opacity: 0.9,
  },
  pointsInfo: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  pointsText: {
    fontSize: 18,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.pinDarkBlue,
  },
  referButton: {
    marginBottom: 16,
  },
  disclaimer: {
    fontSize: 12,
    fontFamily: 'Quicksand_400Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default ReferFriendBottomSheet;

