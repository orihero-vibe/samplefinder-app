import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Colors } from '@/constants/Colors';
import { StoreEventCard, StoreEventData } from '@/components';
import { EventData } from './UpcomingEvents';
import { TabParamList } from '@/navigation/TabNavigator';
import { HomeStackParamList } from '@/navigation/HomeStack';
import Monicon from '@monicon/native';

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
  isLoadingEvents?: boolean;
  onClose: () => void;
}

const StoreModal: React.FC<StoreModalProps> = ({ visible, store, isLoadingEvents = false, onClose }) => {
  const navigation = useNavigation<StoreModalNavigationProp>();

  if (!store) return null;

  const handleEventPress = (event: StoreEventData) => {
    // Navigate to BrandDetailsScreen with eventId - it will fetch data from database
    onClose(); // Close modal first
    navigation.navigate('BrandDetails', { eventId: event.id });
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
              {store.address.street ? (
                <Text style={styles.address}>{store.address.street}</Text>
              ) : null}
              <Text style={styles.address}>
                {store.address.city}{store.address.city && store.address.state ? ', ' : ''}{store.address.state} {store.address.zip}
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
            {isLoadingEvents ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.brandPurpleDeep} />
                <Text style={styles.loadingText}>Loading events...</Text>
              </View>
            ) : store.events.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No events available</Text>
              </View>
            ) : (
              store.events.map((event, index) => {
                const storeEvent: StoreEventData = {
                  id: event.id,
                  name: event.name,
                  date: event.date,
                  time: event.time,
                  logoURL: event.logoURL,
                };
                return (
                  <React.Fragment key={event.id}>
                    <StoreEventCard
                      event={storeEvent}
                      onPress={handleEventPress}
                    />
                    {index < store.events.length - 1 && <View style={styles.separator} />}
                  </React.Fragment>
                );
              })
            )}
            <View style={styles.separator} />
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
    maxWidth: 500,
    maxHeight: '85%',
    overflow: 'hidden',
    paddingBottom: 20,
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
    paddingTop: 10,
    paddingBottom: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.black,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.black,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.brandPurpleDeep,
    opacity: 0.2,
    marginVertical: 10,
  },
});

export default StoreModal;

