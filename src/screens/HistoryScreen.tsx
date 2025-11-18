import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import ScreenWithMenuPush from '../components/ScreenWithMenuPush';
import { colors } from '../theme/colors';
import { LineChart } from 'react-native-chart-kit';

// 1. Importamos el servicio modular
import { 
  fetchLatestReadings, 
  DEVICE_ID, 
  SensorReading 
} from '../data/sensorService';

const screenWidth = Dimensions.get('window').width;
const CHART_HEIGHT = 200;

type RangeKey = 'today' | '7d' | '30d' | 'custom';

export default function HistoryScreen() {
  // Estados
  const [range, setRange] = useState<RangeKey>('today');
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Etiqueta dinámica
  const rangeLabel = useMemo(() => {
    switch (range) {
      case 'today': return 'Últimas lecturas (Hoy)';
      case '7d': return 'Últimos 7 días';
      case '30d': return 'Últimos 30 días';
      case 'custom': return 'Rango personalizado';
      default: return '';
    }
  }, [range]);

  // 2. Función para cargar datos según el rango
  const loadHistory = useCallback(async () => {
    try {
      // Mapeamos el rango visual a un "límite" de la API
      // Nota: Idealmente tu API soportaría ?startDate=... pero por ahora usamos 'limit'
      let limit = 20; // Default 'today'
      if (range === '7d') limit = 100;
      if (range === '30d') limit = 300;
      
      const data = await fetchLatestReadings(limit);
      
      // La API devuelve [Más nuevo ... Más viejo]
      // Para gráficas necesitamos [Más viejo ... Más nuevo] (Izquierda a derecha)
      // Hacemos una copia y revertimos
      setReadings([...data].reverse());
    } catch (error) {
      console.error("Error cargando historial", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [range]);

  // Efecto para recargar cuando cambia el rango
  useEffect(() => {
    setLoading(true);
    loadHistory();
  }, [loadHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  // 3. Preparación de datos para Charts
  // Helper para hora "10:05" o fecha "18 Nov" según densidad
  const formatLabel = (ts: string) => {
    const date = new Date(ts);
    if (range === 'today') {
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  // Si no hay datos, usamos placeholders para que no truene el chart
  const hasData = readings.length > 0;
  
  // Optimizamos etiquetas para no saturar el eje X (tomamos solo 6 etiquetas equidistantes)
  const allLabels = hasData ? readings.map(r => formatLabel(r.timestamp)) : ['00:00'];
  const chartLabels = hasData && allLabels.length > 6 
    ? allLabels.filter((_, index) => index % Math.ceil(allLabels.length / 6) === 0)
    : allLabels;

  // Valores numéricos (filtrando nulos)
  const heartData = hasData ? readings.map(r => r.heart_rate || 0) : [0];
  const spo2Data = hasData ? readings.map(r => r.spo2 || 0) : [0];
  const tempData = hasData ? readings.map(r => r.temperature || 0) : [0];

  // Configuración base del chart
  const baseChartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.5})`,
    propsForDots: { r: '3', strokeWidth: '1' },
    propsForBackgroundLines: { stroke: colors.border, strokeDasharray: '4,4', strokeOpacity: 0.4 },
  };

  return (
    <ScreenWithMenuPush
      deviceStatus={loading ? "Actualizando..." : (!hasData ? "Sin señal" : "Conectado")}
      deviceId={DEVICE_ID}
      scroll
      contentContainerStyle={styles.content}
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
      <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
      <Text style={styles.title}>Historial</Text>
      <Text style={styles.subtitle}>{rangeLabel} · {DEVICE_ID}</Text>
      </View>
      </View>

      {/* Selector de rango */}
      <View style={styles.rangeRow}>
      <RangeButton label="Hoy" active={range === 'today'} onPress={() => setRange('today')} />
      <RangeButton label="7 días" active={range === '7d'} onPress={() => setRange('7d')} />
      <RangeButton label="30 días" active={range === '30d'} onPress={() => setRange('30d')} />
      </View>

      {loading ? (
      <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.accent} />
      </View>
      ) : !hasData ? (
      <View style={styles.emptyState}>
      <Text style={{ color: colors.muted, fontSize: 18, fontWeight: '600' }}>Sin señal</Text>
      <Text style={{ color: colors.dim, fontSize: 13, marginTop: 8 }}>No hay datos disponibles para este rango.</Text>
      </View>
      ) : (
      <>
      {/* --- Chart: Ritmo Cardíaco --- */}
      <View style={styles.cardBlock}>
      <Text style={styles.cardTitle}>Ritmo cardíaco (bpm)</Text>
      <Text style={styles.cardSub}>Tendencia</Text>
      <View style={styles.chartWrapper}>
        <LineChart
        data={{
        labels: chartLabels,
        datasets: [{ data: heartData, color: () => colors.danger, strokeWidth: 2 }],
        }}
        width={screenWidth - 36}
        height={CHART_HEIGHT}
        yAxisSuffix=""
        chartConfig={{
        ...baseChartConfig,
        color: (opacity = 1) => colors.danger,
        propsForDots: { r: '2', stroke: colors.danger, fill: colors.danger }
        }}
        bezier
        style={styles.chartStyle}
        withVerticalLines={false}
        />
      </View>
      <View style={styles.statsRow}>
        <MiniStat label="Promedio" value={`${avg(heartData)} bpm`} />
        <MiniStat label="Máximo" value={`${max(heartData)} bpm`} />
        <MiniStat label="Mínimo" value={`${min(heartData)} bpm`} />
      </View>
      </View>

      {/* --- Chart: SpO2 --- */}
      <View style={styles.cardBlock}>
      <Text style={styles.cardTitle}>Oxigenación (SpO₂ %)</Text>
      <Text style={styles.cardSub}>Saturación de oxígeno</Text>
      <View style={styles.chartWrapper}>
        <LineChart
        data={{
        labels: chartLabels,
        datasets: [{ data: spo2Data, color: () => colors.accent, strokeWidth: 2 }],
        }}
        width={screenWidth - 36}
        height={CHART_HEIGHT}
        yAxisSuffix="%"
        chartConfig={{
        ...baseChartConfig,
        propsForDots: { r: '2', stroke: colors.accent, fill: colors.accent }
        }}
        bezier
        style={styles.chartStyle}
        withVerticalLines={false}
        />
      </View>
      <View style={styles.statsRow}>
        <MiniStat label="Promedio" value={`${avg(spo2Data)}%`} />
        <MiniStat label="Mínimo" value={`${min(spo2Data)}%`} />
        <MiniStat label="Objetivo" value="> 95%" />
      </View>
      </View>

      {/* --- Chart: Temperatura --- */}
      <View style={styles.cardBlock}>
      <Text style={styles.cardTitle}>Temperatura (°C)</Text>
      <Text style={styles.cardSub}>Corporal</Text>
      <View style={styles.chartWrapper}>
        <LineChart
        data={{
        labels: chartLabels,
        datasets: [{ data: tempData, color: () => colors.warning, strokeWidth: 2 }],
        }}
        width={screenWidth - 36}
        height={CHART_HEIGHT}
        yAxisSuffix="°"
        chartConfig={{
        ...baseChartConfig,
        decimalPlaces: 1,
        propsForDots: { r: '2', stroke: colors.warning, fill: colors.warning }
        }}
        bezier
        style={styles.chartStyle}
        withVerticalLines={false}
        />
      </View>
      <View style={styles.statsRow}>
        <MiniStat label="Promedio" value={`${avg(tempData)} °C`} />
        <MiniStat label="Máxima" value={`${max(tempData)} °C`} />
      </View>
      </View>
      </>
      )}

      <Text style={styles.disclaimer}>
      Datos obtenidos del sensor {DEVICE_ID}.
      </Text>
    </ScreenWithMenuPush>
  );
}

/* --- Utils --- */
function avg(arr: number[]) {
  if (!arr.length) return 0;
  // Filtramos 0s si quieres evitar ceros en el promedio
  const valid = arr.filter(n => n > 0);
  if (!valid.length) return 0;
  const sum = valid.reduce((a, b) => a + b, 0);
  return Math.round((sum / valid.length) * 10) / 10;
}
function min(arr: number[]) {
  const valid = arr.filter(n => n > 0); // Ignorar ceros/nulos
  return valid.length ? Math.min(...valid) : 0;
}
function max(arr: number[]) {
  return arr.length ? Math.max(...arr) : 0;
}

/* --- Componentes UI --- */
function RangeButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.rangeBtn, active && styles.rangeBtnActive]}>
      <Text style={[styles.rangeBtnText, active && styles.rangeBtnTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatValue}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

/* --- Estilos --- */
const styles = StyleSheet.create({
  content: { paddingBottom: 24 },
  sectionHeader: { marginBottom: 16 },
  title: { color: colors.text, fontSize: 20, fontWeight: '600' },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 4 },
  rangeRow: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 8, rowGap: 8, marginBottom: 24 },
  rangeBtn: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  rangeBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  rangeBtnText: { color: colors.text, fontSize: 13, fontWeight: '500' },
  rangeBtnTextActive: { color: colors.blackOnAccent, fontWeight: '600' },
  cardBlock: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 20 },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  cardSub: { color: colors.muted, fontSize: 13, marginTop: 4, marginBottom: 12 },
  chartWrapper: { borderRadius: 12, overflow: 'hidden', marginBottom: 12, marginHorizontal: -8 }, // Ajuste negativo para ganar espacio
  chartStyle: { borderRadius: 12, paddingRight: 40 }, // Padding right ayuda a que no se corte el último label
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 12, marginTop: 8 },
  miniStat: { minWidth: 80 },
  miniStatValue: { color: colors.text, fontSize: 14, fontWeight: '600' },
  miniStatLabel: { color: colors.muted, fontSize: 12 },
  disclaimer: { color: colors.dim, fontSize: 12, textAlign: 'center', marginTop: 16 },
  emptyState: { padding: 40, alignItems: 'center', justifyContent: 'center' }
});