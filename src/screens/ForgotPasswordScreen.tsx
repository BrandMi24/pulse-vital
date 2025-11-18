// src/screens/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { getUser, saveUser } from '../storage/authStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const handleReset = async () => {
    if (!email.trim() || !newPass || !confirmPass) {
      Alert.alert('Campos incompletos', 'Llena todos los campos.');
      return;
    }

    if (newPass !== confirmPass) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    const stored = await getUser();
    if (!stored) {
      Alert.alert('Sin cuenta', 'No hay una cuenta guardada en este dispositivo.');
      return;
    }

    if (stored.email !== email.trim().toLowerCase()) {
      Alert.alert('Correo incorrecto', 'El correo no coincide con el registrado.');
      return;
    }

    await saveUser({
      ...stored,
      password: newPass,
    });

    Alert.alert('Listo', 'Tu contraseña fue actualizada.', [
      { text: 'Ir al login', onPress: () => navigation.navigate('Login') },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restablecer contraseña</Text>
      <Text style={styles.subtitle}>
        Ingresa el correo con el que te registraste y una nueva contraseña.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Correo"
        placeholderTextColor={colors.muted}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Nueva contraseña"
        placeholderTextColor={colors.muted}
        secureTextEntry
        value={newPass}
        onChangeText={setNewPass}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        placeholderTextColor={colors.muted}
        secureTextEntry
        value={confirmPass}
        onChangeText={setConfirmPass}
      />

      <TouchableOpacity style={styles.mainButton} onPress={handleReset}>
        <Text style={styles.mainButtonText}>Actualizar contraseña</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
  },
  mainButton: {
    backgroundColor: colors.accent,
    width: '100%',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  mainButtonText: {
    color: colors.blackOnAccent,
    fontSize: 16,
    fontWeight: '600',
  },
});
