// src/storage/authStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@pulse_vital_user';

export type StoredUser = {
  name: string;
  email: string;
  age?: number;
  password: string;
};

export async function saveUser(user: StoredUser) {
  await AsyncStorage.setItem(KEY, JSON.stringify(user));
}

export async function getUser(): Promise<StoredUser | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export async function clearUser() {
  await AsyncStorage.removeItem(KEY);
}
