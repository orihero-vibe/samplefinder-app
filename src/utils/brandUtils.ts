import { EventRow, ClientData } from '@/lib/database';
import { BrandDetailsData } from '@/screens/brand-details';
import { CalendarEventDetail } from '@/screens/tabs/calendar/components';
import { formatEventDate, formatEventTime, parseProducts, formatEventDistance } from './formatters';
import { Colors } from '@/constants/Colors';
import { NewBrandData } from '@/screens/tabs/favorites/components';

/**
 * Converts EventRow + ClientData to BrandDetailsData format
 */
export const convertEventToBrandDetails = (
  event: EventRow,
  client: ClientData | null
): BrandDetailsData => {
  // Format date from ISO to "Aug 1, 2025"
  const formattedDate = formatEventDate(event.date);
  
  // Format time from ISO to "3 - 5 pm"
  const formattedTime = formatEventTime(event.startTime, event.endTime);
  
  // Parse products string to array
  const products = parseProducts(event.products);
  
  // Get store name from client, fallback to event name or default
  const storeName = client?.name || client?.title || 'Store';
  
  // Get address components from event and client
  const address = {
    street: event.address || client?.street || '',
    city: event.city || client?.city || '',
    state: event.state || client?.state || '',
    zip: event.zipCode || client?.zip || client?.zipCode || '',
  };
  
  // Get brand name from event name
  const brandName = event.name || 'Brand';
  
  // Create BrandDetailsData
  const brandDetails: BrandDetailsData = {
    id: event.$id,
    brandName,
    storeName,
    date: formattedDate,
    time: formattedTime,
    address,
    products,
    eventInfo: event.eventInfo || '',
    discountMessage: undefined, // Will be populated from database when available
  };
  
  return brandDetails;
};

/**
 * Converts EventRow + ClientData to CalendarEventDetail format
 * Used for calendar and event list displays
 */
export const convertEventToCalendarEventDetail = (
  event: EventRow,
  client: ClientData | null,
  userLocation?: { latitude: number; longitude: number }
): CalendarEventDetail => {
  // Format time from ISO to "3 - 5 pm"
  const formattedTime = formatEventTime(event.startTime, event.endTime);
  
  // Get location name from client, fallback to event address
  const location = client?.name || client?.title || event.address || 'Location TBD';
  
  // Calculate distance if user location is provided
  const distance = formatEventDistance({
    userLocation,
    eventCoordinates: client?.location 
      ? { 
          latitude: client.location[0],
          longitude: client.location[1]
        }
      : undefined
  });
  
  // Generate logo from brand name
  const brandName = event.name || 'Brand';
  const logoText = brandName
    .split(' ')
    .map((word) => word.substring(0, 4).toUpperCase())
    .slice(0, 2)
    .join('\n');
  
  // Generate a color based on brand name hash (consistent color per brand)
  const hash = brandName.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const colors = [
    Colors.orangeBA,
    Colors.brandBlueBright,
    '#8B4513', // Brown
    Colors.black,
    '#228B22', // Green
    Colors.brandPurpleDeep,
  ];
  const backgroundColor = colors[Math.abs(hash) % colors.length];
  
  // Determine text color based on background
  const isLightColor = backgroundColor === Colors.white || backgroundColor === '#FFD700';
  const textColor = isLightColor ? Colors.brandBlueBright : Colors.white;
  
  const logo = {
    backgroundColor,
    text: logoText,
    textColor: backgroundColor === Colors.white ? Colors.brandBlueBright : undefined,
  };
  
  // Get brand/client name (for display as subtitle)
  const displayBrandName = client?.name || client?.title || brandName;
  
  // Get logo URL - prioritize discountImageURL over client.logoURL
  const logoURL = event.discountImageURL || client?.logoURL || null;

  return {
    id: event.$id,
    date: new Date(event.date),
    name: brandName,
    brandName: displayBrandName,
    location,
    distance,
    time: formattedTime,
    logoURL,
    logo,
  };
};

/**
 * Fetches client data from event's client relationship
 * Helper function to extract ClientData from event.client
 */
export const extractClientFromEvent = (event: EventRow): ClientData | null => {
  if (!event.client) return null;
  
  // Handle both relationship object format and direct client data
  const clientObj = typeof event.client === 'string' 
    ? null 
    : event.client;
  
  if (!clientObj) return null;
  
  // Extract location from point field
  let location: [number, number] | undefined;
  if (clientObj.location) {
    if (Array.isArray(clientObj.location) && clientObj.location.length >= 2) {
      location = [clientObj.location[0], clientObj.location[1]];
    } else if (clientObj.location.coordinates && Array.isArray(clientObj.location.coordinates) && clientObj.location.coordinates.length >= 2) {
      location = [clientObj.location.coordinates[0], clientObj.location.coordinates[1]];
    }
  }
  
  return {
    $id: clientObj.$id || '',
    name: clientObj.name || clientObj.title || '',
    title: clientObj.title || clientObj.name || '',
    location,
    street: clientObj.address || clientObj.street || clientObj.address?.street || '',
    city: clientObj.city || clientObj.address?.city || '',
    state: clientObj.state || clientObj.address?.state || '',
    zip: clientObj.zip || clientObj.zipCode || clientObj.address?.zip || '',
    $createdAt: clientObj.$createdAt,
    $updatedAt: clientObj.$updatedAt,
    ...clientObj,
  };
};

/**
 * Converts clients to brand data with product types from their events
 * Returns brands sorted by creation date (oldest first)
 * Each brand includes all unique product types from its events
 */
export const convertClientsToBrands = (
  clients: ClientData[],
  events: EventRow[]
): Omit<NewBrandData, 'isFavorited'>[] => {
  // Group events by client ID to efficiently get product types per client
  const eventsByClientId = new Map<string, EventRow[]>();
  
  events.forEach((event) => {
    const clientId = typeof event.client === 'string' 
      ? event.client 
      : event.client?.$id;
    
    if (clientId) {
      if (!eventsByClientId.has(clientId)) {
        eventsByClientId.set(clientId, []);
      }
      eventsByClientId.get(clientId)!.push(event);
    }
  });

  // Convert clients to brand data format
  const brands: Omit<NewBrandData, 'isFavorited'>[] = clients
    .map((client) => {
      const clientName = client.name || client.title || 'Brand';
      const clientId = client.$id;
      
      // Get all product types from this client's events
      const clientEvents = eventsByClientId.get(clientId) || [];
      const productTypesSet = new Set<string>();
      
      clientEvents.forEach((event) => {
        const products = parseProducts(event.products || '');
        products.forEach((product) => {
          if (product && product.trim()) {
            productTypesSet.add(product.trim());
          }
        });
      });

      return {
        id: clientId, // Use client ID as brand ID
        brandName: clientName,
        description: '', // Will be set based on product types
        productTypes: Array.from(productTypesSet).sort(),
        createdAt: client.$createdAt || new Date().toISOString(),
        logoURL: client.logoURL || null, // Get logoURL from client
      };
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB; // Sort ascending (oldest first)
    });

  return brands;
};

