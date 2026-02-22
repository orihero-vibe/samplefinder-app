import { Query } from 'react-native-appwrite';
import { tablesDB, DATABASE_ID, LOCATIONS_TABLE_ID } from './config';
import type { LocationRow } from './types';

/**
 * Fetch all locations
 * Returns all locations from the locations table
 */
export const fetchLocations = async (): Promise<LocationRow[]> => {
  console.log('[database.fetchLocations] Fetching all locations');

  // Validate environment variables
  if (!DATABASE_ID || !LOCATIONS_TABLE_ID) {
    const errorMsg = 'Database ID or Locations Table ID not configured. Please check your .env file.';
    console.error('[database.fetchLocations]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    // Fetch all locations
    const result = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: LOCATIONS_TABLE_ID,
      queries: [Query.limit(1000)], // Fetch up to 1000 locations
    });

    console.log('[database.fetchLocations] Query result:', {
      total: result.total,
      rowsCount: result.rows?.length || 0,
    });

    if (!result.rows || result.rows.length === 0) {
      console.log('[database.fetchLocations] No locations found');
      return [];
    }

    // Map the rows to LocationRow format
    const locations: LocationRow[] = result.rows.map((row: any) => {
      // Extract location from point field - format: [longitude, latitude]
      let location: [number, number] = [0, 0];
      if (row.location) {
        if (Array.isArray(row.location) && row.location.length >= 2) {
          location = [row.location[0], row.location[1]];
        } else if (row.location?.coordinates && Array.isArray(row.location.coordinates)) {
          location = [row.location.coordinates[0], row.location.coordinates[1]];
        }
      }

      return {
        $id: row.$id,
        name: row.name || '',
        address: row.address || '',
        city: row.city || '',
        state: row.state || '',
        zipCode: row.zipCode || '',
        location,
        $createdAt: row.$createdAt,
        $updatedAt: row.$updatedAt,
      };
    });

    console.log('[database.fetchLocations] Locations fetched successfully:', locations.length);
    return locations;
  } catch (error: any) {
    console.error('[database.fetchLocations] Error fetching locations:', error);
    console.error('[database.fetchLocations] Error message:', error?.message);
    console.error('[database.fetchLocations] Error code:', error?.code);
    throw new Error(error.message || 'Failed to fetch locations');
  }
};

/**
 * Fetch a single location by ID
 */
export const fetchLocationById = async (locationId: string): Promise<LocationRow | null> => {
  console.log('[database.fetchLocationById] Fetching location:', locationId);

  // Validate environment variables
  if (!DATABASE_ID || !LOCATIONS_TABLE_ID) {
    const errorMsg = 'Database ID or Locations Table ID not configured. Please check your .env file.';
    console.error('[database.fetchLocationById]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const result = await tablesDB.getRow({
      databaseId: DATABASE_ID,
      tableId: LOCATIONS_TABLE_ID,
      rowId: locationId,
    });

    if (!result) {
      console.log('[database.fetchLocationById] Location not found:', locationId);
      return null;
    }

    // Extract location from point field - format: [longitude, latitude]
    let location: [number, number] = [0, 0];
    if (result.location) {
      if (Array.isArray(result.location) && result.location.length >= 2) {
        location = [result.location[0], result.location[1]];
      } else if (result.location?.coordinates && Array.isArray(result.location.coordinates)) {
        location = [result.location.coordinates[0], result.location.coordinates[1]];
      }
    }

    const locationRow: LocationRow = {
      $id: result.$id,
      name: result.name || '',
      address: result.address || '',
      city: result.city || '',
      state: result.state || '',
      zipCode: result.zipCode || '',
      location,
      $createdAt: result.$createdAt,
      $updatedAt: result.$updatedAt,
    };

    console.log('[database.fetchLocationById] Location fetched successfully:', locationRow.$id);
    return locationRow;
  } catch (error: any) {
    console.error('[database.fetchLocationById] Error fetching location:', error);
    console.error('[database.fetchLocationById] Error message:', error?.message);
    console.error('[database.fetchLocationById] Error code:', error?.code);
    throw new Error(error.message || 'Failed to fetch location');
  }
};
