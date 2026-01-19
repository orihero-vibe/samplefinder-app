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
  if (!BUCKET_ID) {
    const errorMsg = 'Avatar bucket ID not configured. Please check your .env file.';
    console.error('[storage.uploadAvatar]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    // Create a unique file ID
    const fileId = ID.unique();
    const fileName = `avatar_${userId}_${fileId}.jpg`;

    // React Native Appwrite Storage expects a file object with uri, name, type
    // Get file info to determine type and size
    const fileExtension = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = fileExtension === 'png' ? 'image/png' : 
                     fileExtension === 'webp' ? 'image/webp' : 
                     'image/jpeg';

    // Create file object for React Native Appwrite Storage
    // Format: { uri: string, name: string, type: string, size: number }
    // Note: For React Native, we can't easily get file size before upload
    // Setting size to 0 works for react-native-appwrite as it reads the actual file
    const fileObject = {
      uri: fileUri,
      name: fileName,
      type: mimeType,
      size: 0, // Size will be determined by the SDK when reading the file
    };

    // Upload file to Appwrite Storage
    // React Native Appwrite Storage expects positional parameters: (bucketId, fileId, file, permissions?)
    let result;
    try {
      // createFile(bucketId: string, fileId: string, file: File, permissions?: string[])
      result = await storage.createFile(
        BUCKET_ID,
        fileId,
        fileObject,
        [] // Empty permissions array means use bucket-level permissions
      );
    } catch (createError: any) {
      console.error('[storage.uploadAvatar] createFile failed:', createError);
      throw createError;
    }
    
    if (result === undefined || result === null) {
      console.error('[storage.uploadAvatar] Storage API returned undefined/null without throwing error');
      throw new Error('Upload failed: Storage API returned undefined. Check bucket permissions and configuration.');
    }
    
    if (!result.$id) {
      console.error('[storage.uploadAvatar] Result missing $id');
      throw new Error('Upload failed: File ID not returned from storage');
    }

    // Get file URL for viewing
    // Construct the Appwrite Storage file URL
    const fileUrl = `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${result.$id}/view?project=${PROJECT_ID}`;

    return fileUrl;
  } catch (error: any) {
    console.error('[storage.uploadAvatar] Error uploading avatar:', error);
    
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
  if (!BUCKET_ID) {
    const errorMsg = 'Avatar bucket ID not configured. Please check your .env file.';
    console.error('[storage.deleteAvatar]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    // deleteFile(bucketId: string, fileId: string)
    await storage.deleteFile(BUCKET_ID, fileId);
  } catch (error: any) {
    console.error('[storage.deleteAvatar] Error deleting avatar:', error);
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

