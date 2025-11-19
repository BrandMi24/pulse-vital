import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import ScreenWithMenuPush from '../components/ScreenWithMenuPush';
import { colors } from '../theme/colors';
import { fetchLatestReadings, DEVICE_ID, SensorReading } from '../data/sensorService';

import { getUser, saveUser, clearUser, StoredUser } from '../storage/authStorage';
import {
  getEmergencyContact,
  saveEmergencyContact,
  clearEmergencyContact,
  EmergencyContact,
} from '../storage/emergencyStorage';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
    const { logout } = useAuth();

  // --------- usuario ----------
  const [user, setUser] = useState<StoredUser | null>(null);
  const [editingUser, setEditingUser] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [ageInput, setAgeInput] = useState('');

  // --------- contacto de emergencia ----------
  const [emergency, setEmergency] = useState<EmergencyContact | null>(null);
  const [editingEmergency, setEditingEmergency] = useState(false);
  const [emName, setEmName] = useState('');
  const [emRel, setEmRel] = useState('');
  const [emPhone, setEmPhone] = useState('');

  // --------- dispositivo ----------
  const [deviceInfo, setDeviceInfo] = useState<{
    id: string;
    status: string;
    lastSync: string;
    battery: string;
  }>({
    id: DEVICE_ID,
    status: 'Cargando...',
    lastSync: 'Sin datos',
    battery: '—',
  });

  // Cargar user + emergency + device
  useEffect(() => {
    let isMounted = true;

    const loadAll = async () => {
      const storedUser = await getUser();
      if (isMounted && storedUser) {
        setUser(storedUser);
        setNameInput(storedUser.name);
        setAgeInput(storedUser.age ? String(storedUser.age) : '');
      }

      const storedEmergency = await getEmergencyContact();
      if (isMounted && storedEmergency) {
        setEmergency(storedEmergency);
        setEmName(storedEmergency.name);
        setEmRel(storedEmergency.relationship);
        setEmPhone(storedEmergency.phone);
      }

      try {
        const data: SensorReading[] = await fetchLatestReadings(1);

        if (!isMounted) return;

        if (data.length > 0) {
          const latest = data[0];
          const now = new Date();
          const last = new Date(latest.timestamp);
          const diffMins = (now.getTime() - last.getTime()) / 60000;
          const status = diffMins < 5 ? 'Conectado' : 'Sin señal';
          const formattedLastSync = last.toLocaleString();

          setDeviceInfo({
            id: latest.device_id,
            status,
            lastSync: formattedLastSync,
            battery: '—',
          });
        } else {
          setDeviceInfo(prev => ({
            ...prev,
            status: 'Sin señal',
            lastSync: 'Sin datos',
          }));
        }
      } catch (e) {
        if (isMounted) {
          setDeviceInfo(prev => ({
            ...prev,
            status: 'Sin señal',
            lastSync: 'Error de conexión',
          }));
        }
      }
    };

    loadAll();

    return () => {
      isMounted = false;
    };
  }, []);

  // ----- handlers usuario -----
  const startEditUser = () => {
    if (!user) return;
    setNameInput(user.name);
    setAgeInput(user.age ? String(user.age) : '');
    setEditingUser(true);
  };

  const saveUserChanges = async () => {
    if (!user) return;
    const name = nameInput.trim() || user.name;
    const ageNumber = ageInput.trim() ? Number(ageInput.trim()) : undefined;

    const updated: StoredUser = {
      ...user,
      name,
      age: isNaN(ageNumber as number) ? user.age : ageNumber,
    };

    await saveUser(updated);
    setUser(updated);
    setEditingUser(false);
  };

  // ----- handlers contacto emergencia -----
  const startEditEmergency = () => {
    if (emergency) {
      setEmName(emergency.name);
      setEmRel(emergency.relationship);
      setEmPhone(emergency.phone);
    } else {
      setEmName('');
      setEmRel('');
      setEmPhone('');
    }
    setEditingEmergency(true);
  };

  const saveEmergencyChanges = async () => {
    if (!emName.trim() || !emPhone.trim()) {
      // aquí podrías meter un alert si quieres validar
      return;
    }

    const updated: EmergencyContact = {
      name: emName.trim(),
      relationship: emRel.trim() || 'Contacto',
      phone: emPhone.trim(),
    };

    await saveEmergencyContact(updated);
    setEmergency(updated);
    setEditingEmergency(false);
  };

  // ----- logout -----
  const handleLogout = async () => {
    await clearUser();
    await clearEmergencyContact();
    logout();
  };

  // nombre/avatar para el header
  const displayName = user?.name ?? 'Usuario';
  const avatarLabel = displayName.charAt(0).toUpperCase();

  return (
    <ScreenWithMenuPush
      userName={displayName}
      deviceStatus={deviceInfo.status}
      deviceId={deviceInfo.id}
      avatarLabel={avatarLabel}
      scroll
      contentContainerStyle={styles.content}
    >
      {/* ENCABEZADO LOCAL */}
      <View style={styles.headerBlock}>
        <Text style={styles.headerTitle}>Perfil y configuración</Text>
        <Text style={styles.headerSub}>
          Controla tu información personal y tu dispositivo
        </Text>
      </View>

      {/* -------- DATOS PERSONALES -------- */}
      <View style={styles.cardBlock}>
        <Text style={styles.sectionLabel}>Tu información</Text>

        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Nombre completo</Text>
            <Text style={styles.fieldValue}>{displayName}</Text>
          </View>
          <AvatarBubble label={avatarLabel} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Edad</Text>
          <Text style={styles.fieldValue}>
            {user?.age ? `${user.age} años` : '—'}
          </Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Correo</Text>
          <Text style={styles.fieldValue}>{user?.email ?? '—'}</Text>
        </View>

        {editingUser && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.fieldLabel}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Nombre"
              placeholderTextColor={colors.muted}
            />

            <Text style={styles.fieldLabel}>Edad</Text>
            <TextInput
              style={styles.input}
              value={ageInput}
              onChangeText={setAgeInput}
              placeholder="Edad"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
            />

            <View style={styles.rowButtons}>
              <TouchableOpacity
                style={[styles.smallBtn, { backgroundColor: colors.background }]}
                onPress={() => setEditingUser(false)}
              >
                <Text style={styles.smallBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.smallBtn, { backgroundColor: colors.accent }]}
                onPress={saveUserChanges}
              >
                <Text style={[styles.smallBtnText, { color: colors.blackOnAccent }]}>
                  Guardar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!editingUser && (
          <TouchableOpacity style={styles.editButton} onPress={startEditUser}>
            <Text style={styles.editButtonText}>Editar información personal</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* -------- CONTACTO DE EMERGENCIA -------- */}
      <View style={styles.cardBlock}>
        <Text style={styles.sectionLabel}>Contacto de emergencia</Text>

        {emergency && !editingEmergency && (
          <>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nombre</Text>
              <Text style={styles.fieldValue}>{emergency.name}</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Relación</Text>
              <Text style={styles.fieldValue}>{emergency.relationship}</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Teléfono</Text>
              <Text style={styles.fieldValue}>{emergency.phone}</Text>
            </View>
          </>
        )}

        {!emergency && !editingEmergency && (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldValue}>
              No has añadido un contacto de emergencia.
            </Text>
          </View>
        )}

        {editingEmergency && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.fieldLabel}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={emName}
              onChangeText={setEmName}
              placeholder="Nombre"
              placeholderTextColor={colors.muted}
            />

            <Text style={styles.fieldLabel}>Relación</Text>
            <TextInput
              style={styles.input}
              value={emRel}
              onChangeText={setEmRel}
              placeholder="Relación (madre, padre, etc.)"
              placeholderTextColor={colors.muted}
            />

            <Text style={styles.fieldLabel}>Teléfono</Text>
            <TextInput
              style={styles.input}
              value={emPhone}
              onChangeText={setEmPhone}
              placeholder="Teléfono"
              keyboardType="phone-pad"
              placeholderTextColor={colors.muted}
            />

            <View style={styles.rowButtons}>
              <TouchableOpacity
                style={[styles.smallBtn, { backgroundColor: colors.background }]}
                onPress={() => setEditingEmergency(false)}
              >
                <Text style={styles.smallBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.smallBtn, { backgroundColor: colors.accent }]}
                onPress={saveEmergencyChanges}
              >
                <Text style={[styles.smallBtnText, { color: colors.blackOnAccent }]}>
                  Guardar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!editingEmergency && (
          <TouchableOpacity style={styles.editButton} onPress={startEditEmergency}>
            <Text style={styles.editButtonText}>
              {emergency ? 'Actualizar contacto' : 'Añadir contacto de emergencia'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* -------- DISPOSITIVO -------- */}
      <View style={styles.cardBlock}>
        <Text style={styles.sectionLabel}>Dispositivo vinculado</Text>

        <View style={styles.fieldGroupRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>ID del sensor</Text>
            <Text style={styles.fieldValue}>{deviceInfo.id}</Text>
          </View>

          <StatusPill
            label={deviceInfo.status === 'Conectado' ? 'Conectado' : 'Sin señal'}
            type={deviceInfo.status === 'Conectado' ? 'ok' : 'danger'}
          />
        </View>

        <View style={styles.fieldGroupRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Última sincronización</Text>
            <Text style={styles.fieldValue}>{deviceInfo.lastSync}</Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.fieldLabel}>Batería</Text>
            <Text style={styles.fieldValue}>{deviceInfo.battery}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('PairDevice')}
        >
          <Text style={styles.editButtonText}>Vincular / cambiar dispositivo</Text>
        </TouchableOpacity>
      </View>

      {/* -------- CUENTA / SESIÓN -------- */}
      <View style={styles.cardBlock}>
        <Text style={styles.sectionLabel}>Cuenta y sesión</Text>

        <TouchableOpacity
          style={[styles.logoutRow, styles.logoutDanger]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutTextDanger}>Cerrar sesión</Text>
          <Text style={styles.logoutSubText}>
            Salir de tu cuenta en este dispositivo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutRow}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <Text style={styles.logoutText}>Cambiar contraseña</Text>
          <Text style={styles.logoutSubText}>
            Recomendado si notas actividad extraña
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerNote}>
        Tus datos se usan para generar alertas de salud y no reemplazan una
        valoración médica profesional.
      </Text>
    </ScreenWithMenuPush>
  );
}

/* ------------------ subcomponents ------------------ */

function AvatarBubble({ label }: { label: string }) {
  return (
    <View style={styles.avatarBubble}>
      <Text style={styles.avatarText}>{label}</Text>
    </View>
  );
}

function StatusPill({
  label,
  type,
}: {
  label: string;
  type: 'ok' | 'danger';
}) {
  return (
    <View
      style={[
        styles.statusPill,
        type === 'ok' ? styles.statusPillOk : styles.statusPillDanger,
      ]}
    >
      <Text
        style={[
          styles.statusPillText,
          type === 'ok' ? styles.statusPillTextOk : styles.statusPillTextDanger,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

/* ------------------ estilos ------------------ */

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  headerBlock: {
    marginBottom: 20,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
  },
  headerSub: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  cardBlock: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  sectionLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldGroupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 16,
  },
  fieldLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  fieldValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
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
    marginBottom: 10,
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  smallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  smallBtnText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: colors.sidebarBg,
    borderWidth: 1,
    borderColor: colors.sidebarBorder,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  editButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  avatarBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: '#00000066',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  avatarText: {
    color: colors.blackOnAccent,
    fontSize: 18,
    fontWeight: '700',
  },
  statusPill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusPillOk: {
    backgroundColor: '#1e2a25',
    borderColor: colors.accent,
  },
  statusPillDanger: {
    backgroundColor: '#4c1d1d',
    borderColor: colors.danger,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusPillTextOk: {
    color: colors.accent,
  },
  statusPillTextDanger: {
    color: colors.danger,
  },
  logoutRow: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  logoutDanger: {
    backgroundColor: '#4c1d1d33',
    borderColor: colors.danger,
  },
  logoutTextDanger: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  logoutText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  logoutSubText: {
    color: colors.dim,
    fontSize: 12,
    marginTop: 4,
  },
  footerNote: {
    color: colors.dim,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
