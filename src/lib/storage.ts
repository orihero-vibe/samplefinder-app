import { Storage, ID } from 'react-native-appwrite';
import appwriteClient from './appwrite';
import { APPWRITE_BUCKET_ID, APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from '@env';

const BUCKET_ID = APPWRITE_BUCKET_ID || '';
const ENDPOINT = APPWRITE_ENDPOINT || '';
const PROJECT_ID = APPWRITE_PROJECT_ID || '';

const storage = new Storage(appwriteClient);

/**
 * Upload avatar image to Appwrite Storage
 * @param fileUri - Local file URI from image picker
 * @param userId - User ID to associate the file with
 * @returns Promise with the file URL
 */
export const uploadAvatar = async (fileUri: string, userId: string): Promise<string> => {
  console.log('[storage.uploadAvatar] Starting avatar upload');
  console.log('[storage.uploadAvatar] File URI:', fileUri);
  console.log('[storage.uploadAvatar] User ID:', userId);
  console.log('[storage.uploadAvatar] Bucket ID:', BUCKET_ID);

  if (!BUCKET_ID) {
    const errorMsg = 'Avatar bucket ID not configured. Please check your .env file.';
    console.error('[storage.uploadAvatar]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    // Create a unique file ID
    const fileId = ID.unique();
    const fileName = `avatar_${userId}_${fileId}.jpg`;

    console.log('[storage.uploadAvatar] Uploading file:', fileName);

    // React Native Appwrite Storage expects a file object with uri, name, type
    // Get file info to determine type and size
    const fileExtension = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = fileExtension === 'png' ? 'image/png' : 
                     fileExtension === 'webp' ? 'image/webp' : 
                     'image/jpeg';

    // Create file object for React Native Appwrite Storage
    // Format: { uri: string, name: string, type: string }
    const fileObject = {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    };

    // Upload file to Appwrite Storage
    // React Native Appwrite Storage expects a file object
    console.log('[storage.uploadAvatar] Uploading with file object:', JSON.stringify(fileObject, null, 2));
    console.log('[storage.uploadAvatar] Storage instance:', storage);
    console.log('[storage.uploadAvatar] Storage methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(storage)));
    
    let result;
    try {
      // Try with fileId first
      console.log('[storage.uploadAvatar] Attempting createFile with fileId...');
      result = await storage.createFile({
        bucketId: BUCKET_ID,
        fileId: fileId,
        file: fileObject,
      });
      console.log('[storage.uploadAvatar] createFile resolved with fileId');
    } catch (createError: any) {
      console.error('[storage.uploadAvatar] createFile with fileId failed:', createError);
      console.error('[storage.uploadAvatar] createFile error message:', createError?.message);
      console.error('[storage.uploadAvatar] createFile error code:', createError?.code);
      console.error('[storage.uploadAvatar] createFile error type:', typeof createError);
      console.error('[storage.uploadAvatar] createFile error keys:', Object.keys(createError || {}));
      
      // If it failed, try without fileId (let Appwrite generate it)
      console.log('[storage.uploadAvatar] Retrying without fileId...');
      try {
        result = await storage.createFile({
          bucketId: BUCKET_ID,
          file: fileObject,
        });
        console.log('[storage.uploadAvatar] createFile resolved without fileId');
      } catch (retryError: any) {
        console.error('[storage.uploadAvatar] createFile without fileId also failed:', retryError);
        throw createError; // Throw original error
      }
    }

    console.log('[storage.uploadAvatar] Upload result:', result);
    console.log('[storage.uploadAvatar] Upload result type:', typeof result);
    console.log('[storage.uploadAvatar] Upload result is null?', result === null);
    console.log('[storage.uploadAvatar] Upload result is undefined?', result === undefined);
    
    if (result === undefined || result === null) {
      console.error('[storage.uploadAvatar] Storage API returned undefined/null without throwing error');
      throw new Error('Upload failed: Storage API returned undefined. Check bucket permissions and configuration.');
    }
    
    console.log('[storage.uploadAvatar] Result keys:', Object.keys(result));
    
    if (!result.$id) {
      console.error('[storage.uploadAvatar] Result missing $id. Full result:', JSON.stringify(result, null, 2));
      throw new Error('Upload failed: File ID not returned from storage');
    }

    console.log('[storage.uploadAvatar] File uploaded successfully:', result.$id);

    // Get file URL for viewing
    // Construct the Appwrite Storage file URL
    const fileUrl = `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${result.$id}/view?project=${PROJECT_ID}`;
    
    console.log('[storage.uploadAvatar] File URL:', fileUrl);

    return fileUrl;
  } catch (error: any) {
    console.error('[storage.uploadAvatar] Error uploading avatar:', error);
    console.error('[storage.uploadAvatar] Error message:', error?.message);
    console.error('[storage.uploadAvatar] Error code:', error?.code);
    console.error('[storage.uploadAvatar] Error response:', error?.response);
    console.error('[storage.uploadAvatar] Full error:', JSON.stringify(error, null, 2));
    
    // Provide more specific error messages
    if (error?.code === 401 || error?.message?.includes('Unauthorized')) {
      throw new Error('Authentication failed. Please ensure you are logged in.');
    }
    if (error?.code === 404) {
      throw new Error('Storage bucket not found. Please check your bucket ID configuration.');
    }
    if (error?.message?.includes('permission') || error?.message?.includes('Permission')) {
      throw new Error('Permission denied. Please check bucket permissions.');
    }
    
    throw new Error(error?.message || 'Failed to upload avatar. Please try again.');
  }
};

/**
 * Delete avatar from Appwrite Storage
 * @param fileId - File ID to delete
 */
export const deleteAvatar = async (fileId: string): Promise<void> => {
  console.log('[storage.deleteAvatar] Deleting avatar:', fileId);

  if (!BUCKET_ID) {
    const errorMsg = 'Avatar bucket ID not configured. Please check your .env file.';
    console.error('[storage.deleteAvatar]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    await storage.deleteFile({
      bucketId: BUCKET_ID,
      fileId: fileId,
    });

    console.log('[storage.deleteAvatar] Avatar deleted successfully');
  } catch (error: any) {
    console.error('[storage.deleteAvatar] Error deleting avatar:', error);
    console.error('[storage.deleteAvatar] Error message:', error?.message);
    // Don't throw if file doesn't exist
    if (error?.code !== 404) {
      throw new Error(error.message || 'Failed to delete avatar');
    }
  }
};

/**
 * Extract file ID from avatar URL
 */
export const extractFileIdFromUrl = (url: string): string | null => {
  try {
    // Appwrite Storage URL format: .../buckets/{bucketId}/files/{fileId}/view?...
    const match = url.match(/\/files\/([^\/]+)\//);
    return match ? match[1] : null;
  } catch (error) {
    console.error('[storage.extractFileIdFromUrl] Error extracting file ID:', error);
    return null;
  }
};

export default {
  uploadAvatar,
  deleteAvatar,
  extractFileIdFromUrl,
};

