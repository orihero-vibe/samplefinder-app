import { ID, Query } from 'react-native-appwrite';
import { tablesDB, DATABASE_ID, USER_PROFILES_TABLE_ID } from './config';
import type { UserProfileData, UserProfileRow } from './types';

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

