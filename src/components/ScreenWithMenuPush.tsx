import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  ViewStyle,
  ScrollViewProps,
} from 'react-native';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// servicio del sensor
import { fetchLatestReadings, DEVICE_ID, SensorReading } from '../data/sensorService';

// contexto del slide
import { useSlideMenu } from '../navigation/SlideMenuContext';

// 👇 storage local del usuario
import { clearUser, getUser } from '../storage/authStorage';
import {
  clearEmergencyContact,
  getEmergencyContact,
  type EmergencyContact,
} from '../storage/emergencyStorage';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(width * 0.7, 260);

type ScreenWithMenuPushProps = {
  children: React.ReactNode;
  userName?: string;       // opcional, se puede override
  deviceStatus?: string;   // override opcional
  deviceId?: string;       // override opcional
  avatarLabel?: string;    // opcional
  scroll?: boolean;
  contentContainerStyle?: ViewStyle;
  scrollProps?: ScrollViewProps;
};

export default function ScreenWithMenuPush({
  children,
  userName = 'Usuario',
  deviceStatus,
  deviceId,
  avatarLabel = 'U',
  scroll = true,
  contentContainerStyle,
  scrollProps,
}: ScreenWithMenuPushProps) {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { translateX, isOpen, open, close, toggle } = useSlideMenu();

  const { logout } = useAuth();

  // 👉 nombre y avatar que realmente se muestran
  const [displayName, setDisplayName] = useState(userName);
  const [displayAvatar, setDisplayAvatar] = useState(avatarLabel);

  // Estado local que se llena con la API del sensor
  const [deviceInfo, setDeviceInfo] = useState<{
    status: string;
    id: string;
  }>({
    status: 'Cargando...',
    id: DEVICE_ID,
  });

  // 👇 estado para contacto de emergencia
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact | null>(null);
  const [loadingEmergency, setLoadingEmergency] = useState(true);

  // Cargar info del usuario guardado
  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const stored = await getUser(); // { name, email, age, password }
        if (!mounted || !stored) return;

        if (stored.name && stored.name.trim().length > 0) {
          const name = stored.name.trim();
          setDisplayName(name);

          const firstLetter = name.charAt(0).toUpperCase();
          setDisplayAvatar(firstLetter);
        }
      } catch (e) {
        console.log('Error cargando usuario', e);
      }
    };

    loadUser();
    return () => {
      mounted = false;
    };
  }, []);

  // Llamada a la API del sensor
  useEffect(() => {
    let isMounted = true;

    const loadStatus = async () => {
      try {
        const data: SensorReading[] = await fetchLatestReadings(1);

        if (!isMounted) return;

        if (data.length > 0) {
          const latest = data[0];
          const now = new Date();
          const last = new Date(latest.timestamp);
          const diffMins = (now.getTime() - last.getTime()) / 60000;

          const status = diffMins < 5 ? 'Conectado' : 'Sin señal';

          setDeviceInfo({
            status,
            id: latest.device_id,
          });
        } else {
          setDeviceInfo({
            status: 'Sin señal',
            id: DEVICE_ID,
          });
        }
      } catch (e) {
        if (isMounted) {
          setDeviceInfo({
            status: 'Sin señal',
            id: DEVICE_ID,
          });
        }
      }
    };

    loadStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  // Cargar contacto de emergencia desde AsyncStorage
  useEffect(() => {
    let mounted = true;

    const loadEmergency = async () => {
      try {
        const saved = await getEmergencyContact();
        if (!mounted) return;
        setEmergencyContact(saved);
      } catch (e) {
        console.log('Error cargando contacto de emergencia', e);
      } finally {
        if (mounted) setLoadingEmergency(false);
      }
    };

    loadEmergency();

    return () => {
      mounted = false;
    };
  }, []);

  // Lo que mande la pantalla pisa lo que viene de la API
  const effectiveStatus = deviceStatus ?? deviceInfo.status;
  const effectiveId = deviceId ?? deviceInfo.id;
  const deviceIsConnected = effectiveStatus === 'Conectado';

  // helpers para navegar desde el menú
  function goProfile() {
    close();
    setTimeout(() => {
      navigation.navigate('MainTabs', {
        screen: 'HomeTab',
        params: { screen: 'Profile' },
      });
    }, 220);
  }

  function goHistory() {
    close();
    setTimeout(() => {
      navigation.navigate('MainTabs', {
        screen: 'HistoryTab',
      });
    }, 220);
  }

  function goAlerts() {
    close();
    setTimeout(() => {
      navigation.navigate('MainTabs', {
        screen: 'MonitorTab',
      });
    }, 220);
  }

  const handleLogout = async () => {
    await clearUser();
    await clearEmergencyContact();
    logout();
  };

  // 👇 lógica de contacto de emergencia
  const hasEmergency = !!emergencyContact;

  const emergencyLabel = loadingEmergency
    ? 'Cargando...'
    : hasEmergency
    ? `${emergencyContact!.name} · ${emergencyContact!.relationship}`
    : 'No hay contacto de emergencia aún';

  const handleEmergencyPress = () => {
    // Solo navegamos al perfil si aún NO hay contacto y ya terminó de cargar
    if (!hasEmergency && !loadingEmergency) {
      goProfile();
    }
  };

  return (
    <View style={styles.root}>
      {/* SIDEBAR */}
      <View style={[styles.sidebar, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.sidebarTitle}>Menú</Text>

        {/* CUENTA */}
        <View style={styles.sidebarSection}>
          <Text style={styles.sidebarSectionTitle}>Cuenta</Text>

          <TouchableOpacity style={styles.sidebarRow} onPress={goProfile}>
            <Text style={styles.sidebarRowText}>Perfil / Datos personales</Text>
            <Text style={styles.sidebarSubText}>
              Ver y editar tu información
            </Text>
          </TouchableOpacity>

          {/* Contacto de emergencia */}
          <TouchableOpacity
            style={[
              styles.sidebarRow,
              (hasEmergency || loadingEmergency) && styles.sidebarRowDisabled,
            ]}
            onPress={handleEmergencyPress}
            disabled={hasEmergency || loadingEmergency}
          >
            <Text style={styles.sidebarRowText}>Contacto de emergencia</Text>
            <Text style={styles.sidebarSubText}>
              {emergencyLabel}
            </Text>
          </TouchableOpacity>
        </View>

        {/* MONITOREO */}
        <View style={styles.sidebarSection}>
          <Text style={styles.sidebarSectionTitle}>Monitoreo</Text>

          {/* Dispositivo vinculado - estático */}
          <TouchableOpacity
            style={[styles.sidebarRow, styles.sidebarRowDisabled]}
            disabled
          >
            <Text style={styles.sidebarRowText}>Dispositivo vinculado</Text>
            <Text style={styles.sidebarSubText}>
              {effectiveStatus} · {effectiveId}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarRow} onPress={goHistory}>
            <Text style={styles.sidebarRowText}>Historial completo</Text>
            <Text style={styles.sidebarSubText}>
              Consultar registros guardados
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarRow} onPress={goAlerts}>
            <Text style={styles.sidebarRowText}>
              Alertas y recomendaciones
            </Text>
            <Text style={styles.sidebarSubText}>
              Notificaciones de riesgo
            </Text>
          </TouchableOpacity>
        </View>

        {/* SESIÓN */}
        <View style={styles.sidebarSection}>
          <Text style={styles.sidebarSectionTitle}>Sesión</Text>

          <TouchableOpacity
            style={styles.sidebarRow}
            onPress={handleLogout}
          >
            <Text style={[styles.sidebarRowText, { color: colors.danger }]}>
              Cerrar sesión
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sidebarFooter}>Pulse Vital v1.0.0</Text>
      </View>

      {/* FOREGROUND */}
      <Animated.View
        style={[
          styles.foregroundWrapper,
          {
            transform: [{ translateX }],
            shadowOpacity: isOpen ? 0.6 : 0,
            elevation: isOpen ? 20 : 0,
          },
        ]}
      >
        <Pressable style={{ flex: 1 }} disabled={!isOpen} onPress={close}>
          <View style={styles.foregroundInner}>
            {/* HEADER SUPERIOR */}
            <View
              style={[
                styles.headerRow,
                {
                  paddingTop: insets.top + 12,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.helloText}>Hola, {displayName} 👋</Text>

                <Text style={styles.deviceText}>
                  Dispositivo:{' '}
                  <Text
                    style={deviceIsConnected ? styles.deviceOk : styles.deviceBad}
                  >
                    {effectiveStatus}
                  </Text>
                </Text>

                <Text style={styles.deviceSubText}>ID {effectiveId}</Text>
              </View>

              {/* avatar con primera letra */}
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{displayAvatar}</Text>
              </View>

              {/* Botón hamburguesa */}
              <TouchableOpacity style={styles.menuButton} onPress={toggle}>
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
              </TouchableOpacity>
            </View>

            {/* CONTENIDO */}
            {scroll ? (
              <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={[
                  styles.scrollContent,
                  contentContainerStyle,
                  {
                    paddingBottom:
                      ((contentContainerStyle as any)?.paddingBottom ?? 100) +
                      insets.bottom +
                      80,
                  },
                ]}
                {...scrollProps}
              >
                {children}
              </ScrollView>
            ) : (
              <View
                style={[
                  styles.staticArea,
                  contentContainerStyle,
                  {
                    paddingBottom:
                      ((contentContainerStyle as any)?.paddingBottom ?? 100) +
                      insets.bottom +
                      80,
                  },
                ]}
              >
                {children}
              </View>
            )}
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: colors.sidebarBg,
    borderRightWidth: 1,
    borderRightColor: colors.sidebarBorder,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sidebarTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 24,
  },
  sidebarSection: {
    marginBottom: 24,
  },
  sidebarSectionTitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sidebarRow: {
    marginBottom: 16,
  },
  sidebarRowDisabled: {
    opacity: 0.6,
  },
  sidebarRowText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  sidebarSubText: {
    color: colors.dim,
    fontSize: 13,
    fontWeight: '400',
  },
  sidebarFooter: {
    color: colors.dim,
    fontSize: 12,
    marginTop: 'auto',
    textAlign: 'center',
  },
  foregroundWrapper: {
    flex: 1,
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 4 },
    shadowRadius: 12,
    borderLeftWidth: 0,
  },
  foregroundInner: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  helloText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  deviceText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '400',
  },
  deviceOk: {
    color: colors.accent,
    fontWeight: '600',
  },
  deviceBad: {
    color: colors.danger,
    fontWeight: '600',
  },
  deviceSubText: {
    color: colors.dim,
    fontSize: 12,
    marginTop: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  avatarText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  menuButton: {
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLine: {
    width: 22,
    height: 2,
    backgroundColor: colors.text,
    borderRadius: 2,
    marginVertical: 2,
  },
  scrollArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  staticArea: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
});

export {};
