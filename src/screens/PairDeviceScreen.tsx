import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { DEVICE_ID, setDeviceId } from '../data/sensorService';

type Props = NativeStackScreenProps<RootStackParamList, 'PairDevice'>;

const MOCK_DEVICES = [
  'MAX30102_001',
  'MAX30102_002',
  'PULSEVITAL_DEV_A',
  'PULSEVITAL_DEV_B',
];

export default function PairDeviceScreen({ navigation }: Props) {
  // Arrancamos con el DEVICE_ID actual como selección inicial
  const [selectedId, setSelectedId] = useState<string>(DEVICE_ID);
  const [customId, setCustomId] = useState<string>('');

  const handleConfirm = () => {
    const finalId = customId.trim() || selectedId;

    if (!finalId) {
      // Aquí podrías meter un Alert si quieres avisar al usuario
      return;
    }

    // 🔹 Actualizar el deviceId global del servicio
    setDeviceId(finalId);

    console.log('Dispositivo vinculado:', finalId);

    // Volver a la pantalla anterior (Onboarding o Perfil)
    navigation.replace('OnboardingStep2');
  };

  return (
    <View style={styles.container}>
      {/* HEADER SIMPLE */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vincular dispositivo</Text>
        <Text style={styles.headerSub}>
          Selecciona tu sensor Pulse Vital o ingresa el ID manualmente.
        </Text>
      </View>

      {/* LISTA DE DISPOSITIVOS MOCK */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Dispositivos cercanos</Text>

        {MOCK_DEVICES.map((id) => {
          const isActive = id === selectedId;
          return (
            <TouchableOpacity
              key={id}
              style={[
                styles.deviceRow,
                isActive && styles.deviceRowActive,
              ]}
              onPress={() => setSelectedId(id)}
            >
              <View>
                <Text
                  style={[
                    styles.deviceId,
                    isActive && styles.deviceIdActive,
                  ]}
                >
                  {id}
                </Text>
                <Text style={styles.deviceSub}>Sensor óptico de pulso</Text>
              </View>

              <View
                style={[
                  styles.radioOuter,
                  isActive && styles.radioOuterActive,
                ]}
              >
                {isActive && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* INPUT MANUAL */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Ingresar ID manualmente</Text>
        <Text style={styles.helperText}>
          Si tu dispositivo no aparece en la lista, escribe el identificador que
          viene en la etiqueta.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Ej. MAX30102_001"
          placeholderTextColor={colors.muted}
          value={customId}
          onChangeText={setCustomId}
          autoCapitalize="characters"
        />
      </View>

      {/* BOTONES FINALES */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonSecondaryText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={handleConfirm}
        >
          <Text style={styles.buttonPrimaryText}>Vincular dispositivo</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerNote}>
        Esta pantalla es un prototipo. En una versión completa se usaría
        Bluetooth o Wi-Fi para detectar dispositivos reales.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSub: {
    color: colors.muted,
    fontSize: 14,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 18,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  deviceRowActive: {
    borderColor: colors.accent,
    backgroundColor: '#1e2a25',
  },
  deviceId: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  deviceIdActive: {
    color: colors.accent,
  },
  deviceSub: {
    color: colors.dim,
    fontSize: 12,
    marginTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: colors.accent,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  helperText: {
    color: colors.dim,
    fontSize: 12,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 14,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonSecondary: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  buttonSecondaryText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonPrimary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  buttonPrimaryText: {
    color: colors.blackOnAccent,
    fontSize: 14,
    fontWeight: '600',
  },
  footerNote: {
    color: colors.dim,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 16,
  },
});
