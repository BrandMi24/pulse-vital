import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'> & {
  onLogin: () => void;
};

export default function LoginScreen({ navigation, onLogin }: Props) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pulse Vital</Text>
      <Text style={styles.subtitle}>Monitoreo inteligente de salud</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo"
        placeholderTextColor={colors.muted}
        value={correo}
        onChangeText={setCorreo}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor={colors.muted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.mainButton} onPress={onLogin}>
        <Text style={styles.mainButtonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.linkText}>Crear cuenta nueva</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>¿Olvidaste tu contraseña?</Text>

      <Text style={styles.versionInfo}>Versión 1.0.0 · Demo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginBottom: 32,
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
  linkButton: {
    marginTop: 16,
  },
  linkText: {
    color: colors.link,
    fontSize: 14,
    fontWeight: '500',
  },
  footerText: {
    color: colors.dim,
    fontSize: 13,
    marginTop: 16,
  },
  versionInfo: {
    position: 'absolute',
    bottom: 30,
    color: colors.dim,
    fontSize: 12,
  },
});
