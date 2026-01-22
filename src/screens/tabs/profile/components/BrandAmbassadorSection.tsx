import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import CustomButton from '@/components/shared/CustomButton';

interface BrandAmbassadorSectionProps {
  onApplyHerePress?: () => void;
  isAmbassador?: boolean;
}

const BrandAmbassadorSection: React.FC<BrandAmbassadorSectionProps> = ({
  onApplyHerePress,
  isAmbassador = false,
}) => {
  // Don't show the section if user is already an ambassador
  if (isAmbassador) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Want to join our brand ambassador team and represent your favorite brands in stores? {'\n'} Earn
        your Certified Brand Ambassador badge!
      </Text>
      <CustomButton
        title="Apply Here!"
        onPress={onApplyHerePress || (() => {})}
        variant="outline"
        size="small"
        style={styles.applyButton}
        textStyle={styles.applyButtonText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Quicksand_700Bold',
    color: Colors.pinBlueBlack,
    marginBottom: 16,
    lineHeight: 20,
  },
  applyButton: {
    width: 200,
    backgroundColor: 'transparent',
    borderColor: Colors.orangeBA,
    borderWidth: 2,
    alignSelf: 'center',
  },
  applyButtonText: {
    color: Colors.orangeBA,
  },
});

export default BrandAmbassadorSection;

