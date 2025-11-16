import React, { useState, useMemo, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import MainHeader from '@/components/wrappers/MainHeader';
import { Colors } from '@/constants/Colors';
import {
  MapMarker,
  FilterButtons,
  UpcomingEvents,
  RadiusFilter,
  DatesFilter,
  CategoriesFilter,
  StoreModal,
  MapMarkerData,
  FilterType,
  EventData,
  StoreData,
} from './components';

const HomeScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType | null>(null);
  const [radiusValues, setRadiusValues] = useState<string[]>([]);
  const [datesValues, setDatesValues] = useState<string[]>([]);
  const [categoriesValues, setCategoriesValues] = useState<string[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Snap points for the bottom sheet - collapsed shows only filters, expanded shows events + filters
  const snapPoints = useMemo(() => ['10%', Platform.OS === 'android' ? '90%' : '86%'], []);

  // Sample events data
  const events: EventData[] = [
    {
      id: '1',
      product: 'Brand Product',
      location: 'XYZ Supermarket',
      distance: '0.2 mi away',
      date: 'Aug 1, 2025',
      time: '3 - 5 pm',
    },
    {
      id: '2',
      product: 'Brand Product',
      location: 'ABC Market',
      distance: '0.5 mi away',
      date: 'Aug 2, 2025',
      time: '10 - 12 pm',
    },
    {
      id: '3',
      product: 'Brand Product',
      location: 'XYZ Supermarket',
      distance: '0.3 mi away',
      date: 'Aug 3, 2025',
      time: '2 - 4 pm',
    },
    {
      id: '4',
      product: 'Brand Product',
      location: 'DEF Store',
      distance: '0.8 mi away',
      date: 'Aug 4, 2025',
      time: '11 - 1 pm',
    },
    {
      id: '5',
      product: 'Brand Product',
      location: 'XYZ Supermarket',
      distance: '0.4 mi away',
      date: 'Aug 5, 2025',
      time: '4 - 6 pm',
    },
  ];

  // Philadelphia city center coordinates
  const initialRegion = {
    latitude: 39.9526,
    longitude: -75.1652,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  // Sample markers based on the screenshot
  const markers: MapMarkerData[] = [
    {
      id: '1',
      latitude: 39.9515,
      longitude: -75.1635,
      title: 'Store Name',
      address: {
        street: '100 Main Street',
        city: 'Philadelphia',
        state: 'PA',
        zip: '19101',
      },
      events: [
        {
          id: '1',
          product: 'Brand Product',
          location: 'Store Name',
          distance: '0.2 mi away',
          date: 'Aug 1, 2025',
          time: '3 - 5 pm',
        },
        {
          id: '2',
          product: 'Brand Product',
          location: 'Store Name',
          distance: '0.2 mi away',
          date: 'Aug 1, 2025',
          time: '3 - 5 pm',
        },
        {
          id: '3',
          product: 'Brand Product',
          location: 'Store Name',
          distance: '0.2 mi away',
          date: 'Aug 1, 2025',
          time: '3 - 5 pm',
        },
        {
          id: '4',
          product: 'Brand Product',
          location: 'Store Name',
          distance: '0.2 mi away',
          date: 'Aug 1, 2025',
          time: '3 - 5 pm',
        },
      ],
    },
    {
      id: '2',
      latitude: 39.9495,
      longitude: -75.1605,
      title: 'Location 2',
      address: {
        street: '200 Market Street',
        city: 'Philadelphia',
        state: 'PA',
        zip: '19102',
      },
      events: [
        {
          id: '5',
          product: 'Brand Product',
          location: 'Location 2',
          distance: '0.5 mi away',
          date: 'Aug 2, 2025',
          time: '10 - 12 pm',
        },
      ],
    },
    {
      id: '3',
      latitude: 39.9535,
      longitude: -75.1585,
      title: 'Location 3',
      pinNumber: 4,
      address: {
        street: '300 Chestnut Street',
        city: 'Philadelphia',
        state: 'PA',
        zip: '19103',
      },
      events: [
        {
          id: '6',
          product: 'Brand Product',
          location: 'Location 3',
          distance: '0.3 mi away',
          date: 'Aug 3, 2025',
          time: '2 - 4 pm',
        },
      ],
    },
    {
      id: '4',
      latitude: 39.9505,
      longitude: -75.1625,
      title: 'Shopping',
      icon: 'mdi:cart',
      address: {
        street: '400 Walnut Street',
        city: 'Philadelphia',
        state: 'PA',
        zip: '19104',
      },
      events: [
        {
          id: '7',
          product: 'Brand Product',
          location: 'Shopping',
          distance: '0.4 mi away',
          date: 'Aug 4, 2025',
          time: '11 - 1 pm',
        },
      ],
    },
    {
      id: '5',
      latitude: 39.9515,
      longitude: -75.1595,
      title: 'Hotel',
      icon: 'mdi:bed',
      address: {
        street: '500 Spruce Street',
        city: 'Philadelphia',
        state: 'PA',
        zip: '19105',
      },
      events: [
        {
          id: '8',
          product: 'Brand Product',
          location: 'Hotel',
          distance: '0.6 mi away',
          date: 'Aug 5, 2025',
          time: '4 - 6 pm',
        },
      ],
    },
    {
      id: '6',
      latitude: 39.9525,
      longitude: -75.1615,
      title: 'Museum',
      icon: 'mdi:chess-rook',
      address: {
        street: '600 Pine Street',
        city: 'Philadelphia',
        state: 'PA',
        zip: '19106',
      },
      events: [
        {
          id: '9',
          product: 'Brand Product',
          location: 'Museum',
          distance: '0.7 mi away',
          date: 'Aug 6, 2025',
          time: '1 - 3 pm',
        },
      ],
    },
    {
      id: '7',
      latitude: 39.9505,
      longitude: -75.1605,
      title: 'Museum 2',
      icon: 'mdi:chess-rook',
      address: {
        street: '700 Locust Street',
        city: 'Philadelphia',
        state: 'PA',
        zip: '19107',
      },
      events: [
        {
          id: '10',
          product: 'Brand Product',
          location: 'Museum 2',
          distance: '0.8 mi away',
          date: 'Aug 7, 2025',
          time: '2 - 4 pm',
        },
      ],
    },
    {
      id: '8',
      latitude: 39.9495,
      longitude: -75.1615,
      title: 'Pet Store',
      icon: 'mdi:cat',
      address: {
        street: '800 Sansom Street',
        city: 'Philadelphia',
        state: 'PA',
        zip: '19108',
      },
      events: [
        {
          id: '11',
          product: 'Brand Product',
          location: 'Pet Store',
          distance: '0.9 mi away',
          date: 'Aug 8, 2025',
          time: '10 - 12 pm',
        },
      ],
    },
    {
      id: '9',
      latitude: 39.9485,
      longitude: -75.1605,
      title: 'Pet Store 2',
      icon: 'mdi:cat',
      address: {
        street: '900 Arch Street',
        city: 'Philadelphia',
        state: 'PA',
        zip: '19109',
      },
      events: [
        {
          id: '12',
          product: 'Brand Product',
          location: 'Pet Store 2',
          distance: '1.0 mi away',
          date: 'Aug 9, 2025',
          time: '3 - 5 pm',
        },
      ],
    },
  ];

  const handleFilterPress = (filter: FilterType) => {
    if (filter === 'reset') {
      handleResetFilters();
    } else {
      // Toggle filter modal - if same filter is pressed, close it
      setSelectedFilter(selectedFilter === filter ? null : filter);
    }
  };

  const handleCloseFilter = () => {
    setSelectedFilter(null);
  };

  const handleRadiusToggle = (value: string) => {
    setRadiusValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleDatesToggle = (value: string) => {
    setDatesValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleCategoriesToggle = (value: string) => {
    setCategoriesValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleResetFilters = () => {
    setRadiusValues([]);
    setDatesValues([]);
    setCategoriesValues([]);
    setSelectedFilter(null);
  };

  const handleMarkerPress = (marker: MapMarkerData) => {
    if (marker.address && marker.events) {
      const storeData: StoreData = {
        id: marker.id,
        name: marker.title || 'Store Name',
        address: marker.address,
        events: marker.events,
      };
      setSelectedStore(storeData);
      setIsModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedStore(null);
  };

  const hasAnyFilters = radiusValues.length > 0 || datesValues.length > 0 || categoriesValues.length > 0;

  const renderFilterModal = () => {
    switch (selectedFilter) {
      case 'radius':
        return (
          <RadiusFilter
            selectedValues={radiusValues}
            onToggle={handleRadiusToggle}
            onClose={handleCloseFilter}
          />
        );
      case 'dates':
        return (
          <DatesFilter
            selectedValues={datesValues}
            onToggle={handleDatesToggle}
            onClose={handleCloseFilter}
          />
        );
      case 'categories':
        return (
          <CategoriesFilter
            selectedValues={categoriesValues}
            onToggle={handleCategoriesToggle}
            onClose={handleCloseFilter}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container]}>
      <MainHeader />

      <View style={styles.mapContainer}>
        <MapView
          {...(Platform.OS === 'android' && { provider: PROVIDER_GOOGLE })}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
          toolbarEnabled={false}
        >
          {markers.map((marker) => (
            <MapMarker key={marker.id} marker={marker} onPress={handleMarkerPress} />
          ))}
        </MapView>
      </View>

      <StoreModal visible={isModalVisible} store={selectedStore} onClose={handleCloseModal} />

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <View style={styles.bottomSheetContent}>
          <View style={styles.filtersContainer}>
            <FilterButtons
              selectedFilter={selectedFilter}
              onFilterPress={handleFilterPress}
              radiusCount={radiusValues.length}
              datesCount={datesValues.length}
              categoriesCount={categoriesValues.length}
              hasAnyFilters={hasAnyFilters}
            />
          </View>
          {selectedFilter && (
            <View style={styles.filterModalContainer}>
              {renderFilterModal()}
            </View>
          )}
          <BottomSheetScrollView
            contentContainerStyle={styles.bottomSheetScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <UpcomingEvents events={events} />
          </BottomSheetScrollView>
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brandPurpleDeep,
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 0,
  },
  map: {
    flex: 1,
    width: '100%',
  },
  bottomSheetBackground: {
    backgroundColor: Colors.white,
  },
  handleIndicator: {
    backgroundColor: '#D0D0D0',
    width: 40,
    height: 4,
  },
  bottomSheetContent: {
    flex: 1,
  },
  bottomSheetScrollContent: {
    paddingBottom: 0,
  },
  filtersContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    zIndex: 2,
  },
  filterModalContainer: {
    position: 'absolute',
    top: 70, // Position below filter buttons (approximate height)
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default HomeScreen;

