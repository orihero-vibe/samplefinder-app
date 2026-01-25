import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import ClusteredMapView from 'react-native-map-clustering';
import * as Location from 'expo-location';
import { fetchClients, fetchClientsWithFilters, ClientData, EventRow, fetchCategories, CategoryData, fetchAllUpcomingEvents, getUserProfile } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { MapMarkerData, FilterType, EventData, StoreData } from './components';
import { formatEventDistance } from '@/utils/formatters';
import { geocodeZipCode, isValidZipCode } from '@/utils/geocoding';
import { filterEventsByAdultCategories } from '@/utils/brandUtils';

export const useHomeScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType | null>(null);
  const [radiusValues, setRadiusValues] = useState<string[]>([]);
  const [datesValues, setDatesValues] = useState<string[]>([]);
  const [categoriesValues, setCategoriesValues] = useState<string[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]); // Categories for UI filter (filtered by user's adult status)
  const [allCategoriesForFilter, setAllCategoriesForFilter] = useState<CategoryData[] | null>(null); // null = not loaded yet, All categories for adult event filtering
  const [isLoadingCategories, setIsLoadingCategories] = useState(true); // Start as true since we load on mount
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoadingUpcomingEvents, setIsLoadingUpcomingEvents] = useState(false);
  const [isRefreshingEvents, setIsRefreshingEvents] = useState(false);
  const [refreshEventsTrigger, setRefreshEventsTrigger] = useState(0);
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
        // Calculate next week: start from next Monday (or the Monday after today)
        const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const daysUntilNextMonday = currentDay === 0 ? 1 : 8 - currentDay;
        const nextMonday = new Date(today.getTime() + daysUntilNextMonday * 24 * 60 * 60 * 1000);
        const nextSunday = new Date(nextMonday.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
        
        return {
          start: nextMonday.toISOString(),
          end: nextSunday.toISOString(),
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

  // State for all upcoming events (for map markers)
  const [allUpcomingEvents, setAllUpcomingEvents] = useState<EventRow[]>([]);

  // Fetch all upcoming events for map markers (filtered by adult categories)
  useEffect(() => {
    // Only load events after all categories are loaded
    if (allCategoriesForFilter === null) {
      return;
    }

    const loadUpcomingEventsForMap = async () => {
      try {
        const eventRows = await fetchAllUpcomingEvents();
        // Filter events based on user's adult status and category adult flags
        const filteredByAdult = filterEventsByAdultCategories(eventRows, allCategoriesForFilter, userIsAdult);
        console.log('[HomeScreen] Events for map filtered:', {
          before: eventRows.length,
          after: filteredByAdult.length,
          userIsAdult
        });
        setAllUpcomingEvents(filteredByAdult);
      } catch (error) {
        console.error('Error loading events for map:', error);
        setAllUpcomingEvents([]);
      }
    };

    loadUpcomingEventsForMap();
  }, [allCategoriesForFilter, userIsAdult]);

  // Create map markers from events (using event.location) - grouped by location
  useEffect(() => {
    // Filter events with valid location
    const eventsWithLocation = allUpcomingEvents.filter((event) => {
      return (
        event.location &&
        Array.isArray(event.location) &&
        event.location.length >= 2 &&
        !isNaN(event.location[0]) &&
        !isNaN(event.location[1]) &&
        event.location[0] !== 0 &&
        event.location[1] !== 0
      );
    });

    // Group events by location (using a key based on rounded coordinates)
    const locationGroups = new Map<string, EventRow[]>();
    
    eventsWithLocation.forEach((event) => {
      // Round to 4 decimal places (~11m precision) to group nearby events
      const lat = event.location![1].toFixed(4);
      const lng = event.location![0].toFixed(4);
      const locationKey = `${lat},${lng}`;
      
      if (!locationGroups.has(locationKey)) {
        locationGroups.set(locationKey, []);
      }
      locationGroups.get(locationKey)!.push(event);
    });

    // Create one marker per unique location
    const groupedMarkers: MapMarkerData[] = Array.from(locationGroups.entries()).map(([locationKey, groupEvents]) => {
      const firstEvent = groupEvents[0];
      const clientId = typeof firstEvent.client === 'string' ? firstEvent.client : firstEvent.client?.$id;
      const clientObj = clientId ? allClients.find(c => c.$id === clientId) : (typeof firstEvent.client === 'object' ? firstEvent.client : null);
      
      // Use client name as the store name for the marker
      const storeName = clientObj?.name || clientObj?.title || firstEvent.city || 'Store';
      
      return {
        id: locationKey, // Use location key as unique ID for the marker
        latitude: firstEvent.location![1],
        longitude: firstEvent.location![0],
        title: storeName,
        icon: 'oi:map-marker',
        address: {
          street: firstEvent.address || '',
          city: firstEvent.city || '',
          state: firstEvent.state || '',
          zip: firstEvent.zipCode || '',
        },
        events: groupEvents.map(e => e.$id), // Store event IDs for lookup
      };
    });

    setMarkers(groupedMarkers);
  }, [allUpcomingEvents, allClients]);

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
        
        // Load ALL categories for adult event filtering (pass true to include adult categories)
        const allCategories = await fetchCategories(true);
        setAllCategoriesForFilter(allCategories);
        console.log('[HomeScreen] All categories for filter:', {
          count: allCategories.length,
          adultCategories: allCategories.filter(c => c.isAdult).map(c => c.name)
        });
        
        // Filter categories for UI based on user's adult status
        const uiCategories = userIsAdult 
          ? allCategories 
          : allCategories.filter(c => !c.isAdult);
        
        console.log('[HomeScreen] Categories for UI:', {
          count: uiCategories.length,
          categories: uiCategories.map(c => ({ name: c.name, isAdult: c.isAdult }))
        });
        setCategories(uiCategories);
      } catch (error) {
        console.error('[HomeScreen] Error loading categories:', error);
        setCategories([]);
        setAllCategoriesForFilter([]);
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

      // Wait until categories are loaded for adult filtering
      if (allCategoriesForFilter === null) {
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
        if (!isRefreshingEvents) {
          setIsLoadingUpcomingEvents(true);
        }

        // Fetch all upcoming events and clients in parallel
        const [eventRows, allClientsData] = await Promise.all([
          fetchAllUpcomingEvents(),
          fetchClients(),
        ]);

        if (!eventRows || eventRows.length === 0) {
          setEvents([]);
          return;
        }

        // Filter events based on user's adult status and category adult flags
        const eventsFilteredByAdult = filterEventsByAdultCategories(eventRows, allCategoriesForFilter, userIsAdult);
        console.log('[HomeScreen] Events list filtered by adult:', {
          before: eventRows.length,
          after: eventsFilteredByAdult.length,
          userIsAdult,
          adultCategoriesCount: allCategoriesForFilter.filter(c => c.isAdult).length
        });

        // Create a map for quick client lookup by ID
        const clientsMap = new Map(allClientsData.map(client => [client.$id, client]));
        
        // Debug: Log client data to check if logoURL exists
        console.log('[HomeScreen] Loaded clients:', allClientsData.length);
        if (allClientsData.length > 0) {
          console.log('[HomeScreen] Sample client data:', {
            id: allClientsData[0].$id,
            name: allClientsData[0].name,
            hasLogoURL: !!allClientsData[0].logoURL,
            logoURL: allClientsData[0].logoURL,
          });
        }

        let filteredEvents = eventsFilteredByAdult;

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

        // Apply radius filter using event.location
        if (hasRadiusFilter && radiusValues.length > 0) {
          const maxRadiusMiles = Math.max(...radiusValues.map(v => parseFloat(v)));
          const maxRadiusMeters = maxRadiusMiles * 1609.34;
          
          filteredEvents = filteredEvents.filter((event) => {
            if (!event.location) return false;
            
            // Calculate distance from user to event location
            const distance = calculateDistanceMeters(
              userLocation.latitude,
              userLocation.longitude,
              event.location[1], // latitude
              event.location[0]  // longitude
            );
            
            return distance <= maxRadiusMeters;
          });
        }

        // Apply category filter
        if (hasCategoryFilter && categories.length > 0) {
          const selectedCategoryIds = categories
            .filter((cat) => {
              const catValue = cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-');
              return categoriesValues.includes(catValue);
            })
            .map((cat) => cat.$id);
          
          if (selectedCategoryIds.length > 0) {
            filteredEvents = filteredEvents.filter((event) => {
              // Check if event has any of the selected categories
              const eventCategories = event.categories || [];
              return selectedCategoryIds.some(catId => eventCategories.includes(catId));
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

          // Calculate distance using event.location (location is now on event, not client)
          const formattedDistance = formatEventDistance({
            userLocation,
            eventCoordinates: event.location 
              ? { latitude: event.location[1], longitude: event.location[0] }
              : undefined
          });

          // Get client info for display - look up from clientsMap
          const clientId = typeof event.client === 'string' ? event.client : event.client?.$id;
          const clientObj = clientId ? clientsMap.get(clientId) : (typeof event.client === 'object' ? event.client : null);
          
          // Debug: Log client lookup
          console.log('[HomeScreen] Event client lookup:', {
            eventId: event.$id,
            eventName: event.name,
            clientIdFromEvent: clientId,
            clientFound: !!clientObj,
            clientName: clientObj?.name,
            hasLogoURL: !!clientObj?.logoURL,
            logoURL: clientObj?.logoURL,
          });
          
          const location = clientObj?.name || clientObj?.title || event.city || 'Location';
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
            logoURL: clientObj?.logoURL || null, // Brand logo from client
            // Note: event.discountImageURL is available for discount display purposes
          };
        });

        // Sort by distance (closest first)
        transformedEvents.sort((a, b) => {
          const distA = parseFloat(a.distance.replace(/[^\d.]/g, '')) || 999999;
          const distB = parseFloat(b.distance.replace(/[^\d.]/g, '')) || 999999;
          return distA - distB;
        });

        // Debug: Log final transformed events
        console.log('[HomeScreen] Final events to display:', transformedEvents.map(e => ({
          id: e.id,
          name: e.name,
          logoURL: e.logoURL,
          hasLogoURL: !!e.logoURL,
        })));

        // Limit to first 10 events
        setEvents(transformedEvents.slice(0, 10));
      } catch (error) {
        console.error('Error loading events:', error);
        setEvents([]);
      } finally {
        setIsLoadingUpcomingEvents(false);
        setIsRefreshingEvents(false);
      }
    };

    loadEvents();
  }, [userLocation, datesValues, categoriesValues, radiusValues, categories, allCategoriesForFilter, isLoadingClients, refreshEventsTrigger, userIsAdult]);

  // Helper function to calculate distance in meters
  const calculateDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

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
    // "View All" means no filter, so clear all selections
    if (value === 'all') {
      setDatesValues([]);
    } else {
      // Single-select behavior: only one date range can be selected at a time
      setDatesValues((prev) =>
        prev.includes(value) ? [] : [value]
      );
    }
    // Keep modal open for user to review selection
  };

  const handleCategoriesToggle = (value: string) => {
    // "View All" means no filter, so clear all selections
    if (value === 'all') {
      setCategoriesValues([]);
    } else {
      // Multi-select behavior for categories
      setCategoriesValues((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    }
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
      // Get all event IDs from this marker location
      const eventIds = marker.events || [];
      
      // Find all events at this location
      const locationEvents = allUpcomingEvents.filter(e => eventIds.includes(e.$id));
      
      if (locationEvents.length > 0) {
        const formatTime = (hour: number, min: number) => {
          const period = hour >= 12 ? 'pm' : 'am';
          const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
          return min > 0 ? `${displayHour}:${min.toString().padStart(2, '0')} ${period}` : `${displayHour} ${period}`;
        };

        // Transform all events at this location
        const eventsData: EventData[] = locationEvents.map((event) => {
          const startTime = new Date(event.startTime);
          const endTime = new Date(event.endTime);
          const startHour = startTime.getHours();
          const endHour = endTime.getHours();
          const startMin = startTime.getMinutes();
          const endMin = endTime.getMinutes();
          const formattedTime = `${formatTime(startHour, startMin)} - ${formatTime(endHour, endMin)}`;
          
          // Look up client from allClients
          const clientId = typeof event.client === 'string' ? event.client : event.client?.$id;
          const clientObj = clientId ? allClients.find(c => c.$id === clientId) : (typeof event.client === 'object' ? event.client : null);
          const brandName = event.name || 'Brand';
          const productName = event.products || event.name || 'Product';
          
          // Calculate distance from user location to event
          const formattedDistance = userLocation && event.location
            ? formatEventDistance({
                userLocation,
                eventCoordinates: { latitude: event.location[1], longitude: event.location[0] }
              })
            : 'Distance unknown';

          return {
            id: event.$id,
            name: productName,
            brandName: brandName,
            location: clientObj?.name || clientObj?.title || event.city || 'Location',
            distance: formattedDistance,
            date: new Date(event.date),
            time: formattedTime,
            logoURL: clientObj?.logoURL || null,
          };
        });

        // Sort events by date
        eventsData.sort((a, b) => {
          const dateA = a.date instanceof Date ? a.date : new Date(a.date);
          const dateB = b.date instanceof Date ? b.date : new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });

        const storeData: StoreData = {
          id: marker.id,
          name: marker.title || 'Store',
          address: marker.address,
          events: eventsData,
        };

        setSelectedStore(storeData);
        setIsModalVisible(true);
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

  const handleRefreshEvents = () => {
    setIsRefreshingEvents(true);
    setRefreshEventsTrigger((prev) => prev + 1);
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
    isRefreshingEvents,
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
    handleRefreshEvents,
    handleZipCodeSubmit,
    handleZipCodeChange,
  };
};

