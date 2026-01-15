import { Query } from 'react-native-appwrite';
import { tablesDB, DATABASE_ID, SETTINGS_TABLE_ID } from './config';
import type { SettingRow } from './types';

/**
 * Get a setting by key
 */
export const getSetting = async (key: string): Promise<SettingRow | null> => {
  console.log('[database.getSetting] Fetching setting:', key);

  // Validate environment variables
  if (!DATABASE_ID || !SETTINGS_TABLE_ID) {
    const errorMsg = 'Database ID or Settings Table ID not configured. Please check your .env file.';
    console.error('[database.getSetting]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    // Query for the setting by key
    const result = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: SETTINGS_TABLE_ID,
      queries: [Query.equal('key', key)],
    });

    console.log('[database.getSetting] Query result:', {
      total: result.total,
      rowsCount: result.rows?.length || 0,
    });

    if (!result.rows || result.rows.length === 0) {
      console.log('[database.getSetting] No setting found for key:', key);
      return null;
    }

    const setting = result.rows[0] as any;
    console.log('[database.getSetting] Setting found:', {
      rowId: setting.$id,
      key: setting.key,
    });

    return {
      $id: setting.$id,
      key: setting.key,
      value: setting.value || '',
      description: setting.description || null,
      $createdAt: setting.$createdAt,
      $updatedAt: setting.$updatedAt,
    };
  } catch (error: any) {
    console.error('[database.getSetting] Error fetching setting:', error);
    console.error('[database.getSetting] Error message:', error?.message);
    console.error('[database.getSetting] Error code:', error?.code);
    throw new Error(error.message || 'Failed to fetch setting');
  }
};

/**
 * Get all settings
 */
export const getAllSettings = async (): Promise<SettingRow[]> => {
  console.log('[database.getAllSettings] Fetching all settings');

  // Validate environment variables
  if (!DATABASE_ID || !SETTINGS_TABLE_ID) {
    const errorMsg = 'Database ID or Settings Table ID not configured. Please check your .env file.';
    console.error('[database.getAllSettings]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    // Fetch all settings
    const result = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: SETTINGS_TABLE_ID,
    });

    console.log('[database.getAllSettings] Query result:', {
      total: result.total,
      rowsCount: result.rows?.length || 0,
    });

    if (!result.rows || result.rows.length === 0) {
      console.log('[database.getAllSettings] No settings found');
      return [];
    }

    // Map the rows to SettingRow format
    const settings: SettingRow[] = result.rows.map((row: any) => ({
      $id: row.$id,
      key: row.key || '',
      value: row.value || '',
      description: row.description || null,
      $createdAt: row.$createdAt,
      $updatedAt: row.$updatedAt,
    }));

    console.log('[database.getAllSettings] Settings fetched successfully:', settings.length);
    return settings;
  } catch (error: any) {
    console.error('[database.getAllSettings] Error fetching settings:', error);
    console.error('[database.getAllSettings] Error message:', error?.message);
    console.error('[database.getAllSettings] Error code:', error?.code);
    throw new Error(error.message || 'Failed to fetch settings');
  }
};
