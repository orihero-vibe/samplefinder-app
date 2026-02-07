# Get User by Email - Usage Example

This document shows how to use the `/get-user-by-email` endpoint to retrieve a user's ID and information based on their email address.

## From Server (Node.js with node-appwrite)

```javascript
const appwrite = require('node-appwrite');

const client = new appwrite.Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1') // Your Appwrite Endpoint
  .setProject('YOUR_PROJECT_ID') // Your Project ID
  .setKey('YOUR_API_KEY'); // Your API Key (Server-side secret)

const users = new appwrite.Users(client);

// Get user ID by email
const userEmail = 'user@example.com';

const promise = users.list([
  appwrite.Query.equal('email', userEmail)
]);

promise.then(
  function (response) {
    if (response.users.length > 0) {
      const userId = response.users[0].$id;
      const name = response.users[0].name;
      const emailVerification = response.users[0].emailVerification;
      
      console.log('User ID:', userId);
      console.log('Name:', name);
      console.log('Email Verified:', emailVerification);
    } else {
      console.log('User not found.');
    }
  },
  function (error) {
    console.log(error);
  }
);
```

## From Client (React Native with Functions API)

```typescript
import { functions } from './lib/database/config';
import { ExecutionMethod } from 'react-native-appwrite';

interface GetUserByEmailResponse {
  success: boolean;
  userId?: string;
  name?: string;
  emailVerification?: boolean;
  error?: string;
}

export const getUserByEmail = async (email: string): Promise<GetUserByEmailResponse> => {
  try {
    const execution = await functions.createExecution({
      functionId: 'YOUR_FUNCTION_ID', // Replace with your function ID
      body: JSON.stringify({ email }),
      method: ExecutionMethod.POST,
      xpath: '/get-user-by-email',
      headers: {
        'Content-Type': 'application/json',
      },
      async: false,
    });

    if (execution.status === 'failed') {
      throw new Error('Function execution failed');
    }

    const result: GetUserByEmailResponse = JSON.parse(execution.responseBody);
    return result;
  } catch (error: any) {
    console.error('Error getting user by email:', error);
    throw error;
  }
};

// Usage example
const email = 'user@example.com';
const result = await getUserByEmail(email);

if (result.success) {
  console.log('User ID:', result.userId);
  console.log('Name:', result.name);
  console.log('Email Verified:', result.emailVerification);
} else {
  console.error('Error:', result.error);
}
```

## Request Format

**Endpoint:** `POST /get-user-by-email`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

## Response Formats

### Success Response (200)

```json
{
  "success": true,
  "userId": "5f7a1b2c3d4e5f6a7b8c9d0e",
  "name": "John Doe",
  "emailVerification": true
}
```

### Error Responses

**User Not Found (404):**
```json
{
  "success": false,
  "error": "User not found with this email address"
}
```

**Missing Email (400):**
```json
{
  "success": false,
  "error": "email is required"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Use Cases

1. **Password Recovery Flow**
   - User enters their email
   - Look up userId to initiate password recovery

2. **Admin User Management**
   - Search for users by email
   - Retrieve user information for support

3. **User Verification**
   - Check if email is registered
   - Verify email verification status

## Notes

- Email search is case-insensitive (automatically converted to lowercase)
- Email addresses are unique in Appwrite, so only one user will be returned
- Requires API key with appropriate permissions (Users read scope)
- This endpoint is server-side only and should not expose the API key to clients
