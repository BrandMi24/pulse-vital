// Este archivo maneja toda la comunicación con tu API PulseVital
// Úsalo en cualquier pantalla importando las funciones de aquí.

// --- Configuración Global ---
export const DEVICE_ID = 'ESP32_001'; 
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
 * Obtiene las últimas lecturas del sensor.
 * @param limit Cantidad de lecturas a traer (default 20)
 */
export const fetchLatestReadings = async (limit: number = 20): Promise<SensorReading[]> => {
  try {
    const url = `${API_BASE_URL}/sensor/readings/${DEVICE_ID}?limit=${limit}`;
    const response = await fetch(url);

    // Si no encuentra el dispositivo o datos (404) devolvemos array vacío limpio
    if (response.status === 404 || response.status === 422) {
      return [];
    }

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
    
  } catch (error) {
    console.error("Error en sensorService:", error);
    throw error; // Relanzamos para que la pantalla decida qué mostrar (alerta, toast, etc)
  }
};

/**
 * (Opcional) Función para futuras expansiones, por si quieres enviar datos manualmente
 */
export const sendSensorData = async (batch: any) => {
    // ... lógica de POST futura
};