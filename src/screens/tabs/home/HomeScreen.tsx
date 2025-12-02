import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, ActivityIndicator, Alert } from 'react-native';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import ClusteredMapView from 'react-native-map-clustering';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as Location from 'expo-location';
import MainHeader from '@/components/wrappers/MainHeader';
import { Colors } from '@/constants/Colors';
import { fetchClients, fetchClientsWithFilters, ClientData, fetchEventsByClient, EventRow, fetchCategories, CategoryData } from '@/lib/database';
import {
  MapMarker,
  ClusterMarker,
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
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [allClients, setAllClients] = useState<ClientData[]>([]);
  const [markers, setMarkers] = useState<MapMarkerData[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<ClusteredMapView>(null);

  // Snap points for the bottom sheet - collapsed shows only filters, expanded shows events + filters
  const snapPoints = useMemo(() => [Platform.OS==='ios' ? '10%' : '12%', Platform.OS === 'android' ? '90%' : '86%'], []);

  // Helper function to convert date filter values to date ranges
  const convertDateFilterToRange = (dateValue: string): { start: string; end: string } | null => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateValue) {
      case 'today':
        return {
          start: new Date(today.getTime()).toISOString(),
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString(),
        };
      case '3days':
        return {
          start: new Date(today.getTime()).toISOString(),
          end: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        };
      case '5days':
        return {
          start: new Date(today.getTime()).toISOString(),
          end: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        };
      case 'week':
        return {
          start: new Date(today.getTime()).toISOString(),
          end: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };
      case 'all':
        return null; // No date filter
      default:
        return null;
    }
  };

  // Get user's current location
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          console.log('[HomeScreen] Location permission denied');
          setHasLocationPermission(false);
          Alert.alert(
            'Location Permission',
            'Please enable location permissions in your device settings to see your location on the map.',
            [{ text: 'OK' }]
          );
          return;
        }

        setHasLocationPermission(true);

        // Get current position
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const userCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setUserLocation(userCoords);
        console.log('[HomeScreen] User location:', userCoords);

        // Navigate map to user's location after a short delay to ensure map is ready
        setTimeout(() => {
          if (mapRef.current && userCoords) {
            (mapRef.current as any).animateToRegion(
              {
                ...userCoords,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              },
              1000
            );
          }
        }, 500);
      } catch (error) {
        console.error('[HomeScreen] Error getting location:', error);
        setHasLocationPermission(false);
      }
    };

    getCurrentLocation();
  }, []);

  // Fetch clients from Appwrite database with filters
  useEffect(() => {
    const loadClients = async () => {
      try {
        setIsLoadingClients(true);
        
        // Check if any filters are active
        const hasFilters = radiusValues.length > 0 || datesValues.length > 0 || categoriesValues.length > 0;
        
        if (hasFilters) {
          // Build filter parameters
          const filters: any = {};
          
          // Radius filter - use the maximum selected radius
          if (radiusValues.length > 0 && userLocation) {
            const maxRadius = Math.max(...radiusValues.map(v => parseFloat(v)));
            filters.radiusMiles = maxRadius;
            filters.userLocation = userLocation;
          }
          
          // Date filter - use the first selected date (or combine if multiple)
          if (datesValues.length > 0) {
            // If 'all' is selected, don't apply date filter
            if (!datesValues.includes('all')) {
              // Use the first date filter (or could combine ranges)
              const dateRange = convertDateFilterToRange(datesValues[0]);
              if (dateRange) {
                filters.dateRange = dateRange;
              }
            }
          }
          
          // Category filter
          if (categoriesValues.length > 0 && categories.length > 0) {
            const selectedCategoryIds = categories
              .filter((cat) => {
                const catValue = cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-');
                return categoriesValues.includes(catValue);
              })
              .map((cat) => cat.$id);
            
            if (selectedCategoryIds.length > 0) {
              filters.categoryIds = selectedCategoryIds;
            }
          }
          
          console.log('[HomeScreen] Fetching clients with filters:', filters);
          const clients = await fetchClientsWithFilters(filters);
          setAllClients(clients);
          console.log('[HomeScreen] Loaded filtered clients:', clients.length);
        } else {
          // No filters - fetch all clients
          const clients = await fetchClients();
          setAllClients(clients);
          console.log('[HomeScreen] Loaded all clients:', clients.length);
        }
      } catch (error) {
        console.error('[HomeScreen] Error loading clients:', error);
        // On error, keep empty clients array
        setAllClients([]);
      } finally {
        setIsLoadingClients(false);
      }
    };

    // Debounce filter changes - wait 300ms after last change
    const timeoutId = setTimeout(() => {
      loadClients();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [radiusValues, datesValues, categoriesValues, categories, userLocation]);

  // Transform clients to markers - filtering is now done server-side
  useEffect(() => {
    // Transform clients to MapMarkerData format
    const clientMarkers: MapMarkerData[] = allClients
      .filter((client) => {
        // Only include clients with valid location coordinates
        return (
          client.location &&
          Array.isArray(client.location) &&
          client.location.length >= 2 &&
          !isNaN(client.location[0]) &&
          !isNaN(client.location[1]) &&
          client.location[0] !== 0 &&
          client.location[1] !== 0
        );
      })
      .map((client) => ({
        id: client.$id,
        latitude: client.location![1], // location[1] is latitude
        longitude: client.location![0], // location[0] is longitude
        title: client.name || client.title || 'Client',
        icon: 'oi:map-marker', // Use the specified icon
        address: {
          street: client.street || client.address || '',
          city: client.city || '',
          state: client.state || '',
          zip: client.zip || client.zipCode || '',
        },
        events: [], // Events will be fetched when marker is pressed
      }));

    setMarkers(clientMarkers);
    console.log('[HomeScreen] Transformed markers:', clientMarkers.length, 'from', allClients.length, 'clients');
  }, [allClients]);

  // Fetch categories from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
        console.log('[HomeScreen] Loaded categories:', fetchedCategories.length);
      } catch (error) {
        console.error('[HomeScreen] Error loading categories:', error);
        // On error, keep empty categories array
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Events will be fetched from database or passed as props in the future
  const events: EventData[] = [];

  // Calculate initial region based on markers, or use default Philadelphia coordinates
  const initialRegion = useMemo(() => {
    if (markers.length === 0) {
      // Default to Philadelphia city center if no markers
      return {
        latitude: 39.9526,
        longitude: -75.1652,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
    }

    // Calculate bounds from markers
    const latitudes = markers.map((m) => m.latitude).filter((lat) => !isNaN(lat));
    const longitudes = markers.map((m) => m.longitude).filter((lng) => !isNaN(lng));

    if (latitudes.length === 0 || longitudes.length === 0) {
      return {
        latitude: 39.9526,
        longitude: -75.1652,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
    }

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const latDelta = (maxLat - minLat) * 1.5 || 0.02; // Add 50% padding
    const lngDelta = (maxLng - minLng) * 1.5 || 0.02;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.02),
      longitudeDelta: Math.max(lngDelta, 0.02),
    };
  }, [markers]);

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

  const handleMarkerPress = async (marker: MapMarkerData) => {
    if (marker.address) {
      try {
        // Fetch events for this client
        const events = await fetchEventsByClient(marker.id);
        
        // Transform events to EventData format
        const transformedEvents: EventData[] = events.map((event: EventRow) => {
          // Format date (e.g., "Aug 1, 2025")
          const eventDate = new Date(event.date);
          const formattedDate = eventDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          
          // Format time range (e.g., "3 - 5 pm")
          const startTime = new Date(event.startTime);
          const endTime = new Date(event.endTime);
          const startHour = startTime.getHours();
          const endHour = endTime.getHours();
          const startMin = startTime.getMinutes();
          const endMin = endTime.getMinutes();
          
          const formatTime = (hour: number, min: number) => {
            const period = hour >= 12 ? 'pm' : 'am';
            const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
            return min > 0 ? `${displayHour}:${min.toString().padStart(2, '0')} ${period}` : `${displayHour} ${period}`;
          };
          
          const formattedTime = `${formatTime(startHour, startMin)} - ${formatTime(endHour, endMin)}`;
          
          return {
            id: event.$id,
            product: event.products || event.name || 'Brand Product',
            location: marker.title || 'Store Name',
            distance: '0.0 mi away', // Could calculate actual distance if needed
            date: formattedDate,
            time: formattedTime,
          };
        });
        
        const storeData: StoreData = {
          id: marker.id,
          name: marker.title || 'Store Name',
          address: marker.address,
          events: transformedEvents,
        };
        setSelectedStore(storeData);
        setIsModalVisible(true);
      } catch (error) {
        console.error('[HomeScreen] Error fetching events:', error);
        // Still show modal with empty events
        const storeData: StoreData = {
          id: marker.id,
          name: marker.title || 'Store Name',
          address: marker.address,
          events: [],
        };
        setSelectedStore(storeData);
        setIsModalVisible(true);
      }
    }
  };

  const handleClusterPress = (cluster: any) => {
    const { geometry } = cluster;
    const coordinate = {
      latitude: geometry.coordinates[1],
      longitude: geometry.coordinates[0],
    };
    // Zoom in on cluster press
    if (mapRef.current) {
      (mapRef.current as any).animateToRegion(
        {
          ...coordinate,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedStore(null);
  };

  const hasAnyFilters = radiusValues.length > 0 || datesValues.length > 0 || categoriesValues.length > 0;

  const renderFilterModal = () => {
    const isVisible = selectedFilter !== null && selectedFilter !== 'reset';
    
    switch (selectedFilter) {
      case 'radius':
        return (
          <RadiusFilter
            visible={isVisible}
            selectedValues={radiusValues}
            onToggle={handleRadiusToggle}
            onClose={handleCloseFilter}
          />
        );
      case 'dates':
        return (
          <DatesFilter
            visible={isVisible}
            selectedValues={datesValues}
            onToggle={handleDatesToggle}
            onClose={handleCloseFilter}
          />
        );
      case 'categories':
        return (
          <CategoriesFilter
            visible={isVisible}
            selectedValues={categoriesValues}
            onToggle={handleCategoriesToggle}
            onClose={handleCloseFilter}
            categories={categories}
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
        {isLoadingClients ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.brandPurpleDeep} />
          </View>
        ) : (
          <ClusteredMapView
            ref={mapRef}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            style={styles.map}
            initialRegion={initialRegion}
            showsUserLocation={hasLocationPermission}
            showsMyLocationButton={false}
            userLocationPriority="high"
            userLocationUpdateInterval={5000}
            toolbarEnabled={false}
            clusterColor={Colors.brandPurpleDeep}
            clusterTextColor={Colors.white}
            radius={100}
            minZoom={10}
            maxZoom={30}
            extent={512}
            nodeSize={64}
            renderCluster={(cluster) => {
              const { id, geometry, properties } = cluster;
              const pointCount = properties?.point_count || 0;
              const coordinate = {
                latitude: geometry.coordinates[1],
                longitude: geometry.coordinates[0],
              };
              return (
                <ClusterMarker
                  key={id}
                  coordinate={coordinate}
                  pointCount={pointCount}
                  onPress={() => handleClusterPress(cluster)}
                />
              );
            }}
          >
            {markers.map((marker) => (
              <MapMarker key={marker.id} marker={marker} onPress={handleMarkerPress} />
            ))}
          </ClusteredMapView>
        )}
      </View>

      <StoreModal visible={isModalVisible} store={selectedStore} onClose={handleCloseModal} />

      {renderFilterModal()}

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        enableContentPanningGesture={true}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.brandPurpleDeep,
  },
});

export default HomeScreen;

