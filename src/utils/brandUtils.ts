import { EventRow, ClientData } from '@/lib/database';
import { BrandDetailsData } from '@/screens/brand-details';
import { formatEventDate, formatEventTime, parseProducts } from './formatters';

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

