import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';
import { EventData } from './UpcomingEvents';
import { TabParamList } from '@/navigation/TabNavigator';
import { HomeStackParamList } from '@/navigation/HomeStack';
import { BrandDetailsData } from '@/screens/brand-details';

type StoreModalNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>,
  BottomTabNavigationProp<TabParamList, 'Home'>
>;

export interface StoreData {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  events: EventData[];
}

interface StoreModalProps {
  visible: boolean;
  store: StoreData | null;
  onClose: () => void;
}

const StoreModal: React.FC<StoreModalProps> = ({ visible, store, onClose }) => {
  const navigation = useNavigation<StoreModalNavigationProp>();

  if (!store) return null;

  const handleEventPress = (event: EventData) => {
    // Convert EventData + StoreData to BrandDetailsData
    const brandDetails: BrandDetailsData = {
      id: event.id,
      brandName: event.product, // Using product as brand name
      storeName: store.name,
      date: event.date,
      time: event.time,
      address: store.address,
      products: [event.product], // Default to single product
      eventInfo:
        'Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Phasellus convallis pellentesque tortor sit amet suscipit.',
      discountMessage:
        'Discount appears here when you check in at event! Check In Code provided on-site.',
    };

    onClose(); // Close modal first
    navigation.navigate('BrandDetails', { brand: brandDetails });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header with close button */}
          <View style={styles.header}>
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{store.name}</Text>
              <Text style={styles.address}>{store.address.street}</Text>
              <Text style={styles.address}>
                {store.address.city}, {store.address.state} {store.address.zip}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <View style={styles.closeButtonCircle}>
                <Monicon name="mdi:close" size={16} color={Colors.brandPurpleDeep} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Products/Events List */}
          <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
            {store.events.map((event, index) => (
              <TouchableOpacity
                key={event.id}
                onPress={() => handleEventPress(event)}
                activeOpacity={0.7}
              >
                <View style={styles.eventItem}>
                  <View style={styles.iconContainer}>
                    <Monicon name="mdi:map-marker" size={28} color={Colors.brandPurpleDeep} />
                    <View style={styles.iconOverlay}>
                      <Monicon name="mdi:magnify" size={14} color={Colors.white} />
                    </View>
                  </View>
                  <View style={styles.eventDetails}>
                    <Text style={styles.productText}>{event.product}</Text>
                    <Text style={styles.dateText}>{event.date}</Text>
                    <Text style={styles.timeText}>{event.time}</Text>
                  </View>
                </View>
                {index < store.events.length - 1 && <View style={styles.separator} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
  },
  storeInfo: {
    flex: 1,
    marginRight: 12,
  },
  storeName: {
    fontSize: 20,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.black,
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.black,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.brandPurpleDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.brandPurpleDeep,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
  },
  iconOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.brandPurpleDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventDetails: {
    flex: 1,
  },
  productText: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.black,
    marginBottom: 6,
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.black,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.black,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginLeft: 72,
  },
});

export default StoreModal;

