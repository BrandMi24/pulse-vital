// Este archivo maneja toda la comunicación con tu API PulseVital
// Úsalo en cualquier pantalla importando las funciones de aquí.

// --- Configuración Global ---
export let DEVICE_ID = 'ESP32_001';

export const setDeviceId = (id: string) => {
  DEVICE_ID = id;
};

export const getDeviceId = (): string => {
  return DEVICE_ID;
};

const API_BASE_URL = 'https://pulse-vital-api.onrender.com';

// --- Interfaces Compartidas ---
export interface SensorReading {
  timestamp: string;
  ir_value: number;
  red_value: number;
  heart_rate: number | null;
  spo2: number | null;
  temperature: number | null;
  device_id: string;
  id: string;
}

// --- Funciones de la API ---

/**
 * Obtiene las últimas lecturas del sensor, SIEMPRE ordenadas por timestamp
 * de más reciente → más viejo.
 * @param limit Cantidad de lecturas a traer (default 20)
 */
export const fetchLatestReadings = async (
  limit: number = 1000
): Promise<SensorReading[]> => {
  try {
    const url = `${API_BASE_URL}/sensor/readings/${DEVICE_ID}?limit=${limit}`;
    const response = await fetch(url);

    // Si la API dice que no hay datos o no existe el device
    if (response.status === 404 || response.status === 422) {
      return [];
    }

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) return [];

    // 🔥 Ordenar SIEMPRE del más reciente → al más viejo
    const sorted = data.sort(
      (a: SensorReading, b: SensorReading) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return sorted;

  } catch (error) {
    console.error('Error en sensorService:', error);
    throw error; // La pantalla decide qué hacer
  }
};

/**
 * (Opcional) Para POST en un futuro
 */
export const sendSensorData = async (batch: any) => {
  // futura implementación...
};
