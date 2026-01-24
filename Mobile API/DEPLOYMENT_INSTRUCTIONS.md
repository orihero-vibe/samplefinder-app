# 🚀 Deployment Instructions for Updated Delete Account Function

## What Was Fixed

The user profile deletion now works by:
1. **Querying** the `user_profiles` table by the `authID` field (not document ID)
2. **Finding** the actual profile document ID
3. **Deleting** the profile using the correct document ID
4. **Then deleting** the user from Appwrite Auth

## Files Updated

- ✅ `src/main.ts` - Updated delete function with proper query logic
- ✅ `src/main.js` - Compiled (built) JavaScript file
- ✅ Added enhanced logging for debugging

## How to Deploy

### Option 1: Deploy via Appwrite Console (Recommended)

1. **Open Appwrite Console**
   - Go to your project
   - Navigate to **Functions**
   - Click on your Mobile API function

2. **Update the Function**
   - Go to the **Settings** tab
   - Find the code editor or file upload section
   - Upload the updated `src/main.js` file
   - OR: Copy the contents of `src/main.js` and paste it into the code editor

3. **Deploy**
   - Click **Deploy** or **Save**
   - Wait for deployment to complete

### Option 2: Deploy via Appwrite CLI

```bash
cd "Mobile API"

# If using Appwrite CLI (if installed)
appwrite functions updateDeployment \
  --functionId 69308117000e7a96bcbb \
  --activate true
```

### Option 3: Git Push (if configured)

If your function is connected to a Git repository:

```bash
cd ..
git add "Mobile API/src/main.js" "Mobile API/src/main.ts"
git commit -m "Fix: User profile deletion now queries by authID field"
git push origin main
```

Appwrite will automatically rebuild and deploy.

## Verify Deployment

### 1. Check Function Version

In Appwrite Console → Functions → Your Function:
- Check the **last deployment time**
- It should show a recent timestamp

### 2. Test the Ping Endpoint

```bash
curl https://nyc.cloud.appwrite.io/v1/functions/69308117000e7a96bcbb/executions \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: 691d4a54003b21bf0136" \
  -X POST \
  -d '{"path":"/ping","method":"GET"}'
```

Should return: `Pong`

### 3. Test Account Deletion

In your mobile app:
1. Create a test user account
2. Note the user's auth ID
3. Try to delete the account
4. **Check the function logs** in Appwrite Console

Expected log output:
```
Starting account deletion for user: [userId]
User [userId] found in Auth
Attempting to find user profile by authID: [userId]
Database ID: 69217af50038b9005a61, Table ID: user_profiles
Profile query completed. Total found: 1
Found 1 profile(s) to delete
Profile document details: ID=[documentId], authID=[userId]
Attempting to delete user profile document: [documentId]
User profile deleted successfully: [documentId]
Deleted 1 user profile(s) from database
Deleting user from Appwrite Auth: [userId]
User [userId] successfully deleted from Appwrite Auth
```

## Troubleshooting

### "Profile query completed. Total found: 0"

This means no profile was found with the given authID.

**Solutions:**
1. Check if the profile actually exists in the database
2. Verify the `authID` field name in your database schema
3. Check if the authID value matches the user's auth ID

### "Error code: 401" or "Error code: 403"

Permission issue.

**Solutions:**
1. Verify the function's API key has these permissions:
   - `databases.read`
   - `databases.write`
   - `users.read`
   - `users.write`

### Function Not Deploying

**Solutions:**
1. Make sure you ran `npm run build` in the `Mobile API` directory
2. Check that `src/main.js` exists and is up to date
3. Check Appwrite Console for deployment errors

## Testing Checklist

Before calling this complete, test:

- [ ] Build completes without errors: `npm run build`
- [ ] Function deploys successfully in Appwrite Console
- [ ] Create a new test user in your app
- [ ] Verify user exists in Auth and user_profiles
- [ ] Delete the user account from the app
- [ ] Check function execution logs
- [ ] Verify user is deleted from Auth
- [ ] Verify user profile is deleted from user_profiles
- [ ] App redirects to login/welcome screen

## Need More Help?

See `TEST_DELETE_ACCOUNT.md` for detailed debugging steps.
