import { TablesDB, ID, Query } from 'react-native-appwrite';
import appwriteClient from './appwrite';
import { 
  APPWRITE_DATABASE_ID,
  APPWRITE_USER_PROFILES_TABLE_ID,
  APPWRITE_CLIENTS_TABLE_ID,
  APPWRITE_EVENTS_TABLE_ID,
  APPWRITE_CATEGORIES_TABLE_ID
} from '@env';

const DATABASE_ID = APPWRITE_DATABASE_ID || '';
const USER_PROFILES_TABLE_ID = APPWRITE_USER_PROFILES_TABLE_ID || '';
const CLIENTS_TABLE_ID = APPWRITE_CLIENTS_TABLE_ID || '';
const EVENTS_TABLE_ID = APPWRITE_EVENTS_TABLE_ID || '';
const CATEGORIES_TABLE_ID = APPWRITE_CATEGORIES_TABLE_ID || '';

// Use the same client instance that's used for Account service
// This ensures TablesDB shares the same session
const tablesDB = new TablesDB(appwriteClient);

export interface UserProfileData {
  authID: string;
  firstname: string;
  lastname: string;
  phoneNumber: string;
  dob: string; // ISO 8601 date string
  username: string;
  role?: 'admin' | 'user';
}

export interface UserProfileRow extends UserProfileData {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  avatarURL?: string | null;
  zipCode?: string | null;
  referalCode?: string | null;
  isBlocked?: boolean;
}

/**
 * Create a user profile in the database
 */
export const createUserProfile = async (profileData: UserProfileData): Promise<void> => {
  console.log('[database.createUserProfile] Starting user profile creation');
  console.log('[database.createUserProfile] Profile data:', {
    authID: profileData.authID,
    firstname: profileData.firstname,
    lastname: profileData.lastname,
    phoneNumber: profileData.phoneNumber,
    username: profileData.username,
    role: profileData.role || 'user',
  });

  // Validate environment variables
  if (!DATABASE_ID || !USER_PROFILES_TABLE_ID) {
    const errorMsg = 'Database ID or Table ID not configured. Please check your .env file.';
    console.error('[database.createUserProfile]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    // Convert date string to ISO 8601 format if needed
    let dobISO = profileData.dob;
    console.log('[database.createUserProfile] Original DOB:', dobISO);
    
    // If the date is in a format like "MM/DD/YYYY" or "YYYY-MM-DD", ensure it's ISO format
    if (dobISO && !dobISO.includes('T')) {
      // If it's already in YYYY-MM-DD format, add time component
      if (/^\d{4}-\d{2}-\d{2}$/.test(dobISO)) {
        dobISO = `${dobISO}T00:00:00.000Z`;
      } else {
        // Try to parse other formats (like MM/DD/YYYY)
        // For MM/DD/YYYY format, we need to parse it correctly
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dobISO)) {
          const [month, day, year] = dobISO.split('/');
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (!isNaN(date.getTime())) {
            dobISO = date.toISOString();
          } else {
            throw new Error(`Invalid date format: ${dobISO}`);
          }
        } else {
          // Try to parse other formats
          const date = new Date(dobISO);
          if (!isNaN(date.getTime())) {
            dobISO = date.toISOString();
          } else {
            throw new Error(`Invalid date format: ${dobISO}`);
          }
        }
      }
    }
    
    console.log('[database.createUserProfile] Converted DOB to ISO:', dobISO);

    const rowData = {
      authID: profileData.authID,
      firstname: profileData.firstname,
      lastname: profileData.lastname,
      phoneNumber: profileData.phoneNumber,
      dob: dobISO,
      username: profileData.username,
      role: profileData.role || 'user',
    };

    console.log('[database.createUserProfile] Creating row with data:', {
      ...rowData,
      dob: dobISO,
    });
    console.log('[database.createUserProfile] Database ID:', DATABASE_ID);
    console.log('[database.createUserProfile] Table ID:', USER_PROFILES_TABLE_ID);

    const rowId = ID.unique();
    console.log('[database.createUserProfile] Generated row ID:', rowId);
    
    console.log('[database.createUserProfile] Calling tablesDB.createRow with:', {
      databaseId: DATABASE_ID,
      tableId: USER_PROFILES_TABLE_ID,
      rowId: rowId,
      dataKeys: Object.keys(rowData),
    });
    
    const result = await tablesDB.createRow({
      databaseId: DATABASE_ID,
      tableId: USER_PROFILES_TABLE_ID,
      rowId: rowId,
      data: rowData,
      // Set permissions so the user can read their own profile
      permissions: [
        `read("user:${profileData.authID}")`,
        `update("user:${profileData.authID}")`,
        `delete("user:${profileData.authID}")`,
      ],
    });

    console.log('[database.createUserProfile] createRow response:', JSON.stringify(result, null, 2));
    console.log('[database.createUserProfile] Response type:', typeof result);
    console.log('[database.createUserProfile] Response keys:', result ? Object.keys(result) : 'null');
    
    if (!result || !result.$id) {
      throw new Error('createRow returned invalid response - no row ID in result');
    }

    console.log('[database.createUserProfile] User profile created successfully:', {
      rowId: result.$id,
      authID: profileData.authID,
      fullResult: result,
    });
    
    // Verify the row was actually created by trying to read it back
    console.log('[database.createUserProfile] Verifying row was created...');
    try {
      const verifyResult = await tablesDB.getRow({
        databaseId: DATABASE_ID,
        tableId: USER_PROFILES_TABLE_ID,
        rowId: result.$id,
      });
      console.log('[database.createUserProfile] Row verification successful:', {
        rowId: verifyResult.$id,
        authID: verifyResult.authID,
      });
    } catch (verifyError: any) {
      console.error('[database.createUserProfile] Row verification failed:', verifyError);
      throw new Error(`Row was not created successfully. Verification failed: ${verifyError?.message || 'Unknown error'}`);
    }
  } catch (error: any) {
    console.error('[database.createUserProfile] Error creating user profile:', error);
    console.error('[database.createUserProfile] Error message:', error?.message);
    console.error('[database.createUserProfile] Error code:', error?.code);
    console.error('[database.createUserProfile] Error response:', error?.response);
    console.error('[database.createUserProfile] Full error:', JSON.stringify(error, null, 2));
    
    // Check for specific error types
    if (error?.code === 401 || error?.message?.includes('Unauthorized') || error?.message?.includes('authentication')) {
      throw new Error('Authentication failed. Please ensure you are logged in.');
    }
    if (error?.code === 404 || error?.message?.includes('not found')) {
      throw new Error('Database or table not found. Please check your environment variables.');
    }
    
    throw new Error(error.message || 'Failed to create user profile');
  }
};

/**
 * Get user profile by authID
 */
export const getUserProfile = async (authID: string): Promise<UserProfileRow | null> => {
  console.log('[database.getUserProfile] Fetching user profile for authID:', authID);

  // Validate environment variables
  if (!DATABASE_ID || !USER_PROFILES_TABLE_ID) {
    const errorMsg = 'Database ID or Table ID not configured. Please check your .env file.';
    console.error('[database.getUserProfile]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    // Query for the profile by authID
    const result = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: USER_PROFILES_TABLE_ID,
      queries: [Query.equal('authID', authID)],
    });

    console.log('[database.getUserProfile] Query result:', {
      total: result.total,
      rowsCount: result.rows?.length || 0,
    });

    if (!result.rows || result.rows.length === 0) {
      console.log('[database.getUserProfile] No profile found for authID:', authID);
      return null;
    }

    const profile = result.rows[0] as any;
    console.log('[database.getUserProfile] Profile found:', {
      rowId: profile.$id,
      authID: profile.authID,
      username: profile.username,
    });

    return {
      $id: profile.$id,
      authID: profile.authID,
      firstname: profile.firstname || '',
      lastname: profile.lastname || '',
      phoneNumber: profile.phoneNumber || '',
      dob: profile.dob || '',
      username: profile.username || '',
      role: profile.role || 'user',
      $createdAt: profile.$createdAt,
      $updatedAt: profile.$updatedAt,
      avatarURL: profile.avatarURL,
      zipCode: profile.zipCode,
      referalCode: profile.referalCode,
      isBlocked: profile.isBlocked || false,
    };
  } catch (error: any) {
    console.error('[database.getUserProfile] Error fetching user profile:', error);
    console.error('[database.getUserProfile] Error message:', error?.message);
    console.error('[database.getUserProfile] Error code:', error?.code);
    throw new Error(error.message || 'Failed to fetch user profile');
  }
};

/**
 * Client data interface for map markers
 */
export interface ClientData {
  $id: string;
  name?: string;
  title?: string;
  location?: [number, number]; // Point type: [longitude, latitude]
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  $createdAt?: string;
  $updatedAt?: string;
  [key: string]: any; // Allow for additional fields
}

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
export interface FetchClientsFilters {
  radiusMiles?: number;
  dateRange?: {
    start: string; // ISO datetime
    end: string; // ISO datetime
  };
  categoryIds?: string[];
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

export const fetchClientsWithFilters = async (filters: FetchClientsFilters): Promise<ClientData[]> => {
  console.log('[database.fetchClientsWithFilters] Fetching clients with filters:', filters);

  // Validate environment variables
  if (!DATABASE_ID || !CLIENTS_TABLE_ID || !EVENTS_TABLE_ID) {
    const errorMsg = 'Database ID or Table IDs not configured. Please check your .env file.';
    console.error('[database.fetchClientsWithFilters]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    // Helper function to calculate distance between two points using Haversine formula
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 3959; // Earth's radius in miles
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
          Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in miles
    };

    // Build queries for events table
    const eventQueries: any[] = [];

    // Filter out archived and hidden events
    eventQueries.push(Query.equal('isArchived', false));
    eventQueries.push(Query.equal('isHidden', false));

    // Note: Query.near is not available in react-native-appwrite
    // We'll filter by radius client-side after fetching events

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

    if (!eventsResult.rows || eventsResult.rows.length === 0) {
      console.log('[database.fetchClientsWithFilters] No events found matching filters');
      return [];
    }

    // Apply radius filter client-side (since Query.near is not available)
    let filteredEvents = eventsResult.rows;
    if (filters.radiusMiles && filters.userLocation) {
      filteredEvents = eventsResult.rows.filter((event: any) => {
        // Extract location from event
        let eventLocation: [number, number] | null = null;
        if (event.location) {
          if (Array.isArray(event.location) && event.location.length >= 2) {
            eventLocation = [event.location[0], event.location[1]]; // [longitude, latitude]
          } else if (event.location.coordinates && Array.isArray(event.location.coordinates) && event.location.coordinates.length >= 2) {
            eventLocation = [event.location.coordinates[0], event.location.coordinates[1]];
          }
        }

        if (!eventLocation) {
          return false; // Skip events without location
        }

        // Calculate distance from user location to event location
        const distance = calculateDistance(
          filters.userLocation.latitude,
          filters.userLocation.longitude,
          eventLocation[1], // latitude
          eventLocation[0]  // longitude
        );

        return distance <= filters.radiusMiles;
      });

      console.log('[database.fetchClientsWithFilters] After radius filter:', {
        before: eventsResult.rows.length,
        after: filteredEvents.length,
        radiusMiles: filters.radiusMiles,
      });
    }

    // Additional client-side filtering for categories if multiple categories selected
    if (filters.categoryIds && filters.categoryIds.length > 1) {
      filteredEvents = filteredEvents.filter((event: any) => {
        const eventCategoryId = event.categories?.$id || event.categories;
        return eventCategoryId && filters.categoryIds!.includes(String(eventCategoryId));
      });
    }

    // Extract unique client IDs from filtered events
    // Handle both relationship object format and string ID format
    const clientIds = new Set<string>();
    filteredEvents.forEach((event: any) => {
      const clientId = event.client?.$id || event.client;
      if (clientId) {
        clientIds.add(String(clientId));
      }
    });

    console.log('[database.fetchClientsWithFilters] Unique client IDs found:', clientIds.size);

    if (clientIds.size === 0) {
      console.log('[database.fetchClientsWithFilters] No clients found with matching events');
      return [];
    }

    // Fetch clients by IDs
    // Appwrite doesn't support IN queries directly, so we'll fetch all and filter
    // Or we can make multiple queries - for now, fetch all and filter
    const clientsResult = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: CLIENTS_TABLE_ID,
    });

    if (!clientsResult.rows || clientsResult.rows.length === 0) {
      console.log('[database.fetchClientsWithFilters] No clients found');
      return [];
    }

    // Filter clients by IDs and map to ClientData format
    const clients: ClientData[] = clientsResult.rows
      .filter((row: any) => clientIds.has(row.$id))
      .map((row: any) => {
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

/**
 * Event data interface
 */
export interface EventRow {
  $id: string;
  name: string;
  date: string; // ISO datetime
  startTime: string; // ISO datetime
  endTime: string; // ISO datetime
  city: string;
  address: string;
  state: string;
  zipCode: string;
  products: string;
  client?: any;
  checkInCode: string;
  checkInPoints: number;
  reviewPoints: number;
  eventInfo: string;
  isArchived?: boolean;
  isHidder?: boolean;
  $createdAt?: string;
  $updatedAt?: string;
}

/**
 * Fetch events by client ID
 */
export const fetchEventsByClient = async (clientId: string): Promise<EventRow[]> => {
  console.log('[database.fetchEventsByClient] Fetching events for client:', clientId);

  console.log('[database.fetchEventsByClient] DATABASE_ID:', DATABASE_ID);
  console.log('[database.fetchEventsByClient] EVENTS_TABLE_ID:', EVENTS_TABLE_ID);
  // Validate environment variables
  if (!DATABASE_ID || !EVENTS_TABLE_ID) {
    const errorMsg = 'Database ID or Events Table ID not configured. Please check your .env file.';
    console.error('[database.fetchEventsByClient]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    // Fetch all events and filter in JavaScript
    // This avoids query syntax issues with relationship columns
    // TODO: Optimize with proper query syntax once relationship query format is confirmed
    const result = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: EVENTS_TABLE_ID,
    });

    console.log('[database.fetchEventsByClient] Query result:', {
      total: result.total,
      rowsCount: result.rows?.length || 0,
    });

    if (!result.rows || result.rows.length === 0) {
      console.log('[database.fetchEventsByClient] No events found for client:', clientId);
      return [];
    }

    // Map the rows to EventRow format and filter by client ID and exclude archived/hidden events
    const events: EventRow[] = result.rows
      .filter((row: any) => {
        // Filter by client ID - check if client matches (could be a relationship object or string ID)
        const rowClientId = row.client?.$id || row.client || '';
        const clientMatches = rowClientId === clientId || String(rowClientId) === String(clientId);
        
        // Filter out archived and hidden events
        const isArchived = row.isArchived === true || row.isArchived === 'true';
        const isHidden = row.isHidder === true || row.isHidder === 'true';
        
        return clientMatches && !isArchived && !isHidden;
      })
      .map((row: any) => ({
        $id: row.$id,
        name: row.name || '',
        date: row.date || '',
        startTime: row.startTime || '',
        endTime: row.endTime || '',
        city: row.city || '',
        address: row.address || '',
        state: row.state || '',
        zipCode: row.zipCode || '',
        products: row.products || '',
        client: row.client,
        checkInCode: row.checkInCode || '',
        checkInPoints: row.checkInPoints || 0,
        reviewPoints: row.reviewPoints || 0,
        eventInfo: row.eventInfo || '',
        isArchived: row.isArchived || false,
        isHidder: row.isHidder || false,
        $createdAt: row.$createdAt,
        $updatedAt: row.$updatedAt,
      }));

    console.log('[database.fetchEventsByClient] Events fetched successfully:', events.length);
    return events;
  } catch (error: any) {
    console.error('[database.fetchEventsByClient] Error fetching events:', error);
    console.error('[database.fetchEventsByClient] Error message:', error?.message);
    console.error('[database.fetchEventsByClient] Error code:', error?.code);
    throw new Error(error.message || 'Failed to fetch events');
  }
};

/**
 * Category data interface
 */
export interface CategoryData {
  $id: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  $createdAt?: string;
  $updatedAt?: string;
  [key: string]: any; // Allow for additional fields
}

/**
 * Fetch all categories from the database
 */
export const fetchCategories = async (): Promise<CategoryData[]> => {
  console.log('[database.fetchCategories] Fetching categories from database');

  console.log('[database.fetchCategories] DATABASE_ID:', DATABASE_ID);
  console.log('[database.fetchCategories] CATEGORIES_TABLE_ID:', CATEGORIES_TABLE_ID);

  // Validate environment variables
  if (!DATABASE_ID || !CATEGORIES_TABLE_ID) {
    const errorMsg = 'Database ID or Categories Table ID not configured. Please check your .env file.';
    console.error('[database.fetchCategories]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    // Fetch all categories
    // Note: If you want to filter by isActive, you can add queries here
    // Example: queries: [Query.equal('isActive', true)]
    const result = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: CATEGORIES_TABLE_ID,
    });

    console.log('[database.fetchCategories] Query result:', {
      total: result.total,
      rowsCount: result.rows?.length || 0,
    });

    if (!result.rows || result.rows.length === 0) {
      console.log('[database.fetchCategories] No categories found');
      return [];
    }

    // Map the rows to CategoryData format
    const categories: CategoryData[] = result.rows
      .map((row: any) => ({
        $id: row.$id,
        name: row.name || row.title || '',
        slug: row.slug || row.name?.toLowerCase().replace(/\s+/g, '-') || '',
        description: row.description || '',
        icon: row.icon || '',
        isActive: row.isActive !== false, // Default to true if not specified
        $createdAt: row.$createdAt,
        $updatedAt: row.$updatedAt,
        ...row, // Include all other fields
      }))
      .filter((cat: CategoryData) => cat.isActive !== false); // Filter out inactive categories

    console.log('[database.fetchCategories] Categories fetched successfully:', categories.length);
    return categories;
  } catch (error: any) {
    console.error('[database.fetchCategories] Error fetching categories:', error);
    console.error('[database.fetchCategories] Error message:', error?.message);
    console.error('[database.fetchCategories] Error code:', error?.code);
    throw new Error(error.message || 'Failed to fetch categories');
  }
};

export default {
  createUserProfile,
  getUserProfile,
  fetchClients,
  fetchClientsWithFilters,
  fetchEventsByClient,
  fetchCategories,
};

