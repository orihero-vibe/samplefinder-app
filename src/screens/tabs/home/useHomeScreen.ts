import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import ClusteredMapView from 'react-native-map-clustering';
import * as Location from 'expo-location';
import { fetchClients, fetchClientsWithFilters, ClientData, fetchEventsByClient, EventRow, fetchCategories, CategoryData, fetchEventsByLocation } from '@/lib/database';
import { MapMarkerData, FilterType, EventData, StoreData } from './components';

export const useHomeScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType | null>(null);
  const [radiusValues, setRadiusValues] = useState<string[]>([]);
  const [datesValues, setDatesValues] = useState<string[]>([]);
  const [categoriesValues, setCategoriesValues] = useState<string[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoadingUpcomingEvents, setIsLoadingUpcomingEvents] = useState(false);
  const [allClients, setAllClients] = useState<ClientData[]>([]);
  const [markers, setMarkers] = useState<MapMarkerData[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [bottomSheetIndex, setBottomSheetIndex] = useState(0);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const bottomSheetRef = useRef<any>(null);
  const mapRef = useRef<ClusteredMapView>(null);

  // Snap points for the bottom sheet - collapsed shows only filters, expanded shows events + filters
  const snapPoints = useMemo(() => [Platform.OS === 'ios' ? '10%' : '12%', Platform.OS === 'android' ? '90%' : '86%'], []);

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
        // Only show loading on initial load, not when filters change
        if (!isMapInitialized) {
          setIsLoadingClients(true);
        }

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
        setIsMapInitialized(true);
      }
    };

    // Debounce filter changes - wait 300ms after last change
    const timeoutId = setTimeout(() => {
      loadClients();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [radiusValues, datesValues, categoriesValues, categories, userLocation, isMapInitialized]);

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

  // Fetch upcoming events by location
  useEffect(() => {
    const loadEvents = async () => {
      // Only fetch if we have user location
      if (!userLocation) {
        console.log('[HomeScreen] Skipping events fetch - no user location');
        return;
      }

      try {
        setIsLoadingUpcomingEvents(true);
        console.log('[HomeScreen] Fetching events for location:', userLocation);

        const response = await fetchEventsByLocation(
          userLocation.latitude,
          userLocation.longitude,
          1, // page
          10 // pageSize
        );

        // Transform API response to EventData format
        if (!response.events) {
          console.warn('[HomeScreen] No events in response');
          setEvents([]);
          return;
        }

        const transformedEvents: EventData[] = response.events.map((event) => {
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

          // Convert distance from km to miles and format
          const distanceMiles = event.distance * 0.621371;
          const formattedDistance = `${distanceMiles.toFixed(1)} mi away`;

          // Use client name if available, otherwise use city
          const location = event.client?.name || event.city || 'Location';

          return {
            id: event.$id,
            name: event.products || event.name || 'Brand Product',
            location,
            distance: formattedDistance,
            date: new Date(event.date), // Use Date object for consistency
            time: formattedTime,
            logoURL: event.discountImageURL || event.client?.logoURL || null,
          };
        });

        setEvents(transformedEvents);
        console.log('[HomeScreen] Events loaded successfully:', transformedEvents.length);
      } catch (error) {
        console.error('[HomeScreen] Error loading events:', error);
        // On error, keep empty events array
        setEvents([]);
      } finally {
        setIsLoadingUpcomingEvents(false);
      }
    };

    loadEvents();
  }, [userLocation]);

  // Calculate initial region only once on mount - never recalculate to prevent map rerenders
  const initialRegion = useMemo(() => {
    // Default to Philadelphia city center
    return {
      latitude: 39.9526,
      longitude: -75.1652,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
  }, []); // Empty dependency array - only calculate once

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
      // Open modal immediately with loading state
      const storeData: StoreData = {
        id: marker.id,
        name: marker.title || 'Store Name',
        address: marker.address,
        events: [],
      };
      setSelectedStore(storeData);
      setIsModalVisible(true);
      setIsLoadingEvents(true);

      try {
        // Fetch events for this client
        const events = await fetchEventsByClient(marker.id);

        // Transform events to EventData format
        const transformedEvents: EventData[] = events.map((event: EventRow) => {
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
            name: event.products || event.name || 'Brand Product',
            location: marker.title || 'Store Name',
            distance: '0.0 mi away', // Could calculate actual distance if needed
            date: new Date(event.date), // Use Date object for consistency
            time: formattedTime,
            logoURL: event.discountImageURL || (typeof event.client === 'object' && event.client?.logoURL) || null,
          };
        });

        // Update store data with fetched events
        setSelectedStore({
          ...storeData,
          events: transformedEvents,
        });
      } catch (error) {
        console.error('[HomeScreen] Error fetching events:', error);
        // Keep modal open with empty events
      } finally {
        setIsLoadingEvents(false);
      }
    }
  };

  const handleClusterPress = useCallback((cluster: any) => {
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
  }, []);

  // Memoize renderCluster to prevent map rerenders
  const renderCluster = useCallback((cluster: any) => {
    const { id, geometry, properties } = cluster;
    const pointCount = properties?.point_count || 0;
    const coordinate = {
      latitude: geometry.coordinates[1],
      longitude: geometry.coordinates[0],
    };
    return {
      id,
      coordinate,
      pointCount,
    };
  }, [handleClusterPress]);

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedStore(null);
    setIsLoadingEvents(false);
  };

  const handleListPress = () => {
    bottomSheetRef.current?.snapToPosition(snapPoints[1]);
  };

  const handleMapPress = () => {
    bottomSheetRef.current?.snapToPosition(snapPoints[0]);
  };

  const hasAnyFilters = radiusValues.length > 0 || datesValues.length > 0 || categoriesValues.length > 0;

  return {
    selectedFilter,
    radiusValues,
    datesValues,
    categoriesValues,
    categories,
    isLoadingCategories,
    selectedStore,
    isModalVisible,
    isLoadingEvents,
    markers,
    isLoadingClients,
    userLocation,
    hasLocationPermission,
    bottomSheetIndex,
    bottomSheetRef,
    mapRef,
    snapPoints,
    initialRegion,
    events,
    hasAnyFilters,
    setBottomSheetIndex,
    handleFilterPress,
    handleCloseFilter,
    handleRadiusToggle,
    handleDatesToggle,
    handleCategoriesToggle,
    handleResetFilters,
    handleMarkerPress,
    handleClusterPress,
    renderCluster,
    handleCloseModal,
    handleListPress,
    handleMapPress,
  };
};

