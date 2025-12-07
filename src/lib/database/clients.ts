import { Query } from 'react-native-appwrite';
import { tablesDB, DATABASE_ID, CLIENTS_TABLE_ID, EVENTS_TABLE_ID } from './config';
import type { ClientData, FetchClientsFilters } from './types';

/**
 * Fetch all clients from the database
 */
export const fetchClients = async (): Promise<ClientData[]> => {
  console.log('[database.fetchClients] Fetching clients from database');

  // Validate environment variables
  if (!DATABASE_ID || !CLIENTS_TABLE_ID) {
    const errorMsg = 'Database ID or Clients Table ID not configured. Please check your .env file.';
    console.error('[database.fetchClients]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const result = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: CLIENTS_TABLE_ID,
    });

    console.log('[database.fetchClients] Query result:', {
      total: result.total,
      rowsCount: result.rows?.length || 0,
    });

    if (!result.rows || result.rows.length === 0) {
      console.log('[database.fetchClients] No clients found');
      return [];
    }

    // Map the rows to ClientData format
    const clients: ClientData[] = result.rows.map((row: any) => {
      // Extract location from point field - format: [longitude, latitude]
      let location: [number, number] | undefined;
      if (row.location) {
        if (Array.isArray(row.location) && row.location.length >= 2) {
          // Direct array format [longitude, latitude]
          location = [row.location[0], row.location[1]];
        } else if (row.location.coordinates && Array.isArray(row.location.coordinates) && row.location.coordinates.length >= 2) {
          // GeoJSON format {coordinates: [longitude, latitude]}
          location = [row.location.coordinates[0], row.location.coordinates[1]];
        }
      }
      
      return {
        $id: row.$id,
        name: row.name || row.title || '',
        title: row.title || row.name || '',
        location,
        street: row.address || row.street || row.address?.street || '',
        city: row.city || row.address?.city || '',
        state: row.state || row.address?.state || '',
        zip: row.zip || row.zipCode || row.address?.zip || '',
        $createdAt: row.$createdAt,
        $updatedAt: row.$updatedAt,
        ...row, // Include all other fields
      };
    });

    console.log('[database.fetchClients] Clients fetched successfully:', clients.length);
    return clients;
  } catch (error: any) {
    console.error('[database.fetchClients] Error fetching clients:', error);
    console.error('[database.fetchClients] Error message:', error?.message);
    console.error('[database.fetchClients] Error code:', error?.code);
    throw new Error(error.message || 'Failed to fetch clients');
  }
};

/**
 * Fetch clients with filters applied (radius, date, category)
 * Filters events first, then returns clients that have matching events
 */
export const fetchClientsWithFilters = async (filters: FetchClientsFilters): Promise<ClientData[]> => {
  console.log('[database.fetchClientsWithFilters] Fetching clients with filters:', filters);

  // Validate environment variables
  if (!DATABASE_ID || !CLIENTS_TABLE_ID || !EVENTS_TABLE_ID) {
    const errorMsg = 'Database ID or Table IDs not configured. Please check your .env file.';
    console.error('[database.fetchClientsWithFilters]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    // Step 1: Filter events by date and category (server-side)
    const eventQueries: any[] = [];

    // Filter out archived and hidden events
    eventQueries.push(Query.equal('isArchived', false));
    eventQueries.push(Query.equal('isHidden', false));

    // Date filter
    if (filters.dateRange) {
      eventQueries.push(Query.greaterThanEqual('date', filters.dateRange.start));
      eventQueries.push(Query.lessThanEqual('date', filters.dateRange.end));
      console.log('[database.fetchClientsWithFilters] Date filter:', filters.dateRange);
    }

    // Category filter - use OR logic for multiple categories
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      // For each category, add a query (Appwrite will handle OR for same field)
      // Note: We'll need to handle this differently - fetch all and filter, or use multiple queries
      // Since Appwrite may not support OR directly, we'll fetch events matching any category
      // and combine results
      const categoryQueries = filters.categoryIds.map((categoryId) =>
        Query.equal('categories', categoryId)
      );
      // For now, we'll fetch with first category and filter client-side for others
      // This is a limitation - ideally Appwrite would support OR queries
      if (categoryQueries.length > 0) {
        eventQueries.push(categoryQueries[0]);
      }
      console.log('[database.fetchClientsWithFilters] Category filter:', filters.categoryIds);
    }

    // Fetch filtered events (date and category filters applied server-side)
    console.log('[database.fetchClientsWithFilters] Querying events with', eventQueries.length, 'queries');
    const eventsResult = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: EVENTS_TABLE_ID,
      queries: eventQueries,
    });

    console.log('[database.fetchClientsWithFilters] Events query result:', {
      total: eventsResult.total,
      rowsCount: eventsResult.rows?.length || 0,
    });

    // Additional client-side filtering for categories if multiple categories selected
    // (This is needed because Appwrite doesn't support OR queries for the same field)
    let filteredEvents = eventsResult.rows || [];
    if (filters.categoryIds && filters.categoryIds.length > 1) {
      filteredEvents = (eventsResult.rows || []).filter((event: any) => {
        const eventCategoryId = event.categories?.$id || event.categories;
        return eventCategoryId && filters.categoryIds!.includes(String(eventCategoryId));
      });
    }

    // Extract unique client IDs from filtered events
    // Handle both relationship object format and string ID format
    const clientIdsFromEvents = new Set<string>();
    filteredEvents.forEach((event: any) => {
      const clientId = event.client?.$id || event.client;
      if (clientId) {
        clientIdsFromEvents.add(String(clientId));
      }
    });

    console.log('[database.fetchClientsWithFilters] Client IDs from events:', clientIdsFromEvents.size);

    // Step 2: Filter clients by radius (if specified) and by client IDs from events
    const clientQueries: any[] = [];

    // Radius filter - use Query.distanceLessThan on clients table (clients have location column)
    if (filters.radiusMiles && filters.userLocation) {
      const radiusMeters = filters.radiusMiles * 1609.34; // Convert miles to meters
      const centerPoint: [number, number] = [filters.userLocation.longitude, filters.userLocation.latitude];
      clientQueries.push(Query.distanceLessThan('location', centerPoint, radiusMeters));
      console.log('[database.fetchClientsWithFilters] Radius filter on clients:', {
        miles: filters.radiusMiles,
        meters: radiusMeters,
        center: centerPoint,
      });
    }

    // Fetch clients (radius filter applied server-side if specified)
    console.log('[database.fetchClientsWithFilters] Querying clients with', clientQueries.length, 'queries');
    const clientsResult = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: CLIENTS_TABLE_ID,
      queries: clientQueries.length > 0 ? clientQueries : undefined,
    });

    console.log('[database.fetchClientsWithFilters] Clients query result:', {
      total: clientsResult.total,
      rowsCount: clientsResult.rows?.length || 0,
    });

    if (!clientsResult.rows || clientsResult.rows.length === 0) {
      console.log('[database.fetchClientsWithFilters] No clients found matching filters');
      return [];
    }

    // Step 3: Filter clients to only include those that have matching events
    // If no events matched, return empty array
    if (clientIdsFromEvents.size === 0 && (filters.dateRange || (filters.categoryIds && filters.categoryIds.length > 0))) {
      console.log('[database.fetchClientsWithFilters] No events matched date/category filters');
      return [];
    }

    // Filter clients: must be in clientIdsFromEvents (if events were filtered) AND pass radius filter (if applied)
    let filteredClients = clientsResult.rows;
    if (clientIdsFromEvents.size > 0) {
      filteredClients = clientsResult.rows.filter((client: any) => {
        return clientIdsFromEvents.has(client.$id);
      });
    }

    console.log('[database.fetchClientsWithFilters] Filtered clients count:', filteredClients.length);

    if (filteredClients.length === 0) {
      console.log('[database.fetchClientsWithFilters] No clients found matching all filters');
      return [];
    }

    // Map filtered clients to ClientData format
    const clients: ClientData[] = filteredClients.map((row: any) => {
        // Extract location from point field - format: [longitude, latitude]
        let location: [number, number] | undefined;
        if (row.location) {
          if (Array.isArray(row.location) && row.location.length >= 2) {
            // Direct array format [longitude, latitude]
            location = [row.location[0], row.location[1]];
          } else if (row.location.coordinates && Array.isArray(row.location.coordinates) && row.location.coordinates.length >= 2) {
            // GeoJSON format {coordinates: [longitude, latitude]}
            location = [row.location.coordinates[0], row.location.coordinates[1]];
          }
        }

        return {
          $id: row.$id,
          name: row.name || row.title || '',
          title: row.title || row.name || '',
          location,
          street: row.address || row.street || row.address?.street || '',
          city: row.city || row.address?.city || '',
          state: row.state || row.address?.state || '',
          zip: row.zip || row.zipCode || row.address?.zip || '',
          $createdAt: row.$createdAt,
          $updatedAt: row.$updatedAt,
          ...row, // Include all other fields
        };
      });

    console.log('[database.fetchClientsWithFilters] Clients fetched successfully:', clients.length);
    return clients;
  } catch (error: any) {
    console.error('[database.fetchClientsWithFilters] Error fetching clients with filters:', error);
    console.error('[database.fetchClientsWithFilters] Error message:', error?.message);
    console.error('[database.fetchClientsWithFilters] Error code:', error?.code);
    throw new Error(error.message || 'Failed to fetch clients with filters');
  }
};

