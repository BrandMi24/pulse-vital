import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import ScreenWithMenuPush from '../components/ScreenWithMenuPush';
import { colors } from '../theme/colors';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;
const CHART_HEIGHT = 140;

export default function LiveScreen() {
  // simulación de la última lectura en vivo
  const liveReading = {
    timestamp: '2025-10-16T10:21:30',
    heart_rate: 81,
    spo2: 96,
    temperature: 98.6,
    device_id: 'MAX30102_001',
    device_status: 'Conectado',
    latencySeconds: 2, // hace cuántos segundos llegó el último paquete
  };

  // simulación de buffer en vivo para el gráfico tipo monitor cardiaco
  // idea: últimos N puntos (bpm)
  const hrStream = [80, 82, 81, 83, 79, 85, 81, 80, 82, 81, 83, 81];

  // calculamos alertas “inteligentes” (más adelante esto sale de backend)
  const alerts = useMemo(() => {
    const list: { level: 'ok' | 'warn' | 'danger'; text: string }[] = [];

    // chequeo pulso
    if (liveReading.heart_rate > 120 || liveReading.heart_rate < 45) {
      list.push({
        level: 'danger',
        text: 'Ritmo cardiaco fuera de rango',
      });
    }

    // chequeo spo2
    if (liveReading.spo2 < 94) {
      list.push({
        level: 'danger',
        text: 'Oxigenación baja',
      });
    } else if (liveReading.spo2 < 96) {
      list.push({
        level: 'warn',
        text: 'Oxigenación levemente reducida',
      });
    }

    // chequeo temperatura
    if (liveReading.temperature >= 100.4) {
      list.push({
        level: 'warn',
        text: 'Temperatura elevada (posible fiebre)',
      });
    }

    if (list.length === 0) {
      list.push({
        level: 'ok',
        text: 'Sin anomalías detectadas',
      });
    }

    return list;
  }, [liveReading]);

  return (
    <ScreenWithMenuPush
      userName="Gerardo"
      deviceStatus={liveReading.device_status}
      deviceId={liveReading.device_id}
      avatarLabel="G"
      scroll
      contentContainerStyle={styles.content}
    >
      {/* ENCABEZADO LOCAL */}
      <View style={styles.liveHeaderCard}>
        <View style={{ flex: 1 }}>
          <View style={styles.liveRow}>
            <PulseDot isActive={liveReading.device_status === 'Conectado'} />
            <Text style={styles.liveStatusText}>
              {liveReading.device_status === 'Conectado'
                ? 'Monitoreo activo'
                : 'Sin señal'}
            </Text>
          </View>

          <Text style={styles.liveSubText}>
            Última lectura hace {liveReading.latencySeconds}s
          </Text>

          <Text style={styles.liveSubTextDim}>
            Dispositivo · {liveReading.device_id}
          </Text>
        </View>

        <View style={styles.tagPill}>
          <Text style={styles.tagPillText}>EN VIVO</Text>
        </View>
      </View>

      {/* TARJETAS GRANDES EN VIVO */}
      <View style={styles.metricsRow}>
        <MetricBig
          label="Ritmo cardíaco"
          value={`${liveReading.heart_rate} bpm`}
          status="Normal"
          color={colors.danger}
          icon="❤️"
        />
        <MetricBig
          label="SpO₂"
          value={`${liveReading.spo2}%`}
          status={
            liveReading.spo2 < 94
              ? 'Bajo'
              : liveReading.spo2 < 96
              ? 'Atención'
              : 'Óptimo'
          }
          color={colors.accent}
          icon="💨"
        />
      </View>

      <View style={styles.metricsRow}>
        <MetricBig
          label="Temp."
          value={`${liveReading.temperature} °F`}
          status={
            liveReading.temperature >= 100.4
              ? 'Fiebre'
              : 'Sin fiebre'
          }
          color={colors.warning}
          icon="🌡️"
        />
      </View>

      {/* MINI GRAFICA DE PULSO EN TIEMPO REAL */}
      <View style={styles.chartBlock}>
        <Text style={styles.chartTitle}>Pulso en tiempo real</Text>
        <Text style={styles.chartSub}>
          Últimos {hrStream.length} puntos · bpm
        </Text>

        <View style={styles.chartWrapper}>
          <LineChart
            data={{
              labels: Array(hrStream.length).fill(''), // sin labels abajo para que se vea limpio
              datasets: [
                {
                  data: hrStream,
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
            bezier
            chartConfig={{
              backgroundColor: colors.card,
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              decimalPlaces: 0,
              color: () => colors.text,
              labelColor: () => colors.muted,
              propsForBackgroundLines: {
                stroke: colors.border,
                strokeDasharray: '4,4',
                strokeOpacity: 0.4,
              },
            }}
            style={styles.chartStyle}
          />
        </View>
      </View>

      {/* BLOQUE DE ALERTAS */}
      <View style={styles.alertBlock}>
        <Text style={styles.alertTitle}>Alertas / Recomendaciones</Text>

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

      {/* DISCLAIMER */}
      <Text style={styles.disclaimer}>
        Si presentas mareo, dolor en el pecho, dificultad para respirar
        o fiebre alta, busca atención médica inmediata.
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
  label,
  value,
  status,
  color,
  icon,
}: {
  label: string;
  value: string;
  status: string;
  color: string;
  icon: string;
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

/* -------- estilos -------- */

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },

  /* ----- bloque EN VIVO arriba ----- */
  liveHeaderCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  liveStatusText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  liveSubText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '400',
  },
  liveSubTextDim: {
    color: colors.dim,
    fontSize: 12,
    marginTop: 4,
  },
  tagPill: {
    position: 'absolute',
    right: 16,
    top: 16,
    backgroundColor: colors.danger,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#00000055',
  },
  tagPillText: {
    color: colors.background,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  /* ----- métricas grandes ----- */
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 12,
    marginBottom: 16,
  },

  metricBigCard: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 150,

    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
  },

  metricHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricIcon: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 6,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '500',
  },

  metricValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  metricStatus: {
    color: colors.dim,
    fontSize: 12,
    fontWeight: '400',
    marginTop: 4,
  },

  /* ----- gráfico en vivo ----- */
  chartBlock: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  chartTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  chartSub: {
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
  },
  chartStyle: {
    borderRadius: 12,
  },

  /* ----- alertas ----- */
  alertBlock: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  alertTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },

  alertRow: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
  },

  alertDanger: {
    backgroundColor: '#4c1d1d',
    borderColor: colors.danger,
  },
  alertWarn: {
    backgroundColor: '#423c1b',
    borderColor: colors.warning,
  },
  alertOk: {
    backgroundColor: '#1e2a25',
    borderColor: colors.accent,
  },

  alertText: {
    fontSize: 13,
    fontWeight: '500',
  },
  alertTextDanger: {
    color: colors.danger,
  },
  alertTextWarn: {
    color: colors.warning,
  },
  alertTextOk: {
    color: colors.accent,
  },

  /* ----- disclaimer ------ */
  disclaimer: {
    color: colors.dim,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
