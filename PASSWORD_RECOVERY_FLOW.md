# Password Recovery Flow - Implementation Guide

This document describes the updated password recovery flow that uses the new Appwrite function to get userId from email.

## Overview

The password recovery flow has been updated to use the deployed `/get-user-by-email` Appwrite function to reliably retrieve the userId before sending the recovery email. This ensures we always have the userId needed for the password reset process.

## Flow Diagram

```
User enters email
    ↓
Get userId from email (via Appwrite function)
    ↓
Send Email OTP (createEmailToken - NO LINK NEEDED)
    ↓
User receives email with 6-digit OTP code
    ↓
User enters 6-digit OTP code
    ↓
User creates new password
    ↓
Logout any existing sessions (to allow OTP verification)
    ↓
ATOMIC OPERATION (verifyEmailAndResetPassword):
  1. Verify OTP and create session
  2. Update password (backend function)
  3. Logout session
    ↓
Success! Navigate to Login
```

## Implementation Details

### 1. New Function: `getUserIdFromEmail()`

**Location:** `src/lib/auth.ts`

This function calls the deployed Appwrite function to look up a user by their email address.

```typescript
export const getUserIdFromEmail = async (email: string): Promise<string>
```

**Features:**
- Calls the `/get-user-by-email` endpoint
- Returns the userId if found
- Throws user-friendly error if user not found
- Handles function execution errors

### 2. New Function: `sendPasswordRecoveryOTP()`

**Location:** `src/lib/auth.ts`

This function combines getting the userId and sending the Email OTP.

```typescript
export const sendPasswordRecoveryOTP = async (email: string): Promise<string>
```

**Process:**
1. Gets userId from email using `getUserIdFromEmail()`
2. Sends Email OTP using `account.createEmailToken()` (NO LINK NEEDED)
3. Returns the userId for use in password reset

**Features:**
- Guaranteed userId retrieval
- Uses Email OTP (no recovery link needed)
- User-friendly error messages
- Logging for debugging

### 3. New Function: `verifyEmailAndResetPassword()`

**Location:** `src/lib/auth.ts`

This function performs an atomic operation: verifies OTP, updates password, and logs out.

```typescript
export const verifyEmailAndResetPassword = async (userId: string, otp: string, newPassword: string): Promise<void>
```

**Features:**
- **Atomic operation** - all steps happen in sequence without interruption
- Verifies Email OTP and creates session
- Immediately updates password (server-side)
- Logs out the session
- Prevents token expiration issues
- User-friendly error messages

**Why Atomic?**
Email OTP tokens can only be used once and expire quickly. By combining verification and password reset into one operation, we ensure the token is consumed immediately and the password is updated before any expiration or session issues occur.

### 4. Helper Function: `resetPasswordAfterOTPVerification()`

**Location:** `src/lib/auth.ts`

Internal helper function that calls the backend to update password with server-side permissions.

```typescript
export const resetPasswordAfterOTPVerification = async (userId: string, newPassword: string): Promise<void>
```

**Backend Endpoint:** `/reset-password-after-otp` in Mobile API function

### 5. Updated Forgot Password Screen

**Location:** `src/screens/auth/useForgotPasswordScreen.ts`

**Changes:**
- Now uses `sendPasswordRecoveryOTP()` instead of `createPasswordRecovery()`
- Sends Email OTP instead of recovery link
- Always receives a valid userId to pass to the PasswordReset screen

### 6. Updated Password Reset Screen

**Location:** `src/screens/auth/usePasswordResetScreen.ts`

**Changes:**
- Resend code now uses `sendPasswordRecoveryOTP()` (Email OTP flow)
- **Uses atomic operation** `verifyEmailAndResetPassword()` to prevent token issues
- Logs out any existing sessions before verification
- Ensures userId is always available throughout the process
- Improved error handling for expired/invalid tokens

## User Experience

### Step 1: Forgot Password Screen
1. User enters their email address
2. Taps "Submit"
3. App gets userId from email (via function)
4. App sends Email OTP (NO LINK, just code)
5. User navigates to Password Reset screen

### Step 2: Password Reset Screen - Code Entry
1. User sees their email address
2. User receives Email OTP with 6-digit code
3. User enters the code
4. Code is validated (or user can resend)
5. User moves to password creation step

### Step 3: Password Reset Screen - New Password
1. User enters new password
2. Password requirements are displayed
3. **App logs out any existing sessions** (to allow OTP verification)
4. **App performs atomic operation** using `verifyEmailAndResetPassword(userId, code, password)`:
   - Verifies OTP and creates session
   - Immediately updates password (server-side)
   - Logs out the session
5. Success message is shown
6. User navigates to Login screen

## Error Handling

### User Not Found
- **Message:** "No account found with this email address."
- **Action:** User stays on Forgot Password screen

### Invalid/Expired Code
- **Message:** "Invalid or expired recovery code. Please request a new password reset."
- **Action:** User returns to code entry step

### Weak Password
- **Message:** "Password does not meet security requirements. Please choose a stronger password."
- **Action:** User stays on password creation step

### Invalid/Expired OTP Token
- **Message:** "Invalid or expired code. Please request a new password reset."
- **Action:** User should tap "Resend Code" to get a fresh OTP
- **Cause:** OTP tokens expire after ~15 minutes or after being used once

### Function Execution Error
- **Message:** "Failed to look up user. Please try again."
- **Action:** User can retry

## Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter  
- At least 1 number
- At least 1 special character

## Technical Notes

### Why This Approach?

1. **Reliability:** The Appwrite function guarantees we get the userId from email
2. **No Links Needed:** Uses Email OTP flow (createEmailToken) instead of recovery links
3. **Consistency:** Uses the same Email OTP flow as email verification
4. **Server-side:** Email lookup happens server-side with API key permissions
5. **Security:** No need to expose Users API to client
6. **Better UX:** Simple 6-digit OTP code instead of clicking email links

### Appwrite Methods Used

**Client-side:**
- `functions.createExecution()` - Call backend functions (get-user-by-email, reset-password-after-otp)
- `account.createEmailToken()` - Send Email OTP (NO LINK)
- `account.createSession()` - Verify OTP and create session (via verifyEmail)

**Server-side (Mobile API function):**
- `users.list()` - Look up user by email
- `users.updatePassword()` - Update password with server-side permissions (doesn't require old password)

### Environment Variables Required

- `APPWRITE_EVENTS_FUNCTION_ID` - The ID of the deployed Appwrite function

## Testing

### Test Case 1: Valid Email
1. Enter a valid email that exists in the system
2. Verify Email OTP is sent (6-digit code, NO LINK)
3. Enter valid OTP code
4. Create new password
5. Verify password is updated
6. Verify user is logged out
7. Login with new password

### Test Case 2: Invalid Email
1. Enter an email that doesn't exist
2. Verify error message: "No account found with this email address."

### Test Case 3: Invalid/Expired Code
1. Request Email OTP
2. Enter invalid or expired OTP code
3. Verify error message about invalid code
4. Request new code (resend)
5. Enter new valid code
6. Complete password reset

### Test Case 4: Resend Code
1. Request Email OTP
2. Tap "Resend code"
3. Verify new Email OTP is sent
4. Use new code to complete reset

### Test Case 5: Password Requirements
1. Complete OTP verification
2. Try weak passwords
3. Verify password validation works
4. Enter strong password matching requirements
5. Verify password is updated successfully

## Deployment Checklist

- [x] Deploy Appwrite function with `/get-user-by-email` endpoint
- [x] Add `/reset-password-after-otp` endpoint to Mobile API function
- [x] Add `getUserIdFromEmail()` function to auth.ts
- [x] Add `sendPasswordRecoveryOTP()` function to auth.ts (using Email OTP)
- [x] Add `resetPasswordAfterOTPVerification()` function to auth.ts
- [x] Update `useForgotPasswordScreen.ts` to use Email OTP flow
- [x] Update `usePasswordResetScreen.ts` to use Email OTP flow
- [x] Remove dependency on `createRecovery()` and `updateRecovery()`
- [ ] Deploy updated Mobile API function to Appwrite with new endpoint
- [ ] Set `APPWRITE_EVENTS_FUNCTION_ID` environment variable
- [ ] Test end-to-end flow
- [ ] Test in production environment

## Rollback Plan

If issues occur, the old `createPasswordRecovery()` and `updatePasswordRecovery()` functions are still available and can be used by reverting the imports in:
- `src/screens/auth/useForgotPasswordScreen.ts`
- `src/screens/auth/usePasswordResetScreen.ts`

The functions are marked as deprecated but still functional.

## Future Improvements

1. ✅ ~~Use Email OTP flow instead of recovery flow~~ (IMPLEMENTED)
2. Add rate limiting for resend code
3. Add countdown timer before allowing resend (e.g., 60 seconds)
4. Add analytics tracking for password reset success/failure rates
5. Consider adding password strength meter
6. Add "Remember this device" option to skip OTP for trusted devices
