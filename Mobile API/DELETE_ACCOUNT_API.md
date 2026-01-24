# Delete Account API Documentation

This document describes the account deletion endpoint available in the Mobile API Appwrite function.

## Overview

The `/delete-account` endpoint provides a secure server-side method to completely delete a user's account from the Appwrite authentication system. This is necessary because the Appwrite client SDK does not allow direct account deletion for security reasons.

## Base URL

```
https://nyc.cloud.appwrite.io/v1/functions/69308117000e7a96bcbb/executions
```

## Authentication

All requests require the Appwrite session or JWT token for authentication.

---

## Endpoint

### Delete User Account

Permanently deletes a user account from Appwrite Auth and associated database profile.

#### Endpoint

```
POST /delete-account
```

#### Request Body

| Field    | Type   | Required | Description                                                   |
| -------- | ------ | -------- | ------------------------------------------------------------- |
| `userId` | string | Yes      | The user's profile document ID from the `user_profiles` table |

#### Example Request

```json
{
  "userId": "user_profile_id_here"
}
```

#### Success Response (200)

```json
{
  "success": true,
  "message": "Account successfully deleted"
}
```

#### Response Fields

| Field     | Type    | Description                             |
| --------- | ------- | --------------------------------------- |
| `success` | boolean | Indicates if the deletion was successful |
| `message` | string  | Confirmation message                    |

#### What Gets Deleted

When this endpoint is called, the following data is automatically deleted:

1. **User Profile** - The user's document in the `user_profiles` database table (deleted first)
2. **Appwrite Auth User** - The user account from Appwrite's authentication system
3. **User Sessions** - All active sessions and tokens (automatically deleted with auth user)
4. **Push Targets** - Push notification targets (handled by client before calling this endpoint)

> **Note:** This operation is **irreversible**. All user data will be permanently deleted.

#### Deletion Order

The deletion happens in this specific order to ensure data consistency:

1. **Verify** - Check that the user exists in Appwrite Auth
2. **Query Database Profile** - Find the user's profile document by querying the `authID` field
   - Note: The profile document ID is different from the auth user ID
   - The auth user ID is stored in the `authID` field of the profile document
3. **Delete Database Profile** - Remove the user's profile from the `user_profiles` collection
   - If no profile is found, the deletion continues
   - If there's any error during query or deletion, the entire operation is aborted
4. **Delete Auth User** - Remove the user from Appwrite Auth (this cascades to sessions and tokens)

#### Error Responses

| Status | Error                                        | Description                                |
| ------ | -------------------------------------------- | ------------------------------------------ |
| 400    | `userId is required`                         | Missing userId in request body             |
| 404    | `User not found in authentication system`    | Invalid userId                             |
| 500    | `Failed to delete user profile: ...`         | Error deleting user profile from database  |
| 500    | `Server configuration error: API key missing` | Server configuration issue                |

---

## Security Considerations

### Why Server-Side Deletion?

The Appwrite client SDK (`react-native-appwrite`) does not provide a method to delete user accounts directly from the client side. This is by design for security reasons:

1. **Prevent Unauthorized Deletion** - Only server-side code with admin privileges can delete users
2. **Audit Trail** - Server-side functions can log deletion requests for compliance
3. **Data Integrity** - Ensures proper cleanup of related data before deletion

### API Key Requirements

This endpoint requires an Appwrite API key with the following permissions:

- `users.read` - To verify the user exists
- `users.write` - To delete the user from Auth
- `databases.read` - To access user profile
- `databases.write` - To delete user profile

The API key is automatically provided by Appwrite Functions via environment variables.

---

## Usage Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   DELETE ACCOUNT FLOW                       │
└─────────────────────────────────────────────────────────────┘

1. User clicks "Delete Account" in app settings
         │
         ▼
┌─────────────────────────────────────┐
│  Show confirmation dialog           │
│  "Are you sure?"                    │
└─────────────────────────────────────┘
         │
         ▼ (User confirms)
┌─────────────────────────────────────┐
│  Client deletes push targets        │
│  (if any exist)                     │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  POST /delete-account               │
│  { "userId": "xxx" }                │
└─────────────────────────────────────┘
         │
         ▼
   ┌─────────────────────┐
   │  Server Function    │
   │  1. Verify user     │
   │  2. Delete profile  │
   │  3. Delete auth user│
   └─────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Client deletes local sessions      │
│  (logout)                           │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Redirect to login/welcome screen   │
└─────────────────────────────────────┘
```

---

## Code Examples

### React Native (using Appwrite SDK)

#### Setup Client

```typescript
import { Client, Functions } from 'react-native-appwrite';

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('691d4a54003b21bf0136');

const functions = new Functions(client);
```

#### Delete Account Function

```typescript
async function deleteUserAccount(userId: string): Promise<void> {
  try {
    const execution = await functions.createExecution({
      functionId: '69308117000e7a96bcbb',
      body: JSON.stringify({ userId }),
      method: 'POST',
      xpath: '/delete-account',
      headers: {
        'Content-Type': 'application/json',
      },
      async: false, // Wait for completion
    });

    // Check execution status
    if (execution.status === 'failed') {
      let errorMessage = 'Failed to delete account';
      if (execution.responseBody) {
        try {
          const errorResponse = JSON.parse(execution.responseBody);
          errorMessage = errorResponse.error || errorResponse.message || execution.responseBody;
        } catch {
          errorMessage = execution.responseBody;
        }
      }
      throw new Error(errorMessage);
    }

    // Parse response
    if (execution.responseBody) {
      const result = JSON.parse(execution.responseBody);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete account');
      }
      console.log('Account deleted successfully:', result.message);
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
}

// Usage
await deleteUserAccount('user_profile_id_here');
```

#### Complete Implementation with Auth Context

```typescript
import { useState } from 'react';
import { Alert } from 'react-native';
import { Client, Functions, Account } from 'react-native-appwrite';

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('691d4a54003b21bf0136');

const functions = new Functions(client);
const account = new Account(client);

export function useDeleteAccount() {
  const [loading, setLoading] = useState(false);

  const deleteAccount = async (userId: string) => {
    setLoading(true);

    try {
      // Step 1: Delete push targets (if using notifications)
      console.log('Deleting push targets...');
      try {
        // Implement push target deletion if needed
        // await deletePushTarget();
      } catch (pushError) {
        console.warn('Failed to delete push target:', pushError);
        // Continue with account deletion
      }

      // Step 2: Call server function to delete auth account
      console.log('Calling server function to delete account...');
      const execution = await functions.createExecution({
        functionId: '69308117000e7a96bcbb',
        body: JSON.stringify({ userId }),
        method: 'POST',
        xpath: '/delete-account',
        headers: {
          'Content-Type': 'application/json',
        },
        async: false,
      });

      if (execution.status === 'failed') {
        let errorMessage = 'Failed to delete account';
        if (execution.responseBody) {
          try {
            const errorResponse = JSON.parse(execution.responseBody);
            errorMessage = errorResponse.error || execution.responseBody;
          } catch {
            errorMessage = execution.responseBody;
          }
        }
        throw new Error(errorMessage);
      }

      const result = JSON.parse(execution.responseBody);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete account');
      }

      // Step 3: Delete local sessions (logout)
      console.log('Deleting local sessions...');
      await account.deleteSessions();

      console.log('Account deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', error.message || 'Failed to delete account. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteAccount, loading };
}
```

#### Usage in React Native Component

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useDeleteAccount } from './hooks/useDeleteAccount';
import { useAuth } from './contexts/AuthContext';

function DeleteAccountButton() {
  const { deleteAccount, loading } = useDeleteAccount();
  const { user, logout } = useAuth();

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user?.$id) {
              Alert.alert('Error', 'No user is currently logged in');
              return;
            }

            const success = await deleteAccount(user.$id);
            if (success) {
              // Navigate to welcome/login screen
              // navigation.navigate('Welcome');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <ActivityIndicator size="small" color="red" />;
  }

  return (
    <TouchableOpacity onPress={handleDeleteAccount}>
      <Text style={{ color: 'red' }}>Delete Account</Text>
    </TouchableOpacity>
  );
}
```

---

## Testing

### Manual Testing Steps

1. **Create a test user** in your app
2. **Verify the user exists** in Appwrite Console → Auth → Users
3. **Call the delete endpoint** with the user's ID
4. **Verify deletion**:
   - User no longer appears in Appwrite Console → Auth → Users
   - User profile deleted from `user_profiles` table
   - App successfully logs out the user

### Test Cases

#### Success Case

```bash
# Request
POST /delete-account
{
  "userId": "valid_user_id"
}

# Expected Response
{
  "success": true,
  "message": "Account successfully deleted"
}
```

#### Missing User ID

```bash
# Request
POST /delete-account
{}

# Expected Response
{
  "success": false,
  "error": "userId is required"
}
```

#### Invalid User ID

```bash
# Request
POST /delete-account
{
  "userId": "non_existent_user"
}

# Expected Response (404)
{
  "success": false,
  "error": "User not found in authentication system"
}
```

---

## Troubleshooting

### Common Issues

#### Issue: "Server configuration error: API key missing"

**Cause:** The Appwrite Function doesn't have the required API key configured.

**Solution:** Ensure your Appwrite Function has an API key with `users.write` permission:

1. Go to Appwrite Console → Functions → Your Function
2. Navigate to Settings → Variables
3. Verify `APPWRITE_FUNCTION_KEY` is set (automatically provided by Appwrite)

#### Issue: "User not found in authentication system"

**Cause:** The provided `userId` doesn't exist in Appwrite Auth.

**Solution:** Verify the user ID is correct and the user hasn't already been deleted.

#### Issue: "Failed to delete user profile"

**Cause:** Error occurred while attempting to find or delete the user profile from the database. This could be due to:
- Insufficient database permissions (need read permission to query, write permission to delete)
- Network connectivity issues
- Database service temporarily unavailable
- Multiple profile documents exist for the same user (data integrity issue)

**Solution:** 
1. Check the function logs for detailed error information
2. Verify the API key has `databases.read` and `databases.write` permissions for the `user_profiles` collection
3. Ensure the database service is operational
4. Check for duplicate profiles with the same `authID` field

**Technical Details:** The function queries the `user_profiles` collection by the `authID` field (not document ID) to find the user's profile, then deletes the matching document(s).

---

## GDPR Compliance

This endpoint helps maintain GDPR compliance by providing users with the "Right to Erasure" (Right to be Forgotten):

- ✅ Complete user data deletion
- ✅ Irreversible operation
- ✅ Server-side logging for audit trail
- ✅ Immediate effect (no grace period)

For production use, consider:

1. **Audit Logging** - Log all deletion requests with timestamps
2. **Grace Period** - Optionally implement a 30-day account deactivation before permanent deletion
3. **Data Export** - Offer users ability to export their data before deletion
4. **Confirmation** - Require re-authentication before allowing deletion

---

## Related Documentation

- [Trivia API Documentation](./TRIVIA_API.md) - For trivia-related endpoints
- [Appwrite Users API](https://appwrite.io/docs/references/cloud/server-nodejs/users) - Server SDK documentation
- [Appwrite Functions](https://appwrite.io/docs/products/functions) - Functions documentation
