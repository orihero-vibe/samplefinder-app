# Push Notifications Setup Guide

This guide will walk you through setting up push notifications for the SampleFinder app using Firebase Cloud Messaging (FCM) and Appwrite Messaging.

## Prerequisites

- Firebase project with Cloud Messaging enabled
- Appwrite project with Messaging feature enabled
- Access to Firebase Console
- Access to Appwrite Console

## Step 1: Firebase Setup

### 1.1 Enable Firebase Cloud Messaging

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Settings** > **Project settings** > **Cloud Messaging**
4. If FCM is disabled, click the three-dots menu and open the link
5. On the following page, click **Enable** (it might take a few minutes to complete)

### 1.2 Get Firebase Service Account Key

1. In Firebase Console, go to **Project settings** > **Service accounts**
2. Click **Generate new private key**
3. Download the JSON file (this contains your service account credentials)
4. **Keep this file secure** - you'll need it for Appwrite configuration

### 1.3 Configure Firebase for iOS (if supporting iOS)

1. In Firebase Console, navigate to **Settings** > **General** > **Your apps**
2. Add an **iOS** app if not already added
3. Register and download your `GoogleService-Info.plist` config file
4. Add the file to the root of your React Native project

#### iOS APNs Configuration

1. Head to **Apple Developer Member Center** > **Program resources** > **Certificates, Identifiers & Profiles** > **Keys**
2. Create a new key with **Apple Push Notification Service** enabled
3. Note down the **Key ID** and download your key (`.p8` file)
4. In Firebase Console, go to **Settings** > **Cloud Messaging** > **APNs authentication key**
5. Click **Upload** and upload your `.p8` key file
6. Enter the **Key ID** when prompted

### 1.4 Configure Firebase for Android (if supporting Android)

1. In Firebase Console, navigate to **Settings** > **General** > **Your apps**
2. Add an **Android** app if not already added
3. Register and download your `google-services.json` config file
4. Add the file to the root of your React Native project

## Step 2: Appwrite Console Setup

### 2.1 Add FCM Provider

1. Log in to your [Appwrite Console](https://cloud.appwrite.io/)
2. Select your project
3. Navigate to **Messaging** > **Providers**
4. Click the **+ Add provider** button
5. Select **Push notification** as the message type
6. Choose **FCM** as the provider
7. Give your provider a name (e.g., "SampleFinder FCM")
8. Click **Save and continue**

### 2.2 Configure FCM Provider

1. In the **Configure** step, you'll need to provide the Firebase service account JSON
2. Open the JSON file you downloaded in Step 1.2
3. Copy the entire contents of the JSON file
4. Paste it into the **Service Account JSON** field in Appwrite
5. Click **Enable** to activate the provider

### 2.3 Verify Provider Status

1. After enabling, verify that the provider status shows as **Enabled**
2. You should see a green checkmark or "Enabled" status
3. Note the **Provider ID** - you may need this for advanced configurations

## Step 3: App Configuration

### 3.1 Update Expo Project ID

The app needs your Expo project ID to generate push tokens. Update the project ID in `src/lib/notifications.ts`:

```typescript
const tokenData = await Notifications.getExpoPushTokenAsync({
  projectId: 'your-expo-project-id', // Replace with your actual Expo project ID
});
```

To find your Expo project ID:
1. Run `npx expo whoami` to see your Expo account
2. Run `npx expo config --type public` and look for the `extra.eas.projectId` or check your `app.json`

Alternatively, you can get it from your Expo dashboard or `eas.json` file.

### 3.2 Rebuild Native Apps

After adding the `expo-notifications` plugin to `app.json`, you need to rebuild your native apps:

```bash
# For iOS
npx expo prebuild --clean
npx expo run:ios

# For Android
npx expo prebuild --clean
npx expo run:android
```

Or if using EAS Build:

```bash
eas build --platform ios
eas build --platform android
```

## Step 4: Testing

### 4.1 Test Push Target Registration

1. Log in to the app
2. Check the console logs for:
   - `[notifications] Notification permissions granted`
   - `[notifications] Expo push token obtained`
   - `[notifications] Push target created successfully`

### 4.2 Send Test Notification from Appwrite Console

1. In Appwrite Console, go to **Messaging** > **Messages**
2. Click **+ Create message** > **Push notification**
3. Fill in:
   - **Title**: Test Notification
   - **Body**: This is a test message
4. In the **Targets** step, select your test device
5. Set schedule to **Now**
6. Click **Send**
7. Verify you receive the notification on your device

### 4.3 Test Notification Handling

1. **Foreground**: Open the app and send a notification - it should appear as an in-app notification
2. **Background**: Close the app and send a notification - it should appear as a system notification
3. **Tap Navigation**: Tap a notification with navigation data - it should navigate to the appropriate screen

## Step 5: Server-Side Integration (Future)

To send notifications programmatically from your backend:

### 5.1 Using Appwrite Functions

Create an Appwrite Function that uses the Server SDK:

```javascript
const sdk = require('node-appwrite');

const client = new sdk.Client();
const messaging = new sdk.Messaging(client);

client
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>')
  .setKey('<API_KEY>');

// Send push notification
const message = await messaging.createPush({
  messageId: sdk.ID.unique(),
  title: 'Event Reminder',
  body: 'Your favorite event starts in 1 hour!',
  users: ['<USER_ID>'], // or use targets: ['<TARGET_ID>']
  data: {
    type: 'eventReminder',
    screen: 'EventDetails',
    eventId: '<EVENT_ID>',
  },
});
```

### 5.2 Respect User Preferences

Before sending notifications, check user preferences stored in the database:

```javascript
// Get user notification preferences
const userProfile = await getUserProfile(userId);
const preferences = userProfile.notificationPreferences;

// Only send if user has enabled this type of notification
if (preferences.eventReminders) {
  // Send event reminder notification
}
```

## Troubleshooting

### Push Token Not Generated

- **Issue**: `[notifications] Could not get push token`
- **Solution**: 
  - Verify notification permissions are granted
  - Check that Expo project ID is correct
  - Ensure `expo-notifications` is properly installed
  - Rebuild native apps after adding the plugin

### Push Target Not Created

- **Issue**: `[notifications] Could not register push target`
- **Solution**:
  - Verify user is logged in
  - Check Appwrite project ID and endpoint are correct
  - Verify FCM provider is enabled in Appwrite Console
  - Check network connectivity

### Notifications Not Received

- **Issue**: Notifications sent but not received on device
- **Solution**:
  - Verify push target is registered in Appwrite
  - Check device has internet connection
  - Verify notification permissions are granted
  - Check Firebase Cloud Messaging is enabled
  - For iOS: Verify APNs key is uploaded to Firebase
  - Check Appwrite provider status is "Enabled"

### Navigation Not Working

- **Issue**: Tapping notification doesn't navigate
- **Solution**:
  - Verify notification data includes `screen` field
  - Check navigation ref is set in AppNavigator
  - Verify screen names match your navigation structure
  - Check console logs for navigation errors

## Additional Resources

- [Appwrite Messaging Documentation](https://appwrite.io/docs/products/messaging)
- [Appwrite FCM Provider Guide](https://appwrite.io/docs/products/messaging/fcm)
- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)

## Support

If you encounter issues not covered in this guide:

1. Check Appwrite Console logs for errors
2. Check Firebase Console for delivery status
3. Review app console logs for detailed error messages
4. Verify all configuration steps were completed correctly

