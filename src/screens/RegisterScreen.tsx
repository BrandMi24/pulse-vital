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

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [edad, setEdad] = useState('');
  const [password, setPassword] = useState('');

  const handleCreateAccount = () => {
    // futuro: mandar datos al backend
    navigation.navigate('Login');
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

      <TouchableOpacity style={styles.mainButton} onPress={handleCreateAccount}>
        <Text style={styles.mainButtonText}>Crear cuenta</Text>
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
