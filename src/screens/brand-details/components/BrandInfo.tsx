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
      <Text style={styles.brandName}>{brand.storeName}</Text>

      {/* Date and Store Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.dateContainer}>
          <Text style={styles.monthText}>{monthAbbr}</Text>
          <Text style={styles.dayText}>{day}</Text>
        </View>
        <View style={styles.storeDetails}>
          <Text style={styles.storeName}>{brand.brandName}</Text>
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
    fontSize: 22,
    fontFamily: 'Quicksand_700Bold',
    color: '#050A24',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  detailsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  dateContainer: {
    alignItems: 'center',
    minWidth: 60,
    justifyContent: 'center',
    paddingTop: 4,
    paddingHorizontal: 16,
    marginRight: 30,
  },
  monthText: {
    fontSize: 20,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
  },
  dayText: {
    fontSize: 24,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
  },
  storeDetails: {
    flex: 1,
  },
  storeName: {
    fontSize: 20,
    fontFamily: 'Quicksand_700Bold',
    color: '#050A24',
    marginBottom: 2,
  },
  storeInfo: {
    fontSize: 16,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.black,
    lineHeight: 22,
  },
});

export default BrandInfo;

