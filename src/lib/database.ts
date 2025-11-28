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
  latitude: number;
  longitude: number;
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
    const clients: ClientData[] = result.rows.map((row: any) => ({
      $id: row.$id,
      name: row.name || row.title || '',
      title: row.title || row.name || '',
      latitude: typeof row.latitude === 'number' ? row.latitude : parseFloat(row.latitude) || 0,
      longitude: typeof row.longitude === 'number' ? row.longitude : parseFloat(row.longitude) || 0,
      street: row.address || row.street || row.address?.street || '',
      city: row.city || row.address?.city || '',
      state: row.state || row.address?.state || '',
      zip: row.zip || row.zipCode || row.address?.zip || '',
      $createdAt: row.$createdAt,
      $updatedAt: row.$updatedAt,
      ...row, // Include all other fields
    }));

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
  fetchEventsByClient,
  fetchCategories,
};

