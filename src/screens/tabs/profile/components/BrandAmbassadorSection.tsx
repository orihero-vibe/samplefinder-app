import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import CustomButton from '@/components/shared/CustomButton';

interface BrandAmbassadorSectionProps {
  onApplyHerePress?: () => void;
}

const BrandAmbassadorSection: React.FC<BrandAmbassadorSectionProps> = ({
  onApplyHerePress,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Want to join our brand ambassador team and represent your favorite brands in stores? Earn
        your Certified Brand Ambassador badge!
      </Text>
      <CustomButton
        title="Apply Here!"
        onPress={onApplyHerePress}
        variant="primary"
        size="medium"
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
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.black,
    marginBottom: 16,
    lineHeight: 20,
  },
  applyButton: {
    backgroundColor: Colors.orangeBA,
  },
  applyButtonText: {
    color: Colors.white,
  },
});

export default BrandAmbassadorSection;

