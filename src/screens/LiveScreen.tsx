import React, { useMemo, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // Importante para pausar al salir
import ScreenWithMenuPush from '../components/ScreenWithMenuPush';
import { colors } from '../theme/colors';
import { LineChart } from 'react-native-chart-kit';

// 1. Importamos el servicio
import { 
  fetchLatestReadings, 
  DEVICE_ID, 
  SensorReading 
} from '../data/sensorService';

const screenWidth = Dimensions.get('window').width;
const CHART_HEIGHT = 140;
const POLLING_INTERVAL = 3000; // Actualizar cada 3 segundos

export default function LiveScreen() {
  // --- Estados ---
  const [latest, setLatest] = useState<SensorReading | null>(null);
  const [hrHistory, setHrHistory] = useState<number[]>(new Array(15).fill(0)); // Buffer inicial
  const [deviceStatus, setDeviceStatus] = useState<'Conectado' | 'Sin señal' | 'Buscando...'>('Buscando...');
  const [latency, setLatency] = useState(0);
  
  // Usamos useRef para guardar el ID del intervalo y poder limpiarlo
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isFetchingRef = useRef(false);

  // --- Función de carga (Polling) ---
  const refreshData = useCallback(async () => {

    if (isFetchingRef.current) return;   // evita solapar requests
    isFetchingRef.current = true;

    try {
      // Pedimos los últimos 15 datos para llenar la gráfica de golpe
      // Esto asegura que la gráfica siempre esté sincronizada con el servidor
      const data = await fetchLatestReadings(15);

      if (data && data.length > 0) {
        const newest = data[0];
        setLatest(newest);

        // Calcular latencia (tiempo real vs tiempo del dato)
        const now = new Date();
        const readingTime = new Date(newest.timestamp);
        const diffSeconds = Math.round((now.getTime() - readingTime.getTime()) / 1000);
        setLatency(diffSeconds > 0 ? diffSeconds : 0);

        // Determinar estatus basado en latencia
        // Si el dato tiene más de 1 minuto de antigüedad, el sensor probablemente se apagó
        if (diffSeconds < 60) {
          setDeviceStatus('Conectado');
        } else {
          setDeviceStatus('Sin señal');
        }

        // Actualizar gráfica: Extraemos el pulso, invertimos para cronología y filtramos nulos
        // La API da [Nuevo -> Viejo], Chart necesita [Viejo -> Nuevo]
        const historyValues = data.map(r => r.heart_rate || 0).reverse();
        setHrHistory(historyValues);
        
      } else {
        setDeviceStatus('Sin señal');
      }
    } catch (error) {
      console.log("Error polling live data:", error);
      // No cambiamos el estado a error fatal para no parpadear la UI, solo mantenemos el último
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  // --- Ciclo de vida: Iniciar/Detener Polling ---
  // Usamos useFocusEffect para que solo consuma datos cuando la pantalla está visible
  useFocusEffect(
    useCallback(() => {
      // 1. Carga inicial inmediata
      refreshData();

      // 2. Iniciar intervalo
      intervalRef.current = setInterval(refreshData, POLLING_INTERVAL);

      // 3. Limpiar al salir de la pantalla
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [refreshData])
  );

  // --- Lógica de Alertas (Memoized) ---
  const alerts = useMemo(() => {
    const list: { level: 'ok' | 'warn' | 'danger'; text: string }[] = [];

    if (!latest) return list;

    const hr = latest.heart_rate || 0;
    const spo2 = latest.spo2 || 0;
    const temp = latest.temperature || 0;

    // chequeo pulso
    if (hr > 120) list.push({ level: 'danger', text: 'Ritmo cardiaco muy alto (>120)' });
    else if (hr < 45 && hr > 0) list.push({ level: 'warn', text: 'Ritmo cardiaco bajo (<45)' });

    // chequeo spo2
    if (spo2 > 0 && spo2 < 90) list.push({ level: 'danger', text: 'Oxigenación crítica (<90%)' });
    else if (spo2 > 0 && spo2 < 95) list.push({ level: 'warn', text: 'Oxigenación baja' });

    // chequeo temperatura
    if (temp >= 38) list.push({ level: 'warn', text: 'Temperatura elevada (>38°C)' });

    if (list.length === 0) {
      list.push({ level: 'ok', text: 'Parámetros estables' });
    }

    return list;
  }, [latest]);

  // Valores seguros para renderizar
  const displayHr = latest?.heart_rate ?? '--';
  const displaySpo2 = latest?.spo2 ?? '--';
  const displayTemp = latest?.temperature ?? '--';

  return (
    <ScreenWithMenuPush
      deviceStatus={deviceStatus}
      deviceId={DEVICE_ID}
      scroll
      contentContainerStyle={styles.content}
    >
      {/* ENCABEZADO LOCAL */}
      <View style={styles.liveHeaderCard}>
        <View style={{ flex: 1 }}>
          <View style={styles.liveRow}>
            <PulseDot isActive={deviceStatus === 'Conectado'} />
            <Text style={styles.liveStatusText}>
              {deviceStatus === 'Conectado' ? 'Monitoreo activo' : deviceStatus}
            </Text>
          </View>

          <Text style={styles.liveSubText}>
            Latencia: {latency}s {latency > 10 && '(Retraso)'}
          </Text>

          <Text style={styles.liveSubTextDim}>
            Dispositivo · {DEVICE_ID}
          </Text>
        </View>

        <View style={[styles.tagPill, deviceStatus !== 'Conectado' && { backgroundColor: colors.dim }]}>
          <Text style={styles.tagPillText}>EN VIVO</Text>
        </View>
      </View>

      {/* TARJETAS GRANDES EN VIVO */}
      <View style={styles.metricsRow}>
        <MetricBig
          label="Ritmo cardíaco"
          value={`${displayHr} bpm`}
          status={typeof displayHr === 'number' && displayHr > 100 ? 'Alto' : 'Normal'}
          color={colors.danger}
          icon="❤️"
        />
        <MetricBig
          label="SpO₂"
          value={`${displaySpo2}%`}
          status={typeof displaySpo2 === 'number' && displaySpo2 < 95 ? 'Bajo' : 'Óptimo'}
          color={colors.accent}
          icon="💨"
        />
      </View>

      <View style={styles.metricsRow}>
        <MetricBig
          label="Temp."
          value={`${displayTemp} °C`}
          status={typeof displayTemp === 'number' && displayTemp > 37.5 ? 'Alta' : 'Normal'}
          color={colors.warning}
          icon="🌡️"
        />
      </View>

      {/* GRAFICA DE PULSO EN TIEMPO REAL */}
      <View style={styles.chartBlock}>
        <Text style={styles.chartTitle}>Pulso en tiempo real</Text>
        <Text style={styles.chartSub}>
          Últimos {hrHistory.length} segundos · bpm
        </Text>

        <View style={styles.chartWrapper}>
          {hrHistory.length > 0 ? (
            <LineChart
              data={{
                labels: [], // Sin etiquetas X para limpieza visual
                datasets: [
                  {
                    data: hrHistory,
                    color: () => colors.danger,
                    strokeWidth: 2,
                  },
                ],
              }}
              width={screenWidth - 32}
              height={CHART_HEIGHT}
              withDots={false}
              withShadow={false}
              withInnerLines={true}
              withOuterLines={false}
              withVerticalLines={false}
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: colors.card,
                backgroundGradientFrom: colors.card,
                backgroundGradientTo: colors.card,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.3})`, // Grid tenue
                labelColor: () => colors.muted,
                propsForBackgroundLines: {
                  stroke: colors.border,
                  strokeDasharray: '4,4',
                  strokeOpacity: 0.3,
                },
              }}
              style={styles.chartStyle}
              bezier // Curva suave
            />
          ) : (
            <View style={{ height: CHART_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
               <ActivityIndicator color={colors.muted} />
            </View>
          )}
        </View>
      </View>

      {/* BLOQUE DE ALERTAS */}
      <View style={styles.alertBlock}>
        <Text style={styles.alertTitle}>Diagnóstico del Sensor</Text>

        {alerts.map((a, idx) => (
          <View
            key={idx}
            style={[
              styles.alertRow,
              a.level === 'danger' && styles.alertDanger,
              a.level === 'warn' && styles.alertWarn,
              a.level === 'ok' && styles.alertOk,
            ]}
          >
            <Text
              style={[
                styles.alertText,
                a.level === 'danger' && styles.alertTextDanger,
                a.level === 'warn' && styles.alertTextWarn,
                a.level === 'ok' && styles.alertTextOk,
              ]}
            >
              {a.text}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.disclaimer}>
        Si presentas mareo, dolor en el pecho o dificultad para respirar, busca atención médica.
      </Text>
    </ScreenWithMenuPush>
  );
}

/* -------- subcomponents internos -------- */

function PulseDot({ isActive }: { isActive: boolean }) {
  return (
    <View
      style={[
        styles.pulseDot,
        { backgroundColor: isActive ? colors.accent : colors.danger },
      ]}
    />
  );
}

function MetricBig({
  label, value, status, color, icon,
}: {
  label: string; value: string; status: string; color: string; icon: string;
}) {
  return (
    <View style={styles.metricBigCard}>
      <View style={styles.metricHeaderRow}>
        <Text style={[styles.metricIcon, { color }]}>{icon}</Text>
        <Text style={styles.metricLabel}>{label}</Text>
      </View>

      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricStatus}>{status}</Text>
    </View>
  );
}

/* -------- estilos (Idénticos al original) -------- */
const styles = StyleSheet.create({
  content: { paddingBottom: 24 },
  liveHeaderCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, marginBottom: 20 },
  liveRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  pulseDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  liveStatusText: { color: colors.text, fontSize: 15, fontWeight: '600' },
  liveSubText: { color: colors.muted, fontSize: 13, fontWeight: '400' },
  liveSubTextDim: { color: colors.dim, fontSize: 12, marginTop: 4 },
  tagPill: { position: 'absolute', right: 16, top: 16, backgroundColor: colors.danger, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: '#00000055' },
  tagPillText: { color: colors.background, fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 12, marginBottom: 16 },
  metricBigCard: { flexBasis: '48%', flexGrow: 1, minWidth: 150, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16 },
  metricHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  metricIcon: { fontSize: 18, fontWeight: '600', marginRight: 6 },
  metricLabel: { color: colors.muted, fontSize: 13, fontWeight: '500' },
  metricValue: { fontSize: 28, fontWeight: '700' },
  metricStatus: { color: colors.dim, fontSize: 12, fontWeight: '400', marginTop: 4 },
  chartBlock: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, marginBottom: 20 },
  chartTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  chartSub: { color: colors.muted, fontSize: 13, marginTop: 4, marginBottom: 12 },
  chartWrapper: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  chartStyle: { borderRadius: 12 },
  alertBlock: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, marginBottom: 16 },
  alertTitle: { color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 12 },
  alertRow: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 8, borderWidth: 1 },
  alertDanger: { backgroundColor: '#4c1d1d', borderColor: colors.danger },
  alertWarn: { backgroundColor: '#423c1b', borderColor: colors.warning },
  alertOk: { backgroundColor: '#1e2a25', borderColor: colors.accent },
  alertText: { fontSize: 13, fontWeight: '500' },
  alertTextDanger: { color: colors.danger },
  alertTextWarn: { color: colors.warning },
  alertTextOk: { color: colors.accent },
  disclaimer: { color: colors.dim, fontSize: 12, textAlign: 'center', marginTop: 8 },
});