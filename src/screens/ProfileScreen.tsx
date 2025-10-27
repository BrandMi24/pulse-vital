import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ScreenWithMenuPush from '../components/ScreenWithMenuPush';
import { colors } from '../theme/colors';

export default function ProfileScreen() {
  // Datos mock del perfil del usuario (después los vas a traer del backend / storage)
  const user = {
    name: 'Gerardo',
    age: 27,
    email: 'gerardo@example.com',
    avatarLabel: 'G',
  };

  // Contacto de emergencia mock
  const emergency = {
    name: 'María López',
    relationship: 'Hermana',
    phone: '+52 000 000 0000',
  };

  // Dispositivo mock
  const deviceInfo = {
    id: 'MAX30102_001',
    status: 'Conectado',
    lastSync: '2025-10-16 10:21 AM',
    battery: '78%',
  };

  return (
    <ScreenWithMenuPush
      userName={user.name}
      deviceStatus={deviceInfo.status}
      deviceId={deviceInfo.id}
      avatarLabel={user.avatarLabel}
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

      {/* BLOQUE: DATOS PERSONALES */}
      <View style={styles.cardBlock}>
        <Text style={styles.sectionLabel}>Tu información</Text>

        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Nombre completo</Text>
            <Text style={styles.fieldValue}>{user.name}</Text>
          </View>
          <AvatarBubble label={user.avatarLabel} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Edad</Text>
          <Text style={styles.fieldValue}>{user.age} años</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Correo</Text>
          <Text style={styles.fieldValue}>{user.email}</Text>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            console.log('Editar datos personales');
            // más adelante: navegación a EditProfile
          }}
        >
          <Text style={styles.editButtonText}>Editar información personal</Text>
        </TouchableOpacity>
      </View>

      {/* BLOQUE: CONTACTO DE EMERGENCIA */}
      <View style={styles.cardBlock}>
        <Text style={styles.sectionLabel}>Contacto de emergencia</Text>

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

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            console.log('Editar contacto de emergencia');
            // más adelante: pantalla ContactEmergencyScreen
          }}
        >
          <Text style={styles.editButtonText}>Actualizar contacto</Text>
        </TouchableOpacity>
      </View>

      {/* BLOQUE: DISPOSITIVO */}
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
          onPress={() => {
            console.log('Cambiar / Vincular dispositivo');
            // más adelante: pantalla de pairing BLE
          }}
        >
          <Text style={styles.editButtonText}>Vincular / cambiar dispositivo</Text>
        </TouchableOpacity>
      </View>

      {/* BLOQUE: SEGURIDAD / SESIÓN */}
      <View style={styles.cardBlock}>
        <Text style={styles.sectionLabel}>Cuenta y sesión</Text>

        <TouchableOpacity
          style={[styles.logoutRow, styles.logoutDanger]}
          onPress={() => {
            console.log('Cerrar sesión');
            // cuando tengas auth real:
            // reset nav stack al Login
          }}
        >
          <Text style={styles.logoutTextDanger}>Cerrar sesión</Text>
          <Text style={styles.logoutSubText}>
            Salir de tu cuenta en este dispositivo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutRow}
          onPress={() => {
            console.log('Cambiar contraseña');
          }}
        >
          <Text style={styles.logoutText}>Cambiar contraseña</Text>
          <Text style={styles.logoutSubText}>
            Recomendado si notas actividad extraña
          </Text>
        </TouchableOpacity>
      </View>

      {/* DISCLAIMER */}
      <Text style={styles.footerNote}>
        Tus datos se usan para generar alertas de salud y no reemplazan una
        valoración médica profesional.
      </Text>
    </ScreenWithMenuPush>
  );
}

/* ------------------ subcomponents internos ------------------ */

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
    paddingBottom: 24, // ScreenWithMenuPush añade más padding con safe-area
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

  /* tarjeta base reutilizable */
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

  editButton: {
    backgroundColor: colors.sidebarBg,
    borderWidth: 1,
    borderColor: colors.sidebarBorder,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },

  /* avatar */
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

  /* status pill de dispositivo */
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

  /* bloque de sesión / seguridad */
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
