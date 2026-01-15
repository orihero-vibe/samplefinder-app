# Firebase FCM Setup for Push Notifications

## What Changed

Updated the app to use **React Native Firebase** (`@react-native-firebase/messaging`) instead of Expo's notification API to get **proper FCM tokens**. This fixes the "Invalid FCM registration token" errors.

## Why This Fix Works

The previous implementation used Expo's `getDevicePushTokenAsync()` which returns:
- On Android: Sometimes returns Expo push tokens instead of native FCM tokens
- On iOS: Returns APNs tokens (not FCM tokens)

With React Native Firebase, we now get **proper FCM tokens** that work correctly with Appwrite's Messaging API.

## Setup Steps

### 1. Rebuild Your App (Required)

Since we added native modules, you **must rebuild** your app:

```bash
# Stop the current running app
# Then rebuild for iOS
npx expo prebuild --clean
npx expo run:ios

# Or for Android
npx expo run:android
```

### 2. Configure Firebase for iOS Push Notifications

For iOS push notifications to work through Firebase, you need to configure APNs in Firebase Console:

#### A. Get APNs Key from Apple Developer Portal

1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/authkeys/list)
2. Click **"+"** to create a new key
3. Enable **Apple Push Notifications service (APNs)**
4. Download the `.p8` file (you can only download it once!)
5. Note your **Team ID** (found in account membership)
6. Note your **Key ID** (shown when you create the key)

#### B. Add APNs Key to Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **Cloud Messaging** tab
4. Scroll to **Apple app configuration** section
5. Under **APNs Authentication Key**, click **Upload**
6. Upload your `.p8` file
7. Enter your **Key ID** and **Team ID**
8. Click **Upload**

### 3. Verify Firebase Configuration Files

Make sure these files exist and are properly configured:

- ✅ `google-services.json` (Android) - Already configured
- ✅ `GoogleService-Info.plist` (iOS) - Already configured
- ✅ Both files referenced in `app.json` - Already done

### 4. Test the Setup

1. Rebuild and run your app on a real device (simulators may not work reliably for push)
2. Log in to your app
3. Check the console logs for:
   ```
   [notifications] FCM token obtained: [long token string]
   [notifications] Push target created successfully
   ```

4. The FCM token should be around 150+ characters and look like:
   ```
   efrkxGPoQRWmfLPlO1y4l7:APA91bFw960wFnlxpo...
   ```

## How It Works Now

### For Android:
1. App gets FCM token from Firebase → `messaging().getToken()`
2. Registers token with Appwrite using FCM provider (`6936f46d003100bd238e`)
3. Push notifications sent through Firebase → Android device

### For iOS:
1. App gets FCM token from Firebase → `messaging().getToken()`
2. Firebase internally handles APNs communication (using the APNs key you uploaded)
3. Registers FCM token with Appwrite using FCM provider
4. Push notifications sent through Firebase → APNs → iOS device

## Common Issues & Solutions

### Issue: "No Firebase App '[DEFAULT]' has been created"
**Solution**: Rebuild your app with `npx expo prebuild --clean`

### Issue: iOS push notifications not working
**Solution**: 
- Make sure you uploaded APNs key to Firebase Console
- Test on a **real iOS device** (not simulator)
- Make sure your app's Bundle ID matches in:
  - Firebase Console
  - Apple Developer Portal
  - `app.json` → `ios.bundleIdentifier`

### Issue: Android push notifications not working
**Solution**:
- Make sure `google-services.json` is in the root directory
- Rebuild the app
- Check that Firebase project is properly set up

### Issue: Still getting "Invalid FCM registration token"
**Solution**:
1. Clear the app's cache and storage
2. Uninstall and reinstall the app
3. Log out and log back in
4. Check console logs to verify FCM token format is correct

## Testing Push Notifications

After setup, test by:
1. Triggering a notification in your app
2. Check Appwrite Console → Messaging → Logs
3. Look for successful message delivery

## Packages Installed

```json
{
  "@react-native-firebase/app": "^21.x",
  "@react-native-firebase/messaging": "^21.x"
}
```

## Code Changes Summary

1. **Added Firebase imports** to `notifications.ts`
2. **Replaced** `Notifications.getDevicePushTokenAsync()` with `messaging().getToken()`
3. **Updated token refresh listener** to use Firebase's `onTokenRefresh()`
4. **Added Firebase plugins** to `app.json`

## Next Steps

1. Rebuild your app
2. Configure APNs in Firebase Console (for iOS)
3. Test on real devices
4. Monitor Appwrite Messaging logs for any errors
