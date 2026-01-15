import { TablesDB, Functions } from 'react-native-appwrite';
import appwriteClient from '../appwrite';
import { 
  APPWRITE_DATABASE_ID,
  APPWRITE_USER_PROFILES_TABLE_ID,
  APPWRITE_CLIENTS_TABLE_ID,
  APPWRITE_EVENTS_TABLE_ID,
  APPWRITE_CATEGORIES_TABLE_ID,
  APPWRITE_TIERS_TABLE_ID,
  APPWRITE_SETTINGS_TABLE_ID,
} from '@env';

// Database and table IDs
export const DATABASE_ID = APPWRITE_DATABASE_ID || '';
export const USER_PROFILES_TABLE_ID = APPWRITE_USER_PROFILES_TABLE_ID || '';
export const CLIENTS_TABLE_ID = APPWRITE_CLIENTS_TABLE_ID || '';
export const EVENTS_TABLE_ID = APPWRITE_EVENTS_TABLE_ID || '';
export const CATEGORIES_TABLE_ID = APPWRITE_CATEGORIES_TABLE_ID || '';
export const TIERS_TABLE_ID = APPWRITE_TIERS_TABLE_ID || '';
export const SETTINGS_TABLE_ID = APPWRITE_SETTINGS_TABLE_ID || 'settings';

// Use the same client instance that's used for Account service
// This ensures TablesDB shares the same session
export const tablesDB = new TablesDB(appwriteClient);

// Initialize Functions service for executing cloud functions
export const functions = new Functions(appwriteClient);

