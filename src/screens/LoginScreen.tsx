import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { getUser } from '../storage/authStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'> & {
  onLogin: () => void;
};

export default function LoginScreen({ navigation, onLogin }: Props) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMsg(null);

    if (!correo.trim() || !password.trim()) {
      setErrorMsg('Ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const stored = await getUser();

      if (!stored) {
        setErrorMsg('No hay ninguna cuenta registrada en este dispositivo.');
        return;
      }

      const emailNormalized = correo.trim().toLowerCase();

      if (
        stored.email !== emailNormalized ||
        stored.password !== password
      ) {
        setErrorMsg('Correo o contraseña incorrectos.');
        return;
      }

      // ✅ credenciales correctas → marcamos como logueado
      onLogin();
    } catch (e) {
      console.log(e);
      Alert.alert(
        'Error',
        'Ocurrió un problema al validar tus datos. Intenta de nuevo.',
      );
    } finally {
      setLoading(false);
    }
  };

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

      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

      <TouchableOpacity
        style={[
          styles.mainButton,
          loading && { opacity: 0.7 },
        ]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.mainButtonText}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.linkText}>Crear cuenta nueva</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.footerText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <Text style={styles.versionInfo}>Versión 1.0.0 · Demo local</Text>
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
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 8,
    alignSelf: 'flex-start',
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
