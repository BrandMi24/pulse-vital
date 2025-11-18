// src/storage/emergencyStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const EMERGENCY_KEY = '@pulse_vital_emergency';

export type EmergencyContact = {
  name: string;
  relationship: string;
  phone: string;
};

export async function saveEmergencyContact(contact: EmergencyContact) {
  await AsyncStorage.setItem(EMERGENCY_KEY, JSON.stringify(contact));
}

export async function getEmergencyContact(): Promise<EmergencyContact | null> {
  const raw = await AsyncStorage.getItem(EMERGENCY_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as EmergencyContact;
  } catch {
    return null;
  }
}

export async function clearEmergencyContact() {
  await AsyncStorage.removeItem(EMERGENCY_KEY);
}
