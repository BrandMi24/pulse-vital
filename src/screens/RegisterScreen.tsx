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
import { saveUser } from '../storage/authStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [edad, setEdad] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async () => {
    // validaciones muy básicas
    if (!nombre.trim() || !correo.trim() || !edad.trim() || !password.trim()) {
      Alert.alert('Campos incompletos', 'Llena todos los campos.');
      return;
    }

    const ageNum = Number(edad);
    if (isNaN(ageNum) || ageNum <= 0) {
      Alert.alert('Edad inválida', 'Ingresa una edad válida.');
      return;
    }

    setLoading(true);
    try {
      await saveUser({
        name: nombre.trim(),
        email: correo.trim().toLowerCase(),
        age: ageNum,
        password,
      });

      Alert.alert(
        'Cuenta creada',
        'Tu cuenta se guardó en el dispositivo. Ahora inicia sesión.',
        [
          {
            text: 'Ir al login',
            onPress: () => navigation.navigate('Login'),
          },
        ],
      );
    } catch (e) {
      console.log(e);
      Alert.alert(
        'Error',
        'Ocurrió un problema al guardar tu cuenta. Intenta de nuevo.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear cuenta</Text>
      <Text style={styles.subtitle}>Tu información básica</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        placeholderTextColor={colors.muted}
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={styles.input}
        placeholder="Correo"
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        value={correo}
        onChangeText={setCorreo}
      />

      <TextInput
        style={styles.input}
        placeholder="Edad"
        placeholderTextColor={colors.muted}
        keyboardType="numeric"
        value={edad}
        onChangeText={setEdad}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor={colors.muted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[
          styles.mainButton,
          loading && { opacity: 0.7 },
        ]}
        onPress={handleCreateAccount}
        disabled={loading}
      >
        <Text style={styles.mainButtonText}>
          {loading ? 'Guardando...' : 'Crear cuenta'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.linkText}>Ya tengo cuenta, iniciar sesión</Text>
      </TouchableOpacity>

      <Text style={styles.terms}>
        Al crear tu cuenta aceptas los términos y condiciones.
      </Text>
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
    fontSize: 28,
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
  linkButton: {
    marginTop: 16,
  },
  linkText: {
    color: colors.link,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  terms: {
    color: colors.dim,
    fontSize: 12,
    marginTop: 24,
    textAlign: 'center',
    maxWidth: 260,
  },
});
