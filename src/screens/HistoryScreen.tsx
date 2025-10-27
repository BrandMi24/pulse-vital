import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import ScreenWithMenuPush from '../components/ScreenWithMenuPush';
import { colors } from '../theme/colors';
import { LineChart } from 'react-native-chart-kit';

// ancho disponible de la pantalla
const screenWidth = Dimensions.get('window').width;
const CHART_HEIGHT = 180;

// Datos mock históricos
const mockData = [
  {
    timestamp: '2025-10-16T10:00:00',
    heart_rate: 78,
    spo2: 97,
    temperature: 98.4,
  },
  {
    timestamp: '2025-10-16T10:05:00',
    heart_rate: 82,
    spo2: 96,
    temperature: 98.5,
  },
  {
    timestamp: '2025-10-16T10:10:00',
    heart_rate: 79,
    spo2: 98,
    temperature: 98.4,
  },
  {
    timestamp: '2025-10-16T10:15:00',
    heart_rate: 90,
    spo2: 95,
    temperature: 99.1,
  },
  {
    timestamp: '2025-10-16T10:20:00',
    heart_rate: 76,
    spo2: 97,
    temperature: 98.2,
  },
];

type RangeKey = 'today' | '7d' | '30d' | 'custom';

export default function HistoryScreen() {
  const [range, setRange] = useState<RangeKey>('today');

  const rangeLabel = useMemo(() => {
    switch (range) {
      case 'today':
        return 'Últimas horas';
      case '7d':
        return 'Últimos 7 días';
      case '30d':
        return 'Últimos 30 días';
      case 'custom':
        return 'Rango personalizado';
      default:
        return '';
    }
  }, [range]);

  // Helpers para labels de eje X tipo "10:05"
  function shortTime(ts: string) {
    const d = new Date(ts);
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }

  // Sacamos arrays separados por métrica
  const labels = mockData.map(p => shortTime(p.timestamp));
  const heartValues = mockData.map(p => p.heart_rate);
  const spo2Values = mockData.map(p => p.spo2);
  const tempValues = mockData.map(p => p.temperature);

  // config base de los charts para que vayan con tu dark theme
  const baseChartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 1,
    color: () => colors.text,            // color de la línea de ejes, labels
    labelColor: () => colors.muted,      // color de labels del eje X/Y
    propsForDots: {
      r: '3',
      strokeWidth: '2',
    },
    propsForBackgroundLines: {
      stroke: colors.border,
      strokeDasharray: '4,4',
      strokeOpacity: 0.4,
    },
  } as const;

  return (
    <ScreenWithMenuPush
      userName="Gerardo"
      deviceStatus="Conectado"
      deviceId="MAX30102_001"
      avatarLabel="G"
      scroll
      contentContainerStyle={styles.content}
    >
      {/* Encabezado de la pantalla */}
      <View style={styles.sectionHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Historial</Text>
          <Text style={styles.subtitle}>
            {rangeLabel} · MAX30102_001
          </Text>
        </View>
      </View>

      {/* Selector de rango */}
      <View style={styles.rangeRow}>
        <RangeButton
          label="Hoy"
          active={range === 'today'}
          onPress={() => setRange('today')}
        />
        <RangeButton
          label="7 días"
          active={range === '7d'}
          onPress={() => setRange('7d')}
        />
        <RangeButton
          label="30 días"
          active={range === '30d'}
          onPress={() => setRange('30d')}
        />
        <RangeButton
          label="Custom"
          active={range === 'custom'}
          onPress={() => {
            // más adelante: abrir date picker y guardar rango custom
            setRange('custom');
          }}
        />
      </View>

      {/* Card: Ritmo cardíaco */}
      <View style={styles.cardBlock}>
        <Text style={styles.cardTitle}>Ritmo cardíaco (bpm)</Text>
        <Text style={styles.cardSub}>Tendencia reciente</Text>

        <View style={styles.chartWrapper}>
          <LineChart
            data={{
              labels,
              datasets: [
                {
                  data: heartValues,
                  color: () => colors.danger, // línea roja para pulso
                  strokeWidth: 2,
                },
              ],
            }}
            width={screenWidth - 32} // 16px padding izq, 16px der
            height={CHART_HEIGHT}
            yAxisSuffix=" bpm"
            withDots
            withShadow={false}
            withInnerLines={true}
            withOuterLines={false}
            bezier
            chartConfig={{
              ...baseChartConfig,
              decimalPlaces: 0,
              propsForDots: {
                r: '3',
                strokeWidth: '2',
                stroke: colors.danger,
                fill: colors.danger,
              },
            }}
            style={styles.chartStyle}
          />
        </View>

        <View style={styles.statsRow}>
          <MiniStat label="Promedio" value={`${avg(heartValues)} bpm`} />
          <MiniStat label="Máximo" value={`${max(heartValues)} bpm`} />
          <MiniStat label="Mínimo" value={`${min(heartValues)} bpm`} />
        </View>
      </View>

      {/* Card: SpO₂ */}
      <View style={styles.cardBlock}>
        <Text style={styles.cardTitle}>Oxigenación (SpO₂ %)</Text>
        <Text style={styles.cardSub}>Valores sobre el tiempo</Text>

        <View style={styles.chartWrapper}>
          <LineChart
            data={{
              labels,
              datasets: [
                {
                  data: spo2Values,
                  color: () => colors.accent, // verde/menta
                  strokeWidth: 2,
                },
              ],
            }}
            width={screenWidth - 32}
            height={CHART_HEIGHT}
            yAxisSuffix="%"
            withDots
            withShadow={false}
            withInnerLines={true}
            withOuterLines={false}
            bezier
            chartConfig={{
              ...baseChartConfig,
              decimalPlaces: 0,
              propsForDots: {
                r: '3',
                strokeWidth: '2',
                stroke: colors.accent,
                fill: colors.accent,
              },
            }}
            style={styles.chartStyle}
          />
        </View>

        <View style={styles.statsRow}>
          <MiniStat label="Promedio" value={`${avg(spo2Values)}%`} />
          <MiniStat label="Mín. crítico" value={`${min(spo2Values)}%`} />
          <MiniStat label="Objetivo" value="> 94%" />
        </View>
      </View>

      {/* Card: Temperatura */}
      <View style={styles.cardBlock}>
        <Text style={styles.cardTitle}>Temperatura corporal (°F)</Text>
        <Text style={styles.cardSub}>Monitoreo de fiebre</Text>

        <View style={styles.chartWrapper}>
          <LineChart
            data={{
              labels,
              datasets: [
                {
                  data: tempValues,
                  color: () => colors.warning, // amarillito fiebre
                  strokeWidth: 2,
                },
              ],
            }}
            width={screenWidth - 32}
            height={CHART_HEIGHT}
            yAxisSuffix="°F"
            withDots
            withShadow={false}
            withInnerLines={true}
            withOuterLines={false}
            bezier
            chartConfig={{
              ...baseChartConfig,
              decimalPlaces: 1,
              propsForDots: {
                r: '3',
                strokeWidth: '2',
                stroke: colors.warning,
                fill: colors.warning,
              },
            }}
            style={styles.chartStyle}
          />
        </View>

        <View style={styles.statsRow}>
          <MiniStat label="Actual" value={`${last(tempValues)} °F`} />
          <MiniStat label="Máxima" value={`${max(tempValues)} °F`} />
          <MiniStat label="Fiebre" value="> 100.4 °F" />
        </View>
      </View>

      {/* Disclaimer final */}
      <Text style={styles.disclaimer}>
        Los valores fuera de rango se marcarán automáticamente en rojo. Esta
        información no reemplaza una evaluación médica profesional.
      </Text>
    </ScreenWithMenuPush>
  );
}

/* Utils simples para stats */
function avg(arr: number[]) {
  if (!arr.length) return 0;
  const sum = arr.reduce((acc, v) => acc + v, 0);
  return Math.round((sum / arr.length) * 10) / 10;
}
function min(arr: number[]) {
  return Math.min(...arr);
}
function max(arr: number[]) {
  return Math.max(...arr);
}
function last(arr: number[]) {
  return arr[arr.length - 1];
}

/* Subcomponents */
function RangeButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.rangeBtn, active && styles.rangeBtnActive]}
    >
      <Text
        style={[
          styles.rangeBtnText,
          active && styles.rangeBtnTextActive,
        ]}
      >
        {label}
      </Text>
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

/* Styles */
const styles = StyleSheet.create({
  content: {
    paddingBottom: 24, // luego ScreenWithMenuPush mete más pb con safe area
  },

  sectionHeader: {
    marginBottom: 16,
  },

  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },

  rangeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 8,
    rowGap: 8,
    marginBottom: 24,
  },

  rangeBtn: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  rangeBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  rangeBtnText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  rangeBtnTextActive: {
    color: colors.blackOnAccent,
    fontWeight: '600',
  },

  cardBlock: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 20,
  },

  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  cardSub: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 12,
  },

  chartWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: 12,
  },

  chartStyle: {
    borderRadius: 12,
  },

  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 16,
    rowGap: 12,
  },
  miniStat: {
    minWidth: 80,
  },
  miniStatValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  miniStatLabel: {
    color: colors.muted,
    fontSize: 12,
  },

  disclaimer: {
    color: colors.dim,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
});
