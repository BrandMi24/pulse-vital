import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

type VitalCardProps = {
  label: string;
  value: string;
  status: string;
  icon: string;
  accentColor: string;
};

export default function VitalCard({
  label,
  value,
  status,
  icon,
  accentColor,
}: VitalCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={[styles.icon, { color: accentColor }]}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>

      <Text style={styles.value}>{value}</Text>
      <Text style={styles.status}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  icon: {
    fontSize: 20,
    fontWeight: '600',
  },
  label: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  status: {
    color: colors.dim,
    fontSize: 13,
    fontWeight: '400',
  },
});
