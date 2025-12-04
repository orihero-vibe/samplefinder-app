import { Account, ID } from 'react-native-appwrite';
import appwriteClient from './appwrite';
import { createUserProfile } from './database';

const account = new Account(appwriteClient);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  username: string;
}

export interface User {
  $id: string;
  email: string;
  name?: string;
  emailVerification: boolean;
  phoneVerification: boolean;
}

/**
 * Check for existing session and logout if found
 */
const ensureNoActiveSession = async (): Promise<void> => {
  try {
    const hasSession = await isLoggedIn();
    if (hasSession) {
      console.log('[auth] Active session found, logging out...');
      await logout();
      console.log('[auth] Successfully logged out existing session');
    }
  } catch (error: any) {
    // If there's an error checking or logging out, it's okay - we'll proceed anyway
    // This could happen if the session is invalid or already expired
    console.log('[auth] No active session or session already expired');
  }
};

/**
 * Sign up with email and password
 */
export const signup = async (credentials: SignUpCredentials): Promise<User> => {
  console.log('[auth.signup] Starting signup process');
  console.log('[auth.signup] Credentials received:', {
    email: credentials.email,
    firstName: credentials.firstName,
    lastName: credentials.lastName,
    phoneNumber: credentials.phoneNumber,
    dateOfBirth: credentials.dateOfBirth,
    username: credentials.username,
    passwordLength: credentials.password.length,
  });

  // Check for existing session and logout if found
  await ensureNoActiveSession();

  try {
    // Create account with email, password, and name
    // Generate a valid userId (max 36 chars, alphanumeric + period, hyphen, underscore)
    const name = `${credentials.firstName} ${credentials.lastName}`.trim();
    console.log('[auth.signup] Creating account with name:', name);
    
    // Trim email to ensure no whitespace issues
    const trimmedEmail = credentials.email.trim();
    console.log('[auth.signup] Email before trim:', JSON.stringify(credentials.email));
    console.log('[auth.signup] Email after trim:', JSON.stringify(trimmedEmail));
    
    const userId = ID.unique();
    console.log('[auth.signup] Account data (without password):', {
      userId: userId,
      email: trimmedEmail,
      name: name,
    });

    console.log('[auth.signup] Calling account.create with positional parameters...');
    const user = await account.create(userId, trimmedEmail, credentials.password, name);
    console.log('[auth.signup] Account created successfully:', {
      id: user.$id,
      email: user.email,
      name: user.name,
      emailVerification: user.emailVerification,
      phoneVerification: user.phoneVerification,
    });

    // Create a session explicitly after account creation
    // account.create might not always create a session automatically
    console.log('[auth.signup] Creating email/password session...');
    try {
      await account.createEmailPasswordSession(trimmedEmail, credentials.password);
      console.log('[auth.signup] Session created successfully');
    } catch (sessionError: any) {
      console.warn('[auth.signup] Session creation failed:', sessionError?.message);
      // If session creation fails, try to continue anyway - might already have a session
    }

    // Verify session exists before proceeding
    console.log('[auth.signup] Verifying session exists...');
    try {
      const sessionUser = await account.get();
      console.log('[auth.signup] Session verified, user:', {
        id: sessionUser.$id,
        email: sessionUser.email,
      });
    } catch (sessionError: any) {
      console.warn('[auth.signup] Session verification failed:', sessionError?.message);
      // If verification fails, we still need to create the profile, so continue
    }

    const updatedUser = user;

    // OTP will be sent on ConfirmAccountScreen after session is deleted
    // No need to send it here (same as login flow)
    console.log('[auth.signup] Verification email will be sent on ConfirmAccountScreen');

    // Create user profile in database
    console.log('[auth.signup] Creating user profile in database...');
    try {
      await createUserProfile({
        authID: updatedUser.$id,
        firstname: credentials.firstName.trim(),
        lastname: credentials.lastName.trim(),
        phoneNumber: credentials.phoneNumber.trim(),
        dob: credentials.dateOfBirth.trim(),
        username: credentials.username.trim(),
        role: 'user',
      });
      console.log('[auth.signup] User profile created successfully');
    } catch (profileError: any) {
      console.error('[auth.signup] Error creating user profile:', profileError);
      console.error('[auth.signup] Profile error message:', profileError?.message);
      console.error('[auth.signup] Profile error code:', profileError?.code);
      // Re-throw the error so it's visible to the user
      // The signup should fail if profile creation fails
      throw new Error(`Failed to create user profile: ${profileError?.message || 'Unknown error'}`);
    }

    const result = {
      $id: updatedUser.$id,
      email: updatedUser.email,
      name: updatedUser.name,
      emailVerification: updatedUser.emailVerification,
      phoneVerification: updatedUser.phoneVerification,
    };
    console.log('[auth.signup] Signup completed successfully, returning user:', result);
    return result;
  } catch (error: any) {
    console.error('[auth.signup] Signup error occurred:', error);
    console.error('[auth.signup] Error type:', error?.constructor?.name);
    console.error('[auth.signup] Error message:', error?.message);
    console.error('[auth.signup] Error code:', error?.code);
    console.error('[auth.signup] Error response:', error?.response);
    console.error('[auth.signup] Error stack:', error?.stack);
    
    // If user already exists (409 error), try to log them in instead
    if (error?.code === 409 || error?.message?.includes('already exists')) {
      console.log('[auth.signup] User already exists (409 error), attempting to log in...');
      console.log('[auth.signup] Attempting login with email:', credentials.email.trim());
      console.log('[auth.signup] This could mean:');
      console.log('[auth.signup] - Email already registered');
      console.log('[auth.signup] - Phone number already registered');
      console.log('[auth.signup] - User ID collision (unlikely)');
      try {
        // Try to create a session with the provided credentials
        const trimmedEmail = credentials.email.trim();
        await account.createEmailPasswordSession(trimmedEmail, credentials.password);
        console.log('[auth.signup] Login successful for existing user');
        
        // Get user details
        const existingUser = await account.get();
        console.log('[auth.signup] Existing user details:', {
          id: existingUser.$id,
          email: existingUser.email,
          name: existingUser.name,
          emailVerification: existingUser.emailVerification,
          phoneVerification: existingUser.phoneVerification,
        });
        
        // TODO: Implement database module for user profile creation
        console.log('[auth.signup] User profile creation skipped (database module not yet implemented)');
        
        return {
          $id: existingUser.$id,
          email: existingUser.email,
          name: existingUser.name,
          emailVerification: existingUser.emailVerification,
          phoneVerification: existingUser.phoneVerification,
        };
      } catch (loginError: any) {
        console.error('[auth.signup] Login attempt failed:', loginError);
        console.error('[auth.signup] Login error message:', loginError?.message);
        console.error('[auth.signup] Login error code:', loginError?.code);
        // If login fails, the account exists but password might be wrong, or there's another issue
        if (loginError?.message?.includes('password') || loginError?.message?.includes('credentials')) {
          throw new Error('An account with this email already exists, but the password is incorrect. Please use the login page or reset your password.');
        }
        throw new Error('An account with this email or phone number already exists. Please use the login page to sign in.');
      }
    }
    
    // For other errors, throw the original error message
    throw new Error(error.message || 'Sign up failed. Please try again.');
  }
};

/**
 * Login with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<User> => {
  console.log('[auth.login] Starting login process');
  
  // Check for existing session and logout if found
  await ensureNoActiveSession();

  try {
    const trimmedEmail = credentials.email.trim();
    console.log('[auth.login] Creating email/password session...');
    const session = await account.createEmailPasswordSession(
      trimmedEmail,
      credentials.password
    );
    console.log('[auth.login] Session created successfully');
    
    // Get user details
    console.log('[auth.login] Fetching user details...');
    const user = await account.get();
    console.log('[auth.login] User details retrieved:', {
      id: user.$id,
      email: user.email,
      emailVerification: user.emailVerification,
    });
    
    // OTP will be sent on ConfirmAccountScreen after session is deleted
    // No need to send it here
    
    return {
      $id: user.$id,
      email: user.email,
      name: user.name,
      emailVerification: user.emailVerification,
      phoneVerification: user.phoneVerification,
    };
  } catch (error: any) {
    console.error('[auth.login] Login error occurred:', error);
    console.error('[auth.login] Error message:', error?.message);
    console.error('[auth.login] Error code:', error?.code);
    throw new Error(error.message || 'Login failed. Please check your credentials.');
  }
};

/**
 * Get current user session
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    console.log('[auth.getCurrentUser] Attempting to get current user...');
    const user = await account.get();
    console.log('[auth.getCurrentUser] User retrieved successfully:', {
      id: user.$id,
      email: user.email,
    });
    return {
      $id: user.$id,
      email: user.email,
      name: user.name,
      emailVerification: user.emailVerification,
      phoneVerification: user.phoneVerification,
    };
  } catch (error: any) {
    console.error('[auth.getCurrentUser] Error getting current user:', error);
    console.error('[auth.getCurrentUser] Error message:', error?.message);
    console.error('[auth.getCurrentUser] Error code:', error?.code);
    return null;
  }
};

/**
 * Logout current user
 */
export const logout = async (): Promise<void> => {
  try {
    await account.deleteSession('current');
  } catch (error: any) {
    throw new Error(error.message || 'Logout failed');
  }
};

/**
 * Check if user is logged in
 */
export const isLoggedIn = async (): Promise<boolean> => {
  try {
    await account.get();
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Send email verification OTP
 */
export const sendVerificationEmail = async (): Promise<void> => {
  console.log('[auth.sendVerificationEmail] Starting verification email process');
  try {
    // Get current user to get userId and email
    console.log('[auth.sendVerificationEmail] Getting current user...');
    const user = await account.get();
    console.log('[auth.sendVerificationEmail] Current user:', {
      id: user.$id,
      email: user.email,
    });
    
    // Appwrite sends verification email with OTP
    // createEmailToken requires userId and email
    console.log('[auth.sendVerificationEmail] Creating email token...');
    await account.createEmailToken(user.$id, user.email);
    console.log('[auth.sendVerificationEmail] Verification email sent successfully');
  } catch (error: any) {
    console.error('[auth.sendVerificationEmail] Error sending verification email:', error);
    console.error('[auth.sendVerificationEmail] Error message:', error?.message);
    console.error('[auth.sendVerificationEmail] Error code:', error?.code);
    console.error('[auth.sendVerificationEmail] Error stack:', error?.stack);
    throw new Error(error.message || 'Failed to send verification email');
  }
};

/**
 * Verify email OTP and create session
 * Uses createSession with userId and secret (OTP code) to verify and create session
 */
export const verifyEmail = async (userId: string, secret: string): Promise<void> => {
  console.log('[auth.verifyEmail] Starting email OTP verification');
  console.log('[auth.verifyEmail] UserId:', userId);
  console.log('[auth.verifyEmail] Secret/OTP:', secret);
  console.log('[auth.verifyEmail] Secret/OTP length:', secret.length);
  
  try {
    // Use createSession to verify the OTP and create a new session
    // This is the Email OTP login flow - session should already be deleted
    console.log('[auth.verifyEmail] Calling createSession with userId and OTP secret...');
    await account.createSession(userId, secret);
    console.log('[auth.verifyEmail] Email OTP verified successfully and session created');
  } catch (error: any) {
    console.error('[auth.verifyEmail] Verification error:', error);
    console.error('[auth.verifyEmail] Error message:', error?.message);
    console.error('[auth.verifyEmail] Error code:', error?.code);
    console.error('[auth.verifyEmail] Error response:', error?.response);
    console.error('[auth.verifyEmail] Full error object:', JSON.stringify(error, null, 2));
    
    // Provide more specific error messages
    if (error?.message?.includes('Invalid token') || error?.message?.includes('invalid')) {
      throw new Error('Invalid verification code. Please check your code and try again.');
    }
    
    throw new Error(error.message || 'Failed to verify email. Please check your code.');
  }
};

/**
 * Send Email OTP for verification
 * This is called on ConfirmAccountScreen after deleting the session
 */
export const sendEmailOTP = async (userId: string, email: string): Promise<void> => {
  console.log('[auth.sendEmailOTP] Sending Email OTP');
  console.log('[auth.sendEmailOTP] UserId:', userId);
  console.log('[auth.sendEmailOTP] Email:', email);
  
  try {
    await account.createEmailToken(userId, email);
    console.log('[auth.sendEmailOTP] Email OTP sent successfully');
  } catch (error: any) {
    console.error('[auth.sendEmailOTP] Error sending OTP:', error);
    console.error('[auth.sendEmailOTP] Error message:', error?.message);
    throw new Error(error.message || 'Failed to send verification email');
  }
};

/**
 * Resend email verification OTP
 * This requires userId and email since we don't have a session
 */
export const resendVerificationEmail = async (userId: string, email: string): Promise<void> => {
  console.log('[auth.resendVerificationEmail] Resending Email OTP');
  try {
    await account.createEmailToken(userId, email);
    console.log('[auth.resendVerificationEmail] Email OTP resent successfully');
  } catch (error: any) {
    console.error('[auth.resendVerificationEmail] Error:', error);
    throw new Error(error.message || 'Failed to resend verification email');
  }
};

/**
 * Create password recovery token
 * Sends a recovery email to the user with a secret code
 * Returns the userId if available (Appwrite may include it in the response)
 */
export const createPasswordRecovery = async (email: string, url?: string): Promise<string | null> => {
  console.log('[auth.createPasswordRecovery] Creating password recovery token');
  console.log('[auth.createPasswordRecovery] Email:', email);
  
  try {
    const trimmedEmail = email.trim();
    // Appwrite's createRecovery requires both email and url parameters
    // For React Native apps, we provide a valid HTTPS URL (required by Appwrite)
    // The recovery email will contain the secret code that users enter in the app
    // The URL is required by Appwrite's API but the code is what users actually use
    const recoveryUrl = url || 'https://samplefinder.app/reset-password';
    const result = await account.createRecovery(trimmedEmail, recoveryUrl);
    console.log('[auth.createPasswordRecovery] Password recovery email sent successfully');
    console.log('[auth.createPasswordRecovery] Recovery result:', result);
    
    // Appwrite's createRecovery might return userId in the response
    // If not, we'll need to handle it differently in updatePasswordRecovery
    const userId = (result as any)?.userId || (result as any)?.$id || null;
    if (userId) {
      console.log('[auth.createPasswordRecovery] UserId from response:', userId);
    }
    
    return userId;
  } catch (error: any) {
    console.error('[auth.createPasswordRecovery] Error:', error);
    console.error('[auth.createPasswordRecovery] Error message:', error?.message);
    console.error('[auth.createPasswordRecovery] Error code:', error?.code);
    
    // Provide user-friendly error messages
    if (error?.code === 404 || error?.message?.includes('not found')) {
      throw new Error('No account found with this email address.');
    }
    
    throw new Error(error.message || 'Failed to send password recovery email. Please try again.');
  }
};

/**
 * Update user email
 */
export const updateEmail = async (email: string, password: string): Promise<void> => {
  console.log('[auth.updateEmail] Updating user email');
  
  try {
    const trimmedEmail = email.trim();
    await account.updateEmail(trimmedEmail, password);
    console.log('[auth.updateEmail] Email updated successfully');
  } catch (error: any) {
    console.error('[auth.updateEmail] Error updating email:', error);
    console.error('[auth.updateEmail] Error message:', error?.message);
    console.error('[auth.updateEmail] Error code:', error?.code);
    
    // Provide user-friendly error messages
    if (error?.message?.includes('password') || error?.message?.includes('credentials')) {
      throw new Error('Current password is incorrect. Please try again.');
    }
    if (error?.code === 409 || error?.message?.includes('already exists')) {
      throw new Error('This email is already in use. Please use a different email.');
    }
    
    throw new Error(error.message || 'Failed to update email. Please try again.');
  }
};

/**
 * Update user password
 */
export const updatePassword = async (oldPassword: string, newPassword: string, newPasswordAgain: string): Promise<void> => {
  console.log('[auth.updatePassword] Updating user password');
  
  if (newPassword !== newPasswordAgain) {
    throw new Error('New passwords do not match. Please try again.');
  }
  
  try {
    await account.updatePassword(newPassword, oldPassword);
    console.log('[auth.updatePassword] Password updated successfully');
  } catch (error: any) {
    console.error('[auth.updatePassword] Error updating password:', error);
    console.error('[auth.updatePassword] Error message:', error?.message);
    console.error('[auth.updatePassword] Error code:', error?.code);
    
    // Provide user-friendly error messages
    if (error?.message?.includes('password') || error?.message?.includes('credentials') || error?.message?.includes('old')) {
      throw new Error('Current password is incorrect. Please try again.');
    }
    if (error?.message?.includes('weak') || error?.message?.includes('requirements')) {
      throw new Error('New password does not meet security requirements. Please choose a stronger password.');
    }
    
    throw new Error(error.message || 'Failed to update password. Please try again.');
  }
};

/**
 * Update password using recovery secret
 * This is called after the user verifies the recovery code
 * Note: If userId is not provided, Appwrite might extract it from the secret
 */
export const updatePasswordRecovery = async (
  secret: string,
  password: string,
  passwordAgain: string,
  userId?: string
): Promise<void> => {
  console.log('[auth.updatePasswordRecovery] Updating password with recovery secret');
  if (userId) {
    console.log('[auth.updatePasswordRecovery] UserId:', userId);
  } else {
    console.log('[auth.updatePasswordRecovery] No userId provided - Appwrite will extract from secret');
  }
  
  if (password !== passwordAgain) {
    throw new Error('Passwords do not match. Please try again.');
  }
  
  try {
    // Appwrite's updateRecovery requires userId and secret
    // If userId is not provided, we might need to try a different approach
    // For now, we'll require userId - it should be passed from the recovery response or stored
    if (!userId) {
      throw new Error('User ID is required for password recovery. Please request a new password reset.');
    }
    
    await account.updateRecovery(userId, secret, password, passwordAgain);
    console.log('[auth.updatePasswordRecovery] Password updated successfully');
  } catch (error: any) {
    console.error('[auth.updatePasswordRecovery] Error:', error);
    console.error('[auth.updatePasswordRecovery] Error message:', error?.message);
    console.error('[auth.updatePasswordRecovery] Error code:', error?.code);
    
    // Provide user-friendly error messages
    if (error?.message?.includes('Invalid token') || error?.message?.includes('invalid') || error?.message?.includes('expired')) {
      throw new Error('Invalid or expired recovery code. Please request a new password reset.');
    }
    
    if (error?.message?.includes('password') && error?.message?.includes('weak')) {
      throw new Error('Password does not meet security requirements. Please choose a stronger password.');
    }
    
    throw new Error(error.message || 'Failed to reset password. Please try again.');
  }
};

export default {
  signup,
  login,
  getCurrentUser,
  logout,
  isLoggedIn,
  sendVerificationEmail,
  sendEmailOTP,
  verifyEmail,
  resendVerificationEmail,
  createPasswordRecovery,
  updatePasswordRecovery,
  updateEmail,
  updatePassword,
};

