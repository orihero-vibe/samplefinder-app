import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { BrandDetailsData } from '..';

interface BrandInfoProps {
  brand: BrandDetailsData;
}

const BrandInfo: React.FC<BrandInfoProps> = ({ brand }) => {
  // Parse date to get month abbreviation and day
  const dateParts = brand.date.split(' ');
  const monthAbbr = dateParts[0]; // "Aug"
  const day = dateParts[1].replace(',', ''); // "1"

  return (
    <View style={styles.container}>
      {/* Brand Name */}
      <Text style={styles.brandName}>{brand.brandName}</Text>

      {/* Date and Store Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.dateContainer}>
          <Text style={styles.monthText}>{monthAbbr}</Text>
          <Text style={styles.dayText}>{day}</Text>
        </View>
        <View style={styles.storeDetails}>
          <Text style={styles.storeName}>{brand.storeName}</Text>
          <Text style={styles.storeInfo}>{brand.time}</Text>
          <Text style={styles.storeInfo}>{brand.address.street}</Text>
          <Text style={styles.storeInfo}>
            {brand.address.city}, {brand.address.state} {brand.address.zip}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    width: '100%',
  },
  brandName: {
    fontSize: 24,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  detailsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  dateContainer: {
    alignItems: 'center',
    marginRight: 20,
    flex: 1,
    justifyContent: 'center',
  },
  monthText: {
    fontSize: 24,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
  },
  dayText: {
    fontSize: 26,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
  },
  storeDetails: {
    flex: 3,
  },
  storeName: {
    fontSize: 24,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.black,
  },
  storeInfo: {
    fontSize: 18,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.black,
    marginBottom: 4,
  },
});

export default BrandInfo;

