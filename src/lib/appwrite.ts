import { Client } from 'react-native-appwrite';
import { APPWRITE_PROJECT_ID, APPWRITE_ENDPOINT } from '@env';
import { Platform } from 'react-native';

let client: Client;

try {
  const endpoint = APPWRITE_ENDPOINT || '';
  const projectId = APPWRITE_PROJECT_ID || '';
  
  if (!endpoint || !projectId) {
    console.warn('⚠️ Appwrite: Missing endpoint or project ID. Check your .env file.');
  }
  
  // Set platform identifier for Appwrite
  const platform = Platform.OS === 'ios' 
    ? 'com.samplefinder.app' 
    : 'com.samplefinder.app';
  
  client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setPlatform(platform);
    
  console.log('✅ Appwrite client initialized');
} catch (error) {
  console.error('❌ Failed to initialize Appwrite client:', error);
  // Create a dummy client to prevent crashes
  client = new Client()
    .setEndpoint('')
    .setProject('')
    .setPlatform('com.samplefinder.app');
}

// Note: setKey is not available in the standard appwrite package for client-side usage
// Dev keys are typically used server-side only

export default client;
