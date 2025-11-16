import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';
import { TabParamList } from '@/navigation/TabNavigator';
import { HomeStackParamList } from '@/navigation/HomeStack';
import { BrandDetailsData } from '@/screens/brand-details';

type UpcomingEventsNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>,
  BottomTabNavigationProp<TabParamList, 'Home'>
>;

export interface EventData {
  id: string;
  product: string;
  location: string;
  distance: string;
  date: string;
  time: string;
}

interface UpcomingEventsProps {
  events: EventData[];
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events }) => {
  const navigation = useNavigation<UpcomingEventsNavigationProp>();

  const handleEventPress = (event: EventData) => {
    // Convert EventData to BrandDetailsData with default values
    // Parse location to extract address if possible, otherwise use defaults
    const brandDetails: BrandDetailsData = {
      id: event.id,
      brandName: event.product, // Using product as brand name
      storeName: event.location,
      date: event.date,
      time: event.time,
      address: {
        street: '100 Main Street', // Default address
        city: 'Philadelphia',
        state: 'PA',
        zip: '19101',
      },
      products: [event.product], // Default to single product
      eventInfo:
        'Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Phasellus convallis pellentesque tortor sit amet suscipit.',
      discountMessage:
        'Discount appears here when you check in at event! Check In Code provided on-site.',
    };

    navigation.navigate('BrandDetails', { brand: brandDetails });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>UPCOMING EVENTS</Text>
      {events.map((event, index) => (
        <TouchableOpacity
          key={event.id}
          onPress={() => handleEventPress(event)}
          activeOpacity={0.7}
        >
          <View style={styles.eventItem}>
            <View style={styles.eventLeft}>
              <View style={styles.iconContainer}>
                <Monicon name="mdi:map-marker" size={20} color={Colors.blueColorMode} />
                <View style={styles.iconOverlay}>
                  <Monicon name="mdi:magnify" size={12} color={Colors.white} />
                </View>
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.productText}>{event.product}</Text>
                <Text style={styles.locationText}>{event.location}</Text>
                <Text style={styles.distanceText}>{event.distance}</Text>
              </View>
            </View>
            <View style={styles.eventRight}>
              <Text style={styles.dateText}>{event.date}</Text>
              <Text style={styles.timeText}>{event.time}</Text>
            </View>
          </View>
          {index < events.length - 1 && <View style={styles.separator} />}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  eventLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.blueColorMode,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  iconOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.blueColorMode,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventDetails: {
    flex: 1,
  },
  productText: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.black,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 13,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.black,
    marginBottom: 2,
  },
  distanceText: {
    fontSize: 12,
    fontFamily: 'Quicksand_400Regular',
    color: '#666666',
  },
  eventRight: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 13,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.black,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Quicksand_500Medium',
    color: '#666666',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginLeft: 72,
  },
});

export default UpcomingEvents;

