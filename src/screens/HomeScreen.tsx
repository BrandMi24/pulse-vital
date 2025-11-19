import React, { useMemo, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import ScreenWithMenuPush from '../components/ScreenWithMenuPush';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

// 1. IMPORTE MODULAR: Traemos la configuración y tipos desde tu nuevo servicio
import { 
  fetchLatestReadings, 
  DEVICE_ID, 
  SensorReading 
} from '../data/sensorService';

// Definimos el estado local para la UI de esta pantalla
interface SummaryState {
  lastSessionAgo: string;
  device_id: string;
  device_status: 'Conectado' | 'Sin señal' | 'Cargando...';
  heart_rate_avg: number | string;
  heart_rate_status: string;
  spo2_avg: number | string;
  spo2_status: string;
  temperature_avg: number | string;
  temperature_status: string;
  hadAlert: boolean;
  lastAlertText: string;
}

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 2. Estados dinámicos
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  
  const [summary, setSummary] = useState<SummaryState>({
    lastSessionAgo: '--',
    device_id: DEVICE_ID, // Usamos la constante importada del servicio
    device_status: 'Cargando...',
    heart_rate_avg: '--',
    heart_rate_status: 'Espere...',
    spo2_avg: '--',
    spo2_status: 'Espere...',
    temperature_avg: '--',
    temperature_status: 'Espere...',
    hadAlert: false,
    lastAlertText: '',
  });

  // 3. Función modularizada para obtener datos
  const loadData = useCallback(async () => {
    try {
      // Llamamos al servicio en lugar de hacer fetch manual aquí
      const data = await fetchLatestReadings();

      if (data.length > 0) {
        processData(data);
      } else {
        // Si el array está vacío, es que no hay datos o falló silenciosamente
        setSummary(prev => ({ ...prev, device_status: 'Sin señal', lastSessionAgo: 'Nunca' }));
        setReadings([]);
      }

    } catch (error) {
      console.log("Error en Home:", error);
      setSummary(prev => ({ ...prev, device_status: 'Sin señal' }));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // 4. Lógica de procesamiento visual (esto sí pertenece a la pantalla)
  const processData = (data: SensorReading[]) => {
    const latest = data[0];
    
    // Calcular tiempo transcurrido
    const now = new Date();
    const lastDate = new Date(latest.timestamp);
    const diffMs = now.getTime() - lastDate.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    let timeAgoText = `${diffMins} min`;
    if (diffMins > 60) timeAgoText = `${Math.round(diffMins / 60)} h`;
    if (diffMins > 1440) timeAgoText = `${Math.round(diffMins / 1440)} días`;

    // Si hace más de 5 mins no recibimos nada, asumimos desconectado
    const isConnected = diffMins < 5;

    // Filtrar nulos para promedios
    const validHeart = data.filter(r => r.heart_rate !== null).map(r => r.heart_rate as number);
    const validSpo2 = data.filter(r => r.spo2 !== null).map(r => r.spo2 as number);
    const validTemp = data.filter(r => r.temperature !== null).map(r => r.temperature as number);

    const avgHr = validHeart.length ? Math.round(validHeart.reduce((a, b) => a + b, 0) / validHeart.length) : 0;
    const avgSpo2 = validSpo2.length ? Math.round(validSpo2.reduce((a, b) => a + b, 0) / validSpo2.length) : 0;
    const avgTemp = validTemp.length ? (validTemp.reduce((a, b) => a + b, 0) / validTemp.length).toFixed(1) : 0;

    // Estatus visuales
    const hrStatus = avgHr > 100 ? 'Elevado' : avgHr < 60 ? 'Bajo' : 'Normal';
    const spo2Status = avgSpo2 < 95 ? 'Bajo' : 'Óptimo';
    const tempStatus = Number(avgTemp) > 37.5 ? 'Fiebre' : 'Normal'; 

    // Detectar alerta solo en la última lectura
    let alertText = '';
    let hasAlert = false;
    
    if (latest.spo2 && latest.spo2 < 90) {
      hasAlert = true;
      alertText = `Oxigenación crítica (${latest.spo2}%) detectada.`;
    } else if (latest.heart_rate && latest.heart_rate > 120) {
      hasAlert = true;
      alertText = `Ritmo cardíaco alto (${latest.heart_rate} bpm).`;
    }

    setReadings(data);
    setSummary({
      device_id: latest.device_id,
      lastSessionAgo: timeAgoText,
      device_status: isConnected ? 'Conectado' : 'Sin señal',
      heart_rate_avg: avgHr || '--',
      heart_rate_status: hrStatus,
      spo2_avg: avgSpo2 || '--',
      spo2_status: spo2Status,
      temperature_avg: avgTemp || '--',
      temperature_status: tempStatus,
      hadAlert: hasAlert,
      lastAlertText: alertText
    });
  };

  // Cargar datos al montar
  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // 5. Tendencias para UI (Sparklines)
  // La API da [nuevo, viejo...], para graficar necesitamos [viejo, nuevo...]
  const heartTrend = useMemo(() => readings.map(r => r.heart_rate || 0).reverse(), [readings]);
  const spo2Trend = useMemo(() => readings.map(r => r.spo2 || 0).reverse(), [readings]);
  const tempTrend = useMemo(() => readings.map(r => r.temperature || 0).reverse(), [readings]);

  // Recomendación dinámica
  const recommendation = useMemo(() => {
    if (summary.hadAlert) return 'Se detectaron valores críticos. Revisa tu historial.';
    if (typeof summary.heart_rate_avg === 'number' && summary.heart_rate_avg > 90) return 'Tu ritmo es algo alto. Relájate unos minutos.';
    if (typeof summary.spo2_avg === 'number' && summary.spo2_avg < 95) return 'Oxigenación baja. Respira profundo.';
    return 'Tus signos vitales se ven estables. ¡Sigue así! 👍';
  }, [summary]);

  return (
    <ScreenWithMenuPush
      deviceStatus={summary.device_status}
      deviceId={summary.device_id}
      scroll
      contentContainerStyle={styles.content}
      // 👇 ahora el refreshControl va dentro de scrollProps
      scrollProps={{
        refreshControl: (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        ),
      }}
    >
      {loading ? (
        <View style={{ padding: 40, alignItems: 'center' }}>
           <ActivityIndicator size="large" color={colors.accent} />
           <Text style={{ color: colors.muted, marginTop: 10 }}>Sincronizando...</Text>
        </View>
      ) : (
        <>
          {/* Resumen de Hoy */}
          <View style={styles.statusCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.statusTitle}>Resumen de hoy</Text>
              <Text style={styles.statusSub}>
                Última lectura: hace {summary.lastSessionAgo}
              </Text>
              <Text style={styles.statusSubDim}>
                Dispositivo · {summary.device_id}{' '}
                <Text style={{ 
                  color: summary.device_status === 'Conectado' ? colors.accent : colors.dim, 
                  fontWeight: 'bold' 
                }}>
                   · {summary.device_status}
                </Text>
              </Text>

              {summary.hadAlert ? (
                <Text style={styles.statusAlertDanger}>{summary.lastAlertText}</Text>
              ) : (
                <Text style={styles.statusSafe}>Sin alertas críticas recientes</Text>
              )}
            </View>

            <View style={[styles.badgeStable, summary.hadAlert ? { backgroundColor: colors.danger } : {}]}>
              <Text style={styles.badgeStableText}>{summary.hadAlert ? 'ALERTA' : 'ESTABLE'}</Text>
            </View>
          </View>

          {/* Métricas */}
          <View style={styles.metricsRow}>
            <MetricSummary
              label="Ritmo cardíaco"
              value={`${summary.heart_rate_avg} bpm`}
              status={summary.heart_rate_status}
              color={colors.danger}
              trend={heartTrend}
              icon="❤️"
            />
            <MetricSummary
              label="SpO₂"
              value={`${summary.spo2_avg}%`}
              status={summary.spo2_status}
              color={colors.accent}
              trend={spo2Trend}
              icon="💨"
            />
          </View>

          {/* Recomendación */}
          <View style={styles.recoBlock}>
            <Text style={styles.recoTitle}>Recomendación</Text>
            <Text style={styles.recoText}>{recommendation}</Text>
            <Text style={styles.recoDisclaimer}>
              Nota: Datos obtenidos del sensor MAX30102. No es diagnóstico médico.
            </Text>
          </View>

          {/* Alertas recientes (simplificado para Home) */}
          <View style={styles.alertsBlock}>
            <Text style={styles.alertsTitle}>Estado del Sensor</Text>
            {summary.hadAlert ? (
              <View style={[styles.alertItem, styles.alertItemDanger]}>
                <Text style={styles.alertItemTextDanger}>{summary.lastAlertText}</Text>
                <Text style={styles.alertItemTime}>Reciente</Text>
              </View>
            ) : (
              <View style={[styles.alertItem, styles.alertItemOk]}>
                <Text style={styles.alertItemTextOk}>Lecturas normales</Text>
                <Text style={styles.alertItemTime}>Últimas 1000 muestras</Text>
              </View>
            )}
          </View>

          <Text style={styles.footerDisclaimer}>Pulse Vital App v0.1.0</Text>
        </>
      )}
    </ScreenWithMenuPush>
  );
}

// --- Componentes visuales auxiliares (sin cambios de lógica) ---

function MetricSummary({
  label, value, status, color, trend, icon, fullWidth
}: {
  label: string; value: string; status: string; color: string; trend: number[]; icon: string; fullWidth?: boolean;
}) {
  return (
    <View style={[styles.metricCard, fullWidth && styles.metricCardFull]}>
      <View style={styles.metricHeaderRow}>
        <Text style={[styles.metricIcon, { color }]}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.metricLabel}>{label}</Text>
          <Text style={[styles.metricValue, { color }]}>{value}</Text>
        </View>
      </View>
      <Sparkline trend={trend} color={color} />
      <Text style={styles.metricStatusText}>{status}</Text>
    </View>
  );
}

function Sparkline({ trend, color }: { trend: number[]; color: string }) {
  if (!trend || trend.length < 2) {
    return (
      <View style={styles.sparkWrapper}>
         <View style={[styles.sparkLineBg, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ fontSize: 10, color: colors.dim }}>...</Text>
         </View>
      </View>
    );
  }
  const first = trend[0];
  const last = trend[trend.length - 1];
  const diff = last - first;
  const diffLabel = diff === 0 ? 'sin cambio' : diff > 0 ? `+${diff}` : `${diff}`;

  return (
    <View style={styles.sparkWrapper}>
      <View style={styles.sparkLineBg}>
        <View
          style={[
            styles.sparkFakeLine,
            { borderColor: color, shadowColor: color },
          ]}
        />
      </View>
      <View style={styles.sparkInfoRow}>
        <Text style={styles.sparkInfoText}>Tendencia: {diffLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24 },
  statusCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, marginBottom: 20 },
  statusTitle: { color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 4 },
  statusSub: { color: colors.muted, fontSize: 13, fontWeight: '400' },
  statusSubDim: { color: colors.dim, fontSize: 12, marginTop: 4 },
  statusSafe: { color: colors.accent, fontSize: 13, fontWeight: '500', marginTop: 10 },
  statusAlertDanger: { color: colors.danger, fontSize: 13, fontWeight: '500', marginTop: 10 },
  badgeStable: { position: 'absolute', right: 16, top: 16, backgroundColor: colors.accent, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: '#00000055' },
  badgeStableText: { color: colors.blackOnAccent, fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 12, marginBottom: 16 },
  metricCard: { flexBasis: '48%', flexGrow: 1, minWidth: 150, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16 },
  metricCardFull: { flexBasis: '100%' },
  metricHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  metricIcon: { fontSize: 18, fontWeight: '600', marginRight: 8 },
  metricLabel: { color: colors.muted, fontSize: 13, fontWeight: '500', marginBottom: 4 },
  metricValue: { fontSize: 22, fontWeight: '700' },
  sparkWrapper: { marginBottom: 8 },
  sparkLineBg: { borderRadius: 8, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, height: 40, overflow: 'hidden', marginBottom: 6 },
  sparkFakeLine: { position: 'absolute', left: 12, right: 12, top: 8, bottom: 8, borderWidth: 2, borderRadius: 16, opacity: 0.8, transform: [{ skewX: '18deg' }] },
  sparkInfoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sparkInfoText: { color: colors.dim, fontSize: 12, fontWeight: '400' },
  metricStatusText: { color: colors.dim, fontSize: 12, fontWeight: '400' },
  recoBlock: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, marginBottom: 16 },
  recoTitle: { color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 8 },
  recoText: { color: colors.text, fontSize: 14, fontWeight: '500', lineHeight: 20, marginBottom: 8 },
  recoDisclaimer: { color: colors.dim, fontSize: 12 },
  alertsBlock: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, marginBottom: 16 },
  alertsTitle: { color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 12 },
  alertItem: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, marginBottom: 8 },
  alertItemDanger: { backgroundColor: '#4c1d1d', borderColor: colors.danger },
  alertItemOk: { backgroundColor: '#1e2a25', borderColor: colors.accent },
  alertItemTextDanger: { color: colors.danger, fontSize: 13, fontWeight: '500' },
  alertItemTextOk: { color: colors.accent, fontSize: 13, fontWeight: '500' },
  alertItemTime: { color: colors.dim, fontSize: 11, fontWeight: '400', marginTop: 4 },
  footerDisclaimer: { color: colors.dim, fontSize: 12, textAlign: 'center', marginTop: 8 },
});