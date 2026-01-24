# Privacy Policy & Terms and Conditions Implementation Guide

## Problem Summary

Your app was encountering authorization errors when trying to fetch privacy policy and terms & conditions during signup:

```
ERROR [database.getSetting] Error fetching setting: [AppwriteException: The current user is not authorized to perform the requested action.]
```

This happened because unauthenticated users (guests) were trying to access the `settings` table in Appwrite, but the table didn't have read permissions for guests.

---

## ✅ Solution Implemented

We've implemented a **hybrid approach** that:
1. **Uses static content as the default** (always available, no authentication needed)
2. **Attempts to fetch from database** (allows you to update content without app updates)
3. **Gracefully falls back to static content** if database fetch fails

---

## 📁 Files Modified

### 1. **Created: `/src/constants/LegalContent.ts`**
This file contains static versions of your terms and privacy policy. This ensures content is always available even if:
- Database is down
- User is not authenticated
- Network is unavailable

**Action Required:** Update this file with your actual legal content.

### 2. **Updated: `/src/screens/auth/signup/components/TermsModal.tsx`**
- Now imports static `TERMS_AND_CONDITIONS` content
- Tries to fetch from database, but doesn't fail if unauthorized
- Uses static content as fallback

### 3. **Updated: `/src/screens/auth/signup/components/PrivacyModal.tsx`**
- Now imports static `PRIVACY_POLICY` content
- Tries to fetch from database, but doesn't fail if unauthorized
- Uses static content as fallback

### 4. **Updated: `/src/constants/index.ts`**
- Exports the legal content constants for easy import

---

## 🎯 How to Complete the Implementation

### Option A: Use Static Content Only (Simpler, Recommended for MVP)

**What you need to do:**
1. Edit `/src/constants/LegalContent.ts`
2. Replace the placeholder text with your actual Terms & Conditions
3. Replace the placeholder text with your actual Privacy Policy
4. Done! No database configuration needed.

**Pros:**
- ✅ No authorization issues
- ✅ Works offline
- ✅ Fast loading
- ✅ No database setup required

**Cons:**
- ❌ Requires app update to change content
- ❌ Content can't be managed dynamically

---

### Option B: Use Database with Static Fallback (Current Implementation)

**What you need to do:**

#### Step 1: Configure Appwrite Database Permissions

1. Go to your **Appwrite Console**
2. Navigate to: **Databases** → `[Your Database]` → `settings` table
3. Click on **Settings** → **Permissions**
4. Add a new permission:
   - **Role**: Select `guests` or `any`
   - **Permissions**: Check ONLY `read` (uncheck create, update, delete)
5. Save

This allows unauthenticated users to read settings.

#### Step 2: Add Content to Database

Add one row to your `settings` table:

**Row: Terms & Conditions**
```
key: termsAndCondition
value: [Your full terms and conditions text]
description: Terms and Conditions for user signup
```

#### Step 3: Update Static Content (Fallback)

Even with database enabled, update `/src/constants/LegalContent.ts` with your content as a fallback.

**Pros:**
- ✅ Can update content without app updates
- ✅ Still works offline (uses static fallback)
- ✅ Centralized content management

**Cons:**
- ❌ Requires database configuration
- ❌ Slightly more complex setup

---

## 🔒 Security Considerations

### ✅ Safe to Make Settings Table Public for Reading

It's **perfectly safe** to allow public read access to the `settings` table because:
- Only reading is allowed (no write/update/delete)
- The content is public information anyway (users need to read it to sign up)
- This is a common pattern in mobile apps

### 🛡️ Important: Permissions Setup

When configuring Appwrite permissions:

**DO:**
- ✅ Allow `guests` role to **read** settings table
- ✅ Restrict `create`, `update`, `delete` to admin roles only

**DON'T:**
- ❌ Allow guests to create, update, or delete settings
- ❌ Store sensitive information in the settings table

---

## 🧪 Testing

After implementing, test the following scenarios:

### Test 1: Fresh Signup (Not Authenticated)
1. Open app (logged out)
2. Go to Sign Up screen
3. Click "Terms & Conditions" link
4. ✅ Should display content without errors
5. Click "Privacy Policy" link
6. ✅ Should display content without errors

### Test 2: Offline Mode
1. Enable airplane mode
2. Open signup screen
3. Click legal links
4. ✅ Should display static content (may show brief loading)

### Test 3: Database Fetch (If using Option B)
1. Ensure database permissions are configured
2. Add content to database
3. Open signup screen
4. Click legal links
5. ✅ Should fetch and display database content

---

## 📝 Current Implementation Flow

```
User clicks "Terms & Conditions" or "Privacy Policy"
    ↓
Modal opens with static content immediately (no loading state)
    ↓
Attempts to fetch from database in background
    ↓
If successful → Updates content from database
    ↓
If fails → Keeps displaying static content (no error shown to user)
```

---

## 🚀 Recommended Approach

For your current stage, I recommend **Option A (Static Content Only)**:

1. Update `/src/constants/LegalContent.ts` with your actual legal text
2. Test signup flow
3. Ship it!

Later, when you need dynamic content management, you can:
- Configure database permissions (5 minutes)
- Add content to database (5 minutes)
- The code already supports it!

---

## ⚠️ Important Legal Note

Make sure your Terms & Conditions and Privacy Policy:
- Are drafted by a legal professional
- Comply with relevant regulations (GDPR, CCPA, etc.)
- Are specific to your app and business
- Include proper contact information
- Have an effective date

---

## 🐛 Troubleshooting

### Still getting authorization errors?

**If using Option A (Static only):**
- Error should be gone. If not, check that you imported correctly.

**If using Option B (Database):**
1. Check Appwrite console permissions
2. Verify `guests` role has `read` permission
3. Check that rows exist with correct keys:
   - `terms_and_conditions`
   - `privacy_policy`
4. Look at network tab to see exact error

### Content not updating from database?

1. Clear app cache and restart
2. Check console logs for fetch errors
3. Verify database content is not empty

---

## 📞 Need Help?

If you encounter issues:
1. Check terminal logs for detailed error messages
2. Verify Appwrite console settings
3. Test with static content first (simpler)
4. Gradually add database integration

---

## Summary

✅ **Fixed:** Authorization errors when fetching legal content  
✅ **Implemented:** Hybrid approach with static fallback  
✅ **Updated:** Signup screen now shows only "Terms & Conditions" inline  
✅ **Database Key:** Uses `termsAndCondition` from Appwrite settings table  
✅ **Action Required:** Update legal content in `/src/constants/LegalContent.ts`  
✅ **Optional:** Configure database permissions for dynamic content  

The app will now work correctly during signup without authorization errors!
