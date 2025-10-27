import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingStep2'>;

export default function OnboardingStep2Screen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.centerBlock}>
        <Text style={styles.title}>
          Tu historial de salud siempre contigo
        </Text>

        <Text style={styles.desc}>
          Guardamos cada lectura para que veas tendencias diarias, semanales y mensuales. Consulta cómo estabas en cualquier momento.
        </Text>

        <View style={styles.illusBox}>
          <Text style={styles.illusEmoji}>📊🩺</Text>
        </View>
      </View>

      <View style={styles.buttonsBlock}>
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => navigation.navigate('OnboardingStep3')}
        >
          <Text style={styles.mainButtonText}>Siguiente</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dotsRow}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
      </View>

      <TouchableOpacity
        style={styles.skipAllButton}
        onPress={() => navigation.navigate('OnboardingStep3')}
      >
        <Text style={styles.skipAllText}>Omitir introducción</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },

  centerBlock: {
    alignItems: 'center',
  },

  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 30,
  },

  desc: {
    color: colors.muted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
    marginBottom: 32,
  },

  illusBox: {
    width: 140,
    height: 140,
    borderRadius: 28,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  illusEmoji: {
    fontSize: 40,
    color: colors.text,
  },

  buttonsBlock: {
    alignItems: 'center',
    width: '100%',
  },

  mainButton: {
    backgroundColor: colors.accent,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  mainButtonText: {
    color: colors.blackOnAccent,
    fontSize: 16,
    fontWeight: '600',
  },

  secondaryButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: colors.link,
    fontSize: 14,
    fontWeight: '500',
  },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.accent,
  },

  skipAllButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  skipAllText: {
    color: colors.dim,
    fontSize: 12,
  },
});
