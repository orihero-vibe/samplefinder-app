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
 * Update user profile in the database
 */
export const updateUserProfile = async (
  profileId: string,
  updates: Partial<Pick<UserProfileData, 'firstname' | 'lastname' | 'phoneNumber' | 'username' | 'dob'>> & {
    avatarURL?: string | null;
    zipCode?: string | null;
  }
): Promise<UserProfileRow> => {
  console.log('[database.updateUserProfile] Updating user profile:', {
    profileId,
    updates: Object.keys(updates),
  });

  // Validate environment variables
  if (!DATABASE_ID || !USER_PROFILES_TABLE_ID) {
    const errorMsg = 'Database ID or Table ID not configured. Please check your .env file.';
    console.error('[database.updateUserProfile]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    // Prepare update data
    const updateData: any = {};

    if (updates.firstname !== undefined) {
      updateData.firstname = updates.firstname.trim();
    }
    if (updates.lastname !== undefined) {
      updateData.lastname = updates.lastname.trim();
    }
    if (updates.phoneNumber !== undefined) {
      updateData.phoneNumber = updates.phoneNumber.trim();
    }
    if (updates.username !== undefined) {
      updateData.username = updates.username.trim();
    }
    if (updates.avatarURL !== undefined) {
      updateData.avatarURL = updates.avatarURL;
    }
    if (updates.zipCode !== undefined) {
      updateData.zipCode = updates.zipCode;
    }
    if (updates.dob !== undefined) {
      // Convert date to ISO format if needed
      let dobISO = updates.dob;
      if (dobISO && !dobISO.includes('T')) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dobISO)) {
          dobISO = `${dobISO}T00:00:00.000Z`;
        } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dobISO)) {
          const [month, day, year] = dobISO.split('/');
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (!isNaN(date.getTime())) {
            dobISO = date.toISOString();
          }
        }
      }
      updateData.dob = dobISO;
    }

    console.log('[database.updateUserProfile] Update data:', updateData);

    // Update the row
    const result = await tablesDB.updateRow({
      databaseId: DATABASE_ID,
      tableId: USER_PROFILES_TABLE_ID,
      rowId: profileId,
      data: updateData,
    });

    console.log('[database.updateUserProfile] Profile updated successfully:', {
      rowId: result.$id,
    });

    // Return updated profile
    const updatedProfile = result as any;
    return {
      $id: updatedProfile.$id,
      authID: updatedProfile.authID,
      firstname: updatedProfile.firstname || '',
      lastname: updatedProfile.lastname || '',
      phoneNumber: updatedProfile.phoneNumber || '',
      dob: updatedProfile.dob || '',
      username: updatedProfile.username || '',
      role: updatedProfile.role || 'user',
      $createdAt: updatedProfile.$createdAt,
      $updatedAt: updatedProfile.$updatedAt,
      avatarURL: updatedProfile.avatarURL,
      zipCode: updatedProfile.zipCode,
      referalCode: updatedProfile.referalCode,
      isBlocked: updatedProfile.isBlocked || false,
    };
  } catch (error: any) {
    console.error('[database.updateUserProfile] Error updating user profile:', error);
    console.error('[database.updateUserProfile] Error message:', error?.message);
    console.error('[database.updateUserProfile] Error code:', error?.code);
    throw new Error(error.message || 'Failed to update user profile');
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
 * Fetch a single event by ID with client relationship
 */
export const fetchEventById = async (eventId: string): Promise<EventRow | null> => {
  console.log('[database.fetchEventById] Fetching event:', eventId);

  // Validate environment variables
  if (!DATABASE_ID || !EVENTS_TABLE_ID) {
    const errorMsg = 'Database ID or Events Table ID not configured. Please check your .env file.';
    console.error('[database.fetchEventById]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const result = await tablesDB.getRow({
      databaseId: DATABASE_ID,
      tableId: EVENTS_TABLE_ID,
      rowId: eventId,
    });

    if (!result) {
      console.log('[database.fetchEventById] Event not found:', eventId);
      return null;
    }

    // Check if event is archived or hidden
    const isArchived = result.isArchived === true || result.isArchived === 'true';
    const isHidden = result.isHidder === true || result.isHidder === 'true';

    if (isArchived || isHidden) {
      console.log('[database.fetchEventById] Event is archived or hidden:', eventId);
      return null;
    }

    const event: EventRow = {
      $id: result.$id,
      name: result.name || '',
      date: result.date || '',
      startTime: result.startTime || '',
      endTime: result.endTime || '',
      city: result.city || '',
      address: result.address || '',
      state: result.state || '',
      zipCode: result.zipCode || '',
      products: result.products || '',
      client: result.client,
      checkInCode: result.checkInCode || '',
      checkInPoints: result.checkInPoints || 0,
      reviewPoints: result.reviewPoints || 0,
      eventInfo: result.eventInfo || '',
      isArchived: result.isArchived || false,
      isHidder: result.isHidder || false,
      $createdAt: result.$createdAt,
      $updatedAt: result.$updatedAt,
    };

    console.log('[database.fetchEventById] Event fetched successfully:', event.$id);
    return event;
  } catch (error: any) {
    console.error('[database.fetchEventById] Error fetching event:', error);
    console.error('[database.fetchEventById] Error message:', error?.message);
    console.error('[database.fetchEventById] Error code:', error?.code);
    throw new Error(error.message || 'Failed to fetch event');
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

/**
 * User statistics interface
 */
export interface UserStatistics {
  totalPoints: number;
  eventCheckIns: number;
  samplingReviews: number;
  badgeAchievements: number;
}

/**
 * Get user statistics (points, check-ins, reviews, badges)
 * NOTE: This function requires the following database tables/fields:
 * - User Check-ins table (or checkIns field in UserProfile)
 * - User Reviews table (or reviews field in UserProfile)
 * - User Badges table (or badges field in UserProfile)
 * - User Points table (or totalPoints field in UserProfile)
 * 
 * Currently returns default values until these tables are created.
 */
export const getUserStatistics = async (authID: string): Promise<UserStatistics> => {
  console.log('[database.getUserStatistics] Fetching user statistics for authID:', authID);

  // Validate environment variables
  if (!DATABASE_ID || !USER_PROFILES_TABLE_ID) {
    const errorMsg = 'Database ID or Table ID not configured. Please check your .env file.';
    console.error('[database.getUserStatistics]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    // TODO: Implement actual queries once these tables/fields exist:
    // - Query user check-ins table filtered by authID
    // - Query user reviews table filtered by authID
    // - Query user badges table filtered by authID
    // - Get total points from user points table or user profile
    
    // For now, return default values
    // In production, you would:
    // 1. Query check-ins: tablesDB.listRows({ tableId: 'user_checkins', queries: [Query.equal('authID', authID)] })
    // 2. Query reviews: tablesDB.listRows({ tableId: 'user_reviews', queries: [Query.equal('authID', authID)] })
    // 3. Query badges: tablesDB.listRows({ tableId: 'user_badges', queries: [Query.equal('authID', authID)] })
    // 4. Get points: from user profile or points table
    
    const stats: UserStatistics = {
      totalPoints: 0,
      eventCheckIns: 0,
      samplingReviews: 0,
      badgeAchievements: 0,
    };

    console.log('[database.getUserStatistics] Returning default statistics:', stats);
    console.warn('[database.getUserStatistics] WARNING: Using default values. Database tables for check-ins, reviews, badges, and points need to be created.');
    
    return stats;
  } catch (error: any) {
    console.error('[database.getUserStatistics] Error fetching user statistics:', error);
    console.error('[database.getUserStatistics] Error message:', error?.message);
    console.error('[database.getUserStatistics] Error code:', error?.code);
    
    // Return default values on error
    return {
      totalPoints: 0,
      eventCheckIns: 0,
      samplingReviews: 0,
      badgeAchievements: 0,
    };
  }
};

/**
 * Calculate user tier status based on points or activity
 * Tier levels can be:
 * - NewbieSampler: 0-999 points
 * - ActiveSampler: 1000-4999 points
 * - ProSampler: 5000-9999 points
 * - EliteSampler: 10000+ points
 */
export const calculateTierStatus = (points: number): string => {
  if (points >= 10000) {
    return 'EliteSampler';
  } else if (points >= 5000) {
    return 'ProSampler';
  } else if (points >= 1000) {
    return 'ActiveSampler';
  } else {
    return 'NewbieSampler';
  }
};

export default {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  fetchClients,
  fetchClientsWithFilters,
  fetchEventsByClient,
  fetchEventById,
  fetchCategories,
  getUserStatistics,
  calculateTierStatus,
};

