# Testing Account Deletion

## Steps to Debug

### 1. Check Appwrite Console Before Deletion

1. Go to Appwrite Console → Auth → Users
2. Find the user you want to delete
3. **Copy the User ID** (e.g., `67890abc123def`)

4. Go to Appwrite Console → Databases → Your Database → `user_profiles` table
5. Look for the user's profile
6. **Check these details:**
   - Document ID (e.g., `xyz123abc456`)
   - The `authID` field value (should match the User ID from step 3)

### 2. Deploy Updated Function

The function now has enhanced logging. Deploy it:

```bash
cd "Mobile API"
# Deploy via Appwrite Console or CLI
```

### 3. Test Account Deletion

In your app, trigger the account deletion for the test user.

### 4. Check Function Logs

Go to Appwrite Console → Functions → Your Function → Executions → Latest Execution

Look for these log messages:

```
✅ EXPECTED SUCCESS LOGS:
- "Starting account deletion for user: [userId]"
- "User [userId] found in Auth"
- "Attempting to find user profile by authID: [userId]"
- "Database ID: 69217af50038b9005a61, Table ID: user_profiles"
- "Profile query completed. Total found: 1"
- "Found 1 profile(s) to delete"
- "Profile document details: ID=[documentId], authID=[userId]"
- "Attempting to delete user profile document: [documentId]"
- "User profile deleted successfully: [documentId]"
- "Deleted 1 user profile(s) from database"
- "Deleting user from Appwrite Auth: [userId]"
- "User [userId] successfully deleted from Appwrite Auth"

❌ ERROR SCENARIOS:

Scenario A: Profile not found
- "Profile query completed. Total found: 0"
- "No user profile found with authID: [userId]"
→ This means the authID field doesn't match or the profile doesn't exist

Scenario B: Query error
- "Error during profile deletion process"
- Check the error details in the logs

Scenario C: Permission error
- "Error code: 401" or "Error code: 403"
→ API key doesn't have proper permissions
```

### 5. Verify Deletion

After successful execution:

1. **Check Auth:** User should be gone from Auth → Users
2. **Check Database:** User profile should be gone from `user_profiles` table

## Common Issues

### Issue 1: "Total found: 0" but profile exists

**Possible causes:**
1. The `authID` field name is different in your database (check if it's `authId`, `auth_id`, `user_id`, etc.)
2. The authID value doesn't match the user's auth ID

**Solution:**
Check your database schema in Appwrite Console and verify the exact field name.

### Issue 2: Permission denied

**Possible causes:**
1. API key doesn't have `databases.read` permission
2. API key doesn't have `databases.write` permission
3. API key doesn't have `users.write` permission

**Solution:**
Go to Appwrite Console → Project Settings → API Keys → Check your function's API key permissions.

### Issue 3: User deleted from Auth but profile remains

This shouldn't happen with the new code because we delete the profile BEFORE deleting from Auth.

If this happens, check the function logs to see where it failed.

## Manual Cleanup

If you need to manually delete a profile that's stuck:

1. Go to Appwrite Console → Databases → `user_profiles`
2. Find the document by the `authID` field
3. Delete it manually

## Debugging Tips

### Get User's Auth ID

In your app, add this logging before calling delete:

```typescript
const user = await getCurrentUser();
console.log('Deleting user with Auth ID:', user.$id);
```

### Check Database Field Name

Run this query in your app to see the actual field names:

```typescript
import { databases } from './lib/database/config';

const profile = await databases.listDocuments(
  '69217af50038b9005a61',
  'user_profiles',
  [Query.limit(1)]
);

console.log('Profile document structure:', profile.documents[0]);
console.log('Available fields:', Object.keys(profile.documents[0]));
```

This will show you the exact field names used in your database.
