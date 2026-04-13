import AsyncStorage from '@react-native-async-storage/async-storage';

const REMEMBERED_EMAIL_KEY = '@samplefinder_remembered_email';

export async function getRememberedEmail(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(REMEMBERED_EMAIL_KEY);
  } catch (error) {
    console.warn('[rememberedLogin] Failed to read remembered email:', error);
    return null;
  }
}

export async function saveRememberedEmail(email: string): Promise<void> {
  try {
    await AsyncStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
  } catch (error) {
    console.warn('[rememberedLogin] Failed to save remembered email:', error);
  }
}

export async function clearRememberedEmail(): Promise<void> {
  try {
    await AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY);
  } catch (error) {
    console.warn('[rememberedLogin] Failed to clear remembered email:', error);
  }
}
