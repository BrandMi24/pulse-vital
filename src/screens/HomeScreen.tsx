import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ScreenWithMenuPush from '../components/ScreenWithMenuPush';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

// Datos mock simulando "lo último guardado" (no en vivo)
const latestSummary = {
  lastSessionAgo: '2h', // "hace 2h" que se monitoreó en vivo
  device_id: 'MAX30102_001',
  device_status: 'Conectado',

  heart_rate_avg: 80,
  heart_rate_status: 'Normal',

  spo2_avg: 97,
  spo2_status: 'Óptimo',

  temperature_avg: 98.4,
  temperature_status: 'Sin fiebre',

  hadAlert: false, // si en las últimas lecturas hubo algo feo
  lastAlertText: 'Oxigenación baja detectada el 27 oct · SpO₂ 92%',
};

// Mock de “trend” tipo últimos promedios horarios
// Esto podría venir del backend para el sparkline
const heartTrend = [82, 81, 80, 79, 80, 82, 81];
const spo2Trend = [96, 97, 97, 98, 97, 96, 97];
const tempTrend = [98.6, 98.5, 98.4, 98.4, 98.5, 98.7, 98.4];

export default function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // recomendación ligera tipo “coach de salud”
  const recommendation = useMemo(() => {
    // lógica súper simple mock:
    if (latestSummary.hadAlert) {
      return 'Se detectaron valores fuera de rango recientemente. Mantente atento y consulta Historial.';
    }
    if (latestSummary.heart_rate_avg > 90) {
      return 'Tu ritmo cardíaco promedio está un poco elevado. Considera descansar y mantenerte hidratado.';
    }
    if (latestSummary.temperature_avg >= 100.4) {
      return 'Temperatura elevada. Vigila síntomas de fiebre.';
    }
    return 'Todo estable. Buen trabajo manteniendo tus signos vitales dentro de rango 👍';
  }, []);

  return (
    <ScreenWithMenuPush
      userName="Gerardo"
      deviceStatus={latestSummary.device_status}
      deviceId={latestSummary.device_id}
      avatarLabel="G"
      scroll
      contentContainerStyle={styles.content}
    >
      {/* --------- RESUMEN RÁPIDO ARRIBA --------- */}
      <View style={styles.statusCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.statusTitle}>Resumen de hoy</Text>
          <Text style={styles.statusSub}>
            Última sesión en vivo: {latestSummary.lastSessionAgo} atrás
          </Text>
          <Text style={styles.statusSubDim}>
            Dispositivo · {latestSummary.device_id}{' '}
            {latestSummary.device_status === 'Conectado'
              ? '· Conectado'
              : '· Sin señal'}
          </Text>

          {latestSummary.hadAlert ? (
            <Text style={styles.statusAlertDanger}>
              {latestSummary.lastAlertText}
            </Text>
          ) : (
            <Text style={styles.statusSafe}>Sin alertas críticas recientes</Text>
          )}
        </View>

        <View style={styles.badgeStable}>
          <Text style={styles.badgeStableText}>ESTABLE</Text>
        </View>
      </View>

      {/* --------- MÉTRICAS CLAVE DEL DÍA --------- */}
      <View style={styles.metricsRow}>
        <MetricSummary
          label="Ritmo cardíaco"
          value={`${latestSummary.heart_rate_avg} bpm`}
          status={latestSummary.heart_rate_status}
          color={colors.danger}
          trend={heartTrend}
          icon="❤️"
        />
        <MetricSummary
          label="SpO₂"
          value={`${latestSummary.spo2_avg}%`}
          status={latestSummary.spo2_status}
          color={colors.accent}
          trend={spo2Trend}
          icon="💨"
        />
      </View>

      <View style={styles.metricsRow}>
        <MetricSummary
          label="Temperatura"
          value={`${latestSummary.temperature_avg} °F`}
          status={latestSummary.temperature_status}
          color={colors.warning}
          trend={tempTrend}
          icon="🌡️"
          fullWidth
        />
      </View>

      {/* --------- RECOMENDACIÓN / BIENESTAR --------- */}
      <View style={styles.recoBlock}>
        <Text style={styles.recoTitle}>Recomendación</Text>
        <Text style={styles.recoText}>{recommendation}</Text>
        <Text style={styles.recoDisclaimer}>
          Nota: Esto es orientación general, no un diagnóstico médico.
        </Text>
      </View>

      {/* --------- ALERTAS RECIENTES (mini feed) --------- */}
      <View style={styles.alertsBlock}>
        <Text style={styles.alertsTitle}>Últimas alertas</Text>

        {latestSummary.hadAlert ? (
          <View style={[styles.alertItem, styles.alertItemDanger]}>
            <Text style={styles.alertItemTextDanger}>
              {latestSummary.lastAlertText}
            </Text>
            <Text style={styles.alertItemTime}>Hace 3h</Text>
          </View>
        ) : (
          <View style={[styles.alertItem, styles.alertItemOk]}>
            <Text style={styles.alertItemTextOk}>
              No se detectaron riesgos recientes
            </Text>
            <Text style={styles.alertItemTime}>Últimas 24h</Text>
          </View>
        )}
      </View>

      {/* DISCLAIMER FINAL */}
      <Text style={styles.footerDisclaimer}>
        Pulse Vital no reemplaza una evaluación médica profesional. En caso de
        emergencia, busca ayuda inmediata.
      </Text>
    </ScreenWithMenuPush>
  );
}

/* -------- components internos para Home -------- */

function MetricSummary({
  label,
  value,
  status,
  color,
  trend,
  icon,
  fullWidth,
}: {
  label: string;
  value: string;
  status: string;
  color: string;
  trend: number[];
  icon: string;
  fullWidth?: boolean;
}) {
  return (
    <View
      style={[
        styles.metricCard,
        fullWidth && styles.metricCardFull,
      ]}
    >
      {/* Header con icono y label */}
      <View style={styles.metricHeaderRow}>
        <Text style={[styles.metricIcon, { color }]}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.metricLabel}>{label}</Text>
          <Text style={[styles.metricValue, { color }]}>{value}</Text>
        </View>
      </View>

      {/* Sparkline dummy */}
      <Sparkline trend={trend} color={color} />

      {/* Estado / comentario */}
      <Text style={styles.metricStatusText}>{status}</Text>
    </View>
  );
}

// mini sparkline (placeholder visual). en el futuro se puede reemplazar con chart real.
function Sparkline({ trend, color }: { trend: number[]; color: string }) {
  // sólo mostramos valores último vs primero para que se sienta "cambió X%"
  const first = trend[0];
  const last = trend[trend.length - 1];
  const diff = Math.round((last - first) * 10) / 10;
  const diffLabel =
    diff === 0
      ? 'sin cambio'
      : diff > 0
      ? `+${diff}`
      : `${diff}`;

  return (
    <View style={styles.sparkWrapper}>
      <View style={styles.sparkLineBg}>
        {/* "línea" simulada */}
        <View
          style={[
            styles.sparkFakeLine,
            { borderColor: color, shadowColor: color },
          ]}
        />
      </View>

      <View style={styles.sparkInfoRow}>
        <Text style={styles.sparkInfoText}>
          {diff >= 0 ? 'Subió' : 'Bajó'} {diffLabel} últimamente
        </Text>
      </View>
    </View>
  );
}

/* -------- styles -------- */

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24, // ScreenWithMenuPush le agrega más con safe-area
  },

  /* ----- tarjeta resumen arriba ----- */
  statusCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  statusTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusSub: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '400',
  },
  statusSubDim: {
    color: colors.dim,
    fontSize: 12,
    marginTop: 4,
  },
  statusSafe: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 10,
  },
  statusAlertDanger: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 10,
  },
  badgeStable: {
    position: 'absolute',
    right: 16,
    top: 16,
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#00000055',
  },
  badgeStableText: {
    color: colors.blackOnAccent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  /* ----- métricas resumen ----- */
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 12,
    marginBottom: 16,
  },

  metricCard: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 150,

    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
  },
  metricCardFull: {
    flexBasis: '100%',
  },

  metricHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  metricIcon: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
  },

  // sparkline fake
  sparkWrapper: {
    marginBottom: 8,
  },
  sparkLineBg: {
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    height: 40,
    overflow: 'hidden',
    marginBottom: 6,
  },
  sparkFakeLine: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 8,
    bottom: 8,
    borderWidth: 2,
    borderRadius: 16,
    opacity: 0.8,
    transform: [{ skewX: '18deg' }],
  },
  sparkInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sparkInfoText: {
    color: colors.dim,
    fontSize: 12,
    fontWeight: '400',
  },

  metricStatusText: {
    color: colors.dim,
    fontSize: 12,
    fontWeight: '400',
  },

  /* ----- recomendación ----- */
  recoBlock: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  recoTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  recoText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 8,
  },
  recoDisclaimer: {
    color: colors.dim,
    fontSize: 12,
  },

  /* ----- acciones rápidas ----- */
  quickActionsBlock: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  qaTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  qaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 12,
  },
  qaButton: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 150,

    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  qaButtonPrimary: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  qaButtonSecondary: {
    backgroundColor: colors.sidebarBg,
    borderColor: colors.sidebarBorder,
  },
  qaButtonMainText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  qaButtonSubText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.dim,
    lineHeight: 16,
  },

  /* ----- alertas recientes ----- */
  alertsBlock: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  alertsTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },

  alertItem: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  alertItemDanger: {
    backgroundColor: '#4c1d1d',
    borderColor: colors.danger,
  },
  alertItemOk: {
    backgroundColor: '#1e2a25',
    borderColor: colors.accent,
  },
  alertItemTextDanger: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '500',
  },
  alertItemTextOk: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '500',
  },
  alertItemTime: {
    color: colors.dim,
    fontSize: 11,
    fontWeight: '400',
    marginTop: 4,
  },

  /* ----- footer disclaimer ----- */
  footerDisclaimer: {
    color: colors.dim,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
