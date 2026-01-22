import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import ClusteredMapView from 'react-native-map-clustering';
import * as Location from 'expo-location';
import { fetchClients, fetchClientsWithFilters, ClientData, fetchEventsByClient, EventRow, fetchCategories, CategoryData, fetchEventsByLocation, getUserProfile } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { MapMarkerData, FilterType, EventData, StoreData } from './components';
import { formatEventDistance } from '@/utils/formatters';
import { geocodeZipCode, isValidZipCode } from '@/utils/geocoding';

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
  const [showZipCodeModal, setShowZipCodeModal] = useState(false);
  const [isGeocodingZip, setIsGeocodingZip] = useState(false);
  const [zipCodeError, setZipCodeError] = useState<string | null>(null);
  const [bottomSheetIndex, setBottomSheetIndex] = useState(1);
  const [activeView, setActiveView] = useState<'map' | 'list'>('list');
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [userIsAdult, setUserIsAdult] = useState<boolean>(false);
  const bottomSheetRef = useRef<any>(null);
  const mapRef = useRef<ClusteredMapView>(null);

  // Snap points for the bottom sheet - collapsed shows only filters, expanded shows events + filters
  const snapPoints = useMemo(() => ['12%', '86%'], []);

  // Ensure bottom sheet opens at index 1 (expanded) on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (bottomSheetRef.current) {
        bottomSheetRef.current.snapToIndex(1);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

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

  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setHasLocationPermission(false);
          // Show ZIP code modal instead of just an alert
          setShowZipCodeModal(true);
          return;
        }

        setHasLocationPermission(true);

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000,
          distanceInterval: 10,
        });

        const userCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setUserLocation(userCoords);

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
        console.error('Error getting location:', error);
        setHasLocationPermission(false);
        // Show ZIP code modal on error as well
        setShowZipCodeModal(true);
      }
    };

    getCurrentLocation();
  }, []);

  const handleZipCodeChange = () => {
    // Clear error when user starts typing
    if (zipCodeError) {
      setZipCodeError(null);
    }
  };

  const handleZipCodeSubmit = async (zipCode: string) => {
    if (!isValidZipCode(zipCode)) {
      setZipCodeError('Please enter a valid ZIP code (5 digits)');
      return;
    }

    setIsGeocodingZip(true);
    setZipCodeError(null);

    try {
      const result = await geocodeZipCode(zipCode);
      
      const userCoords = {
        latitude: result.latitude,
        longitude: result.longitude,
      };

      setUserLocation(userCoords);
      setHasLocationPermission(false); // Still false since we don't have actual permission
      setShowZipCodeModal(false);

      // Animate map to the ZIP code location
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
    } catch (error: any) {
      console.error('Error geocoding ZIP code:', error);
      setZipCodeError(error.message || 'Failed to find location. Please try again.');
    } finally {
      setIsGeocodingZip(false);
    }
  };

  useEffect(() => {
    const loadClients = async () => {
      try {
        if (!isMapInitialized) {
          setIsLoadingClients(true);
        }

        const hasFilters = radiusValues.length > 0 || datesValues.length > 0 || categoriesValues.length > 0;

        if (hasFilters) {
          const filters: any = {};

          if (radiusValues.length > 0 && userLocation) {
            const maxRadius = Math.max(...radiusValues.map(v => parseFloat(v)));
            filters.radiusMiles = maxRadius;
            filters.userLocation = userLocation;
          }

          if (datesValues.length > 0) {
            // Convert all selected date filters to ranges
            const dateRanges = datesValues
              .map(value => convertDateFilterToRange(value))
              .filter((range): range is { start: string; end: string } => range !== null);
            
            if (dateRanges.length > 0) {
              // Find the earliest start and latest end to create a combined range
              const allStarts = dateRanges.map(r => new Date(r.start).getTime());
              const allEnds = dateRanges.map(r => new Date(r.end).getTime());
              filters.dateRange = {
                start: new Date(Math.min(...allStarts)).toISOString(),
                end: new Date(Math.max(...allEnds)).toISOString(),
              };
            }
          }

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

          const clients = await fetchClientsWithFilters(filters);
          setAllClients(clients);
        } else {
          const clients = await fetchClients();
          setAllClients(clients);
        }
      } catch (error) {
        console.error('Error loading clients:', error);
        setAllClients([]);
      } finally {
        setIsLoadingClients(false);
        setIsMapInitialized(true);
      }
    };

    const timeoutId = setTimeout(() => {
      loadClients();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [radiusValues, datesValues, categoriesValues, categories, userLocation, isMapInitialized]);

  useEffect(() => {
    const clientMarkers: MapMarkerData[] = allClients
      .filter((client) => {
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
        latitude: client.location![1],
        longitude: client.location![0],
        title: client.name || client.title || 'Client',
        icon: 'oi:map-marker',
        address: {
          street: client.street || client.address || '',
          city: client.city || '',
          state: client.state || '',
          zip: client.zip || client.zipCode || '',
        },
        events: [],
      }));

    setMarkers(clientMarkers);
  }, [allClients]);

  // Fetch user profile to check isAdult field
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const user = await getCurrentUser();
        console.log('[HomeScreen] Current user:', user?.$id);
        if (user?.$id) {
          const profile = await getUserProfile(user.$id);
          console.log('[HomeScreen] User profile fetched:', {
            profileId: profile?.$id,
            isAdult: profile?.isAdult,
            username: profile?.username
          });
          setUserIsAdult(profile?.isAdult || false);
        } else {
          console.log('[HomeScreen] No current user found');
          setUserIsAdult(false);
        }
      } catch (error) {
        console.error('[HomeScreen] Error loading user profile:', error);
        setUserIsAdult(false);
      }
    };

    loadUserProfile();
  }, []);

  // Load categories based on user's isAdult status
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        console.log('[HomeScreen] Loading categories with userIsAdult:', userIsAdult);
        // Use user's isAdult field to determine if adult categories should be shown
        const fetchedCategories = await fetchCategories(userIsAdult);
        console.log('[HomeScreen] Categories fetched:', {
          count: fetchedCategories.length,
          categories: fetchedCategories.map(c => ({ name: c.name, isAdult: c.isAdult }))
        });
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('[HomeScreen] Error loading categories:', error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, [userIsAdult]);

  useEffect(() => {
    const loadEvents = async () => {
      if (!userLocation) {
        return;
      }

      // Wait for clients to finish loading if filters are active
      const hasCategoryFilter = categoriesValues.length > 0;
      const hasRadiusFilter = radiusValues.length > 0;
      const hasActiveFilters = hasCategoryFilter || hasRadiusFilter;
      
      if (hasActiveFilters && isLoadingClients) {
        return;
      }

      try {
        setIsLoadingUpcomingEvents(true);

        const response = await fetchEventsByLocation(
          userLocation.latitude,
          userLocation.longitude,
          1,
          10
        );

        if (!response.events) {
          setEvents([]);
          return;
        }

        let filteredEvents = response.events;

        // Apply date filter to events - event must fall within ANY of the selected date ranges
        if (datesValues.length > 0) {
          const dateRanges = datesValues
            .map(value => convertDateFilterToRange(value))
            .filter((range): range is { start: string; end: string } => range !== null);
          
          if (dateRanges.length > 0) {
            filteredEvents = filteredEvents.filter((event) => {
              const eventDate = new Date(event.date);
              // Event passes filter if it falls within ANY of the selected date ranges
              return dateRanges.some(dateRange => {
                const startDate = new Date(dateRange.start);
                const endDate = new Date(dateRange.end);
                return eventDate >= startDate && eventDate <= endDate;
              });
            });
          }
        }

        // Apply category and radius filters by only showing events from filtered clients
        // If any filters are active, only show events from clients that passed the filters
        if (hasActiveFilters) {
          if (allClients.length === 0) {
            // If filters are active but no clients match, show no events
            filteredEvents = [];
          } else {
            // Only show events from filtered clients
            const filteredClientIds = new Set(allClients.map(client => client.$id));
            filteredEvents = filteredEvents.filter((event) => {
              const clientId = event.client?.$id;
              return clientId && filteredClientIds.has(clientId);
            });
          }
        }

        const transformedEvents: EventData[] = filteredEvents.map((event) => {
          const eventDate = new Date(event.date);
          const formattedDate = eventDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });

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

          // Backend returns distance in meters, not kilometers
          const formattedDistance = formatEventDistance({ distanceMeters: event.distance });

          const location = event.client?.name || event.city || 'Location';
          // Brand name comes from event.name (event title/brand)
          const brandName = event.name || 'Brand';
          // Product name comes from event.products (what's being sampled)
          const productName = event.products || event.name || 'Product';

          return {
            id: event.$id,
            name: productName,
            brandName: brandName,
            location,
            distance: formattedDistance,
            date: new Date(event.date),
            time: formattedTime,
            logoURL: event.discountImageURL || event.client?.logoURL || null,
          };
        });

        setEvents(transformedEvents);
      } catch (error) {
        console.error('Error loading events:', error);
        setEvents([]);
      } finally {
        setIsLoadingUpcomingEvents(false);
      }
    };

    loadEvents();
  }, [userLocation, datesValues, categoriesValues, radiusValues, allClients, isLoadingClients]);

  const initialRegion = useMemo(() => {
    return {
      latitude: 39.9526,
      longitude: -75.1652,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
  }, []);

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
    // Single-select behavior: only one radius can be selected at a time
    setRadiusValues((prev) =>
      prev.includes(value) ? [] : [value]
    );
    // Keep modal open for user to review selection
  };

  const handleDatesToggle = (value: string) => {
    // Single-select behavior: only one date range can be selected at a time
    // "View All" means no filter, so set to empty array
    if (value === 'all') {
      setDatesValues([]);
    } else {
      setDatesValues((prev) =>
        prev.includes(value) ? [] : [value]
      );
    }
    // Keep modal open for user to review selection
  };

  const handleCategoriesToggle = (value: string) => {
    setCategoriesValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
    // Keep modal open for multi-select
  };

  const handleResetFilters = () => {
    setRadiusValues([]);
    setDatesValues([]);
    setCategoriesValues([]);
    setSelectedFilter(null);
  };

  const handleMarkerPress = async (marker: MapMarkerData) => {
    if (marker.address) {
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
        const events = await fetchEventsByClient(marker.id);

        const transformedEvents: EventData[] = events.map((event: EventRow) => {
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
          // Brand name comes from event.name (event title/brand)
          const brandName = event.name || 'Brand';
          // Product name comes from event.products (what's being sampled)
          const productName = event.products || event.name || 'Product';

          return {
            id: event.$id,
            name: productName,
            brandName: brandName,
            location: marker.title || 'Store Name',
            distance: '0.0 mi away',
            date: new Date(event.date),
            time: formattedTime,
            logoURL: event.discountImageURL || (typeof event.client === 'object' && event.client?.logoURL) || null,
          };
        });

        setSelectedStore({
          ...storeData,
          events: transformedEvents,
        });
      } catch (error) {
        console.error('Error fetching events:', error);
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
    setActiveView('list');
    bottomSheetRef.current?.snapToIndex(1);
  };

  const handleMapPress = () => {
    setActiveView('map');
    bottomSheetRef.current?.snapToIndex(0);
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
    showZipCodeModal,
    isGeocodingZip,
    zipCodeError,
    bottomSheetIndex,
    bottomSheetRef,
    mapRef,
    snapPoints,
    initialRegion,
    events,
    hasAnyFilters,
    activeView,
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
    handleZipCodeSubmit,
    handleZipCodeChange,
  };
};

