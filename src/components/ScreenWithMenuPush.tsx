import React, { useRef, useState } from 'react';
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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(width * 0.7, 260);

type ScreenWithMenuPushProps = {
  children: React.ReactNode;
  userName?: string;
  deviceStatus?: string;
  deviceId?: string;
  avatarLabel?: string;
  scroll?: boolean;
  contentContainerStyle?: ViewStyle;
  scrollProps?: ScrollViewProps;
};

export default function ScreenWithMenuPush({
  children,
  userName = 'Gerardo',
  deviceStatus = 'Conectado',
  deviceId = 'MAX30102_001',
  avatarLabel = 'G',
  scroll = true,
  contentContainerStyle,
  scrollProps,
}: ScreenWithMenuPushProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const insets = useSafeAreaInsets();

  const [isOpen, setIsOpen] = useState(false);

  // anim value que mueve TODO el contenido (header + body) a la derecha
  const translateX = useRef(new Animated.Value(0)).current;

  const deviceIsConnected = deviceStatus === 'Conectado';

  function openMenu() {
    setIsOpen(true);
    Animated.timing(translateX, {
      toValue: DRAWER_WIDTH, // empuja la pantalla
      duration: 200,
      useNativeDriver: true,
    }).start();
  }

  function closeMenu() {
    Animated.timing(translateX, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsOpen(false);
      }
    });
  }

  // helpers para navegar desde el menú
  function goProfile() {
    closeMenu();
    setTimeout(() => {
      navigation.navigate('Profile');
    }, 220); // esperamos tantito para que termine la anim
  }

  function goHistory() {
    closeMenu();
    setTimeout(() => {
      navigation.navigate('History');
    }, 220);
  }

  function goAlerts() {
    closeMenu();
    setTimeout(() => {
      console.log('Ir a Alertas/Recomendaciones');
      // futuro:
      // navigation.navigate('Alerts');
    }, 220);
  }

  return (
    <View style={styles.root}>
      {/* SIDEBAR (fijo atrás a la izquierda) */}
      <View style={[styles.sidebar, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.sidebarTitle}>Menú</Text>

        {/* ----- CUENTA ----- */}
        <View style={styles.sidebarSection}>
          <Text style={styles.sidebarSectionTitle}>Cuenta</Text>

          <TouchableOpacity style={styles.sidebarRow} onPress={goProfile}>
            <Text style={styles.sidebarRowText}>Perfil / Datos personales</Text>
            <Text style={styles.sidebarSubText}>
              Ver y editar tu información
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarRow} onPress={() => {}}>
            <Text style={styles.sidebarRowText}>Contacto de emergencia</Text>
            <Text style={styles.sidebarSubText}>
              A quién avisar si hay alerta
            </Text>
          </TouchableOpacity>
        </View>

        {/* ----- MONITOREO ----- */}
        <View style={styles.sidebarSection}>
          <Text style={styles.sidebarSectionTitle}>Monitoreo</Text>

          <TouchableOpacity style={styles.sidebarRow} onPress={() => {}}>
            <Text style={styles.sidebarRowText}>Dispositivo vinculado</Text>
            <Text style={styles.sidebarSubText}>
              {deviceStatus} · {deviceId}
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

        {/* ----- SESIÓN ----- */}
        <View style={styles.sidebarSection}>
          <Text style={styles.sidebarSectionTitle}>Sesión</Text>

          <TouchableOpacity
            style={styles.sidebarRow}
            onPress={() => {
              console.log('Cerrar sesión');
              // futuro:
              // - limpiar auth global
              // - navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
            }}
          >
            <Text style={[styles.sidebarRowText, { color: colors.danger }]}>
              Cerrar sesión
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sidebarFooter}>Pulse Vital v1.0.0</Text>
      </View>

      {/* FOREGROUND: toda la app que se mueve */}
      <Animated.View
        style={[
          styles.foregroundWrapper,
          {
            transform: [{ translateX }],
            // sombra / elevación cuando está abierto
            shadowOpacity: isOpen ? 0.6 : 0,
            elevation: isOpen ? 20 : 0,
          },
        ]}
      >
        {/* Si el menú está abierto, tocar en cualquier lugar cierra */}
        <Pressable style={{ flex: 1 }} disabled={!isOpen} onPress={closeMenu}>
          <View style={styles.foregroundInner}>
            {/* HEADER SUPERIOR */}
            <View
              style={[
                styles.headerRow,
                {
                  paddingTop: insets.top + 12, // safe area top dinámico
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.helloText}>
                  Hola, {userName} 👋
                </Text>

                <Text style={styles.deviceText}>
                  Dispositivo:{' '}
                  <Text
                    style={
                      deviceIsConnected ? styles.deviceOk : styles.deviceBad
                    }
                  >
                    {deviceStatus}
                  </Text>
                </Text>

                <Text style={styles.deviceSubText}>ID {deviceId}</Text>
              </View>

              {/* avatarLabel opcional */}
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{avatarLabel}</Text>
              </View>

              {/* Botón hamburguesa */}
              <TouchableOpacity
                style={styles.menuButton}
                onPress={isOpen ? closeMenu : openMenu}
              >
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
              </TouchableOpacity>
            </View>

            {/* CONTENIDO (SCROLL O ESTÁTICO) */}
            {scroll ? (
              <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={[
                  styles.scrollContent,
                  contentContainerStyle,
                  {
                    // Empuja el contenido final para que no lo tape la tab bar flotante
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

  /* SIDEBAR (fijo a la izquierda debajo) */
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
    // paddingTop dinámico con insets.top en render
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

  /* FOREGROUND (pantalla principal que se empuja) */
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

  // HEADER (parte arriba donde dice Hola..., estado del dispositivo, avatar y hamburguesa)
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    // paddingTop dinámico con insets.top en render
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

  // CONTENIDO
  scrollArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    // paddingBottom dinámico en render
  },

  staticArea: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    // paddingBottom dinámico en render
  },
});

export {};
