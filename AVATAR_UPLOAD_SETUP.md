# Avatar Upload Implementation

## Overview

The EditProfileScreen has been fully implemented with avatar upload functionality using Appwrite Storage and expo-image-picker.

## What Was Implemented

### 1. **Storage Utility** (`src/lib/storage.ts`)
   - `uploadAvatar()` - Uploads avatar images to Appwrite Storage
   - `deleteAvatar()` - Deletes avatar images from storage
   - `extractFileIdFromUrl()` - Helper to extract file ID from URL

### 2. **EditProfileScreen Updates** (`src/screens/tabs/EditProfileScreen.tsx`)
   - ✅ Rounded border avatar container (120x120 circular)
   - ✅ Photo icon overlay in bottom-right corner
   - ✅ Entire avatar area is pressable
   - ✅ Image picker integration (camera & photo library)
   - ✅ Avatar upload to Appwrite Storage
   - ✅ Avatar display from URL
   - ✅ Remove photo functionality
   - ✅ Loading states during upload

### 3. **Image Picker Features**
   - Choose from Camera or Photo Library
   - Image cropping (1:1 aspect ratio)
   - Quality optimization (80%)
   - Permission handling for camera and photo library

### 4. **UI Enhancements**
   - Circular avatar with rounded border (4px border, brand color)
   - Camera icon badge in bottom-right corner
   - Loading indicator during upload
   - Placeholder with account icon when no avatar
   - Remove photo option when avatar exists

## Required Setup

### 1. **Appwrite Storage Bucket**

You need to create a Storage Bucket in your Appwrite console:

1. Go to **Storage** in your Appwrite console
2. Create a new bucket named `avatars` (or your preferred name)
3. Configure the bucket:
   - **Bucket ID**: Copy this for your `.env` file
   - **File Size Limit**: Set appropriate limit (e.g., 5MB)
   - **Allowed File Extensions**: `jpg`, `jpeg`, `png`, `webp`
   - **Encryption**: Optional
   - **Anti-virus**: Recommended

4. **Set Bucket Permissions**:
   - Users should be able to:
     - **Create** files: `users` (or `any`)
     - **Read** files: `any` (for public viewing)
     - **Update** files: `users` (optional, for future updates)
     - **Delete** files: `users`

### 2. **Environment Variables**

Add the following to your `.env` file:

```env
APPWRITE_AVATAR_BUCKET_ID=your_bucket_id_here
```

**Example:**
```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_DATABASE_ID=your_database_id
APPWRITE_USER_PROFILES_TABLE_ID=your_table_id
APPWRITE_AVATAR_BUCKET_ID=avatars  # Your bucket ID
```

### 3. **Database Field**

The `user_profiles` table already has the `avatarURL` field defined in the code. Ensure this field exists in your Appwrite database:

- **Field Name**: `avatarURL`
- **Type**: String
- **Required**: No
- **Size**: 500 (to accommodate full URLs)

## User Profile Field

The implementation uses the `avatarURL` field from the `UserProfileRow` interface:

```typescript
export interface UserProfileRow extends UserProfileData {
  // ... other fields
  avatarURL?: string | null;
  // ... other fields
}
```

This field stores the full Appwrite Storage URL for the avatar image.

## File Structure

```
src/
├── lib/
│   ├── storage.ts          # NEW: Storage utility functions
│   ├── database.ts         # Updated: Already has avatarURL support
│   └── auth.ts             # No changes needed
├── screens/
│   └── tabs/
│       └── EditProfileScreen.tsx  # Updated: Full avatar implementation
└── types/
    └── env.d.ts            # Updated: Added APPWRITE_AVATAR_BUCKET_ID
```

## How It Works

1. **User taps avatar** → Image picker dialog appears
2. **User selects source** → Camera or Photo Library
3. **User picks/captures image** → Image is cropped to 1:1 ratio
4. **Image uploads** → Uploads to Appwrite Storage bucket
5. **Profile updates** → `avatarURL` field updated in database
6. **Avatar displays** → Shows uploaded image from URL

## Permissions

The following permissions have been added to `app.json`:

### iOS (`infoPlist`):
- `NSPhotoLibraryUsageDescription`
- `NSCameraUsageDescription`

### Android (`permissions`):
- `READ_EXTERNAL_STORAGE`
- `WRITE_EXTERNAL_STORAGE`
- `CAMERA`

## Testing

1. **Create Storage Bucket** in Appwrite console
2. **Add bucket ID** to `.env` file
3. **Run the app** and navigate to Edit Profile
4. **Tap the avatar** area
5. **Select/Capture photo**
6. **Verify upload** and display

## Notes

- The avatar is displayed as a circular image with a rounded border
- The camera icon appears as an overlay in the bottom-right corner
- Old avatars are automatically deleted when a new one is uploaded
- The entire avatar container is pressable for better UX
- Image quality is optimized to 80% to reduce file size

## Troubleshooting

**Image not uploading:**
- Check that `APPWRITE_AVATAR_BUCKET_ID` is set in `.env`
- Verify bucket permissions allow users to create files
- Check file size limits in bucket settings

**Image not displaying:**
- Verify bucket permissions allow public read access
- Check that the URL is correctly formatted
- Ensure the avatarURL field is being saved correctly

**Permissions denied:**
- Check that permissions are added to `app.json`
- On iOS, permissions are requested at runtime
- On Android, permissions are declared in manifest

## Future Enhancements

- [ ] Image compression before upload
- [ ] Progress indicator during upload
- [ ] Multiple image format support
- [ ] Image cropping with custom aspect ratios
- [ ] Avatar preview before upload

