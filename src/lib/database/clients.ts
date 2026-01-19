import { Query } from 'react-native-appwrite';
import { tablesDB, DATABASE_ID, CLIENTS_TABLE_ID, EVENTS_TABLE_ID } from './config';
import type { ClientData, FetchClientsFilters } from './types';

/**
 * Fetch all clients from the database
 */
export const fetchClients = async (): Promise<ClientData[]> => {
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

    if (!result.rows || result.rows.length === 0) {
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

    return clients;
  } catch (error: any) {
    console.error('[database.fetchClients] Error fetching clients:', error);
    throw new Error(error.message || 'Failed to fetch clients');
  }
};

/**
 * Fetch a single client by ID
 */
export const fetchClientById = async (clientId: string): Promise<ClientData | null> => {
  // Validate environment variables
  if (!DATABASE_ID || !CLIENTS_TABLE_ID) {
    const errorMsg = 'Database ID or Clients Table ID not configured. Please check your .env file.';
    console.error('[database.fetchClientById]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const result = await tablesDB.getRow({
      databaseId: DATABASE_ID,
      tableId: CLIENTS_TABLE_ID,
      rowId: clientId,
    });

    if (!result) {
      return null;
    }

    // Extract location from point field - format: [longitude, latitude]
    let location: [number, number] | undefined;
    if (result.location) {
      if (Array.isArray(result.location) && result.location.length >= 2) {
        // Direct array format [longitude, latitude]
        location = [result.location[0], result.location[1]];
      } else if (result.location.coordinates && Array.isArray(result.location.coordinates) && result.location.coordinates.length >= 2) {
        // GeoJSON format {coordinates: [longitude, latitude]}
        location = [result.location.coordinates[0], result.location.coordinates[1]];
      }
    }

    const client: ClientData = {
      ...result, // Include all other fields including logoURL
      $id: result.$id,
      name: result.name || result.title || '',
      title: result.title || result.name || '',
      location,
      street: result.address || result.street || result.address?.street || '',
      city: result.city || result.address?.city || '',
      state: result.state || result.address?.state || '',
      zip: result.zip || result.zipCode || result.address?.zip || '',
    };

    return client;
  } catch (error: any) {
    console.error('[database.fetchClientById] Error fetching client:', error);
    return null; // Return null instead of throwing to avoid breaking the flow
  }
};

/**
 * Fetch clients with filters applied (radius, date, category)
 * Filters events first, then returns clients that have matching events
 */
export const fetchClientsWithFilters = async (filters: FetchClientsFilters): Promise<ClientData[]> => {
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
    }

    let filteredEvents: any[] = [];

    // Category filter - fetch events for each category and combine
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      // Fetch events for each category separately and combine results
      const allCategoryEvents: any[] = [];
      const seenEventIds = new Set<string>();
      
      for (const categoryId of filters.categoryIds) {
        const categoryEventQueries = [...eventQueries, Query.equal('categories', categoryId)];
        
        const categoryEventsResult = await tablesDB.listRows({
          databaseId: DATABASE_ID,
          tableId: EVENTS_TABLE_ID,
          queries: categoryEventQueries,
        });
        
        // Add unique events to the combined list
        if (categoryEventsResult.rows) {
          for (const event of categoryEventsResult.rows) {
            if (!seenEventIds.has(event.$id)) {
              seenEventIds.add(event.$id);
              allCategoryEvents.push(event);
            }
          }
        }
      }
      
      filteredEvents = allCategoryEvents;
    } else {
      // No category filter - fetch all events with other filters
      const eventsResult = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: EVENTS_TABLE_ID,
        queries: eventQueries,
      });

      filteredEvents = eventsResult.rows || [];
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

    // Step 2: Filter clients by radius (if specified) and by client IDs from events
    const clientQueries: any[] = [];

    // Radius filter - use Query.distanceLessThan on clients table (clients have location column)
    if (filters.radiusMiles && filters.userLocation) {
      const radiusMeters = filters.radiusMiles * 1609.34; // Convert miles to meters
      const centerPoint: [number, number] = [filters.userLocation.longitude, filters.userLocation.latitude];
      clientQueries.push(Query.distanceLessThan('location', centerPoint, radiusMeters));
    }

    // Fetch clients (radius filter applied server-side if specified)
    const clientsResult = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: CLIENTS_TABLE_ID,
      queries: clientQueries.length > 0 ? clientQueries : undefined,
    });

    if (!clientsResult.rows || clientsResult.rows.length === 0) {
      return [];
    }

    // Step 3: Filter clients to only include those that have matching events
    // If no events matched, return empty array
    if (clientIdsFromEvents.size === 0 && (filters.dateRange || (filters.categoryIds && filters.categoryIds.length > 0))) {
      return [];
    }

    // Filter clients: must be in clientIdsFromEvents (if events were filtered) AND pass radius filter (if applied)
    let filteredClients = clientsResult.rows;
    if (clientIdsFromEvents.size > 0) {
      filteredClients = clientsResult.rows.filter((client: any) => {
        return clientIdsFromEvents.has(client.$id);
      });
    }

    if (filteredClients.length === 0) {
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

    return clients;
  } catch (error: any) {
    console.error('[database.fetchClientsWithFilters] Error fetching clients with filters:', error);
    throw new Error(error.message || 'Failed to fetch clients with filters');
  }
};

