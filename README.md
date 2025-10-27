# Pulse Vital 🩺💓

Pulse Vital es una app móvil (React Native + Expo) para monitorear signos vitales en tiempo real y dar un historial de salud al usuario.

La idea central:
- Conectas un sensor (por ejemplo MAX30102 / sensor de pulso y SpO₂).
- La app recibe lecturas frecuentes (frecuencia cardiaca, SpO₂, temperatura corporal).
- El usuario puede ver:
  - Monitoreo en vivo (tiempo real).
  - Historial con gráficas.
  - Resumen diario de su estado.
  - Alertas de riesgo y recomendaciones.

---

## Tech Stack

- **React Native** con **Expo** → multiplataforma (Android, iOS, Web).
- **TypeScript**
- **React Navigation**
  - Stack Navigator para flujo de login/onboarding.
  - Bottom Tab Navigator para Home / Historial / Live.
- **Custom layout `ScreenWithMenuPush`**
  - Pantalla con header propio (hola, estado del dispositivo).
  - Menú lateral que empuja la UI (perfil, historial, cerrar sesión).
  - Safe area / padding responsive ya manejado.
- **Charts** con [`react-native-chart-kit`] para tendencias históricas y monitoreo en vivo.
- Temado oscuro centralizado en `theme/colors.ts`.

---

## Estructura de carpetas (resumida)

```plaintext
pulse-vital/
├─ App.tsx
├─ src/
│  ├─ navigation/
│  │   ├─ RootNavigator.tsx      # stack principal (login, onboarding, tabs, profile...)
│  │   ├─ TabNavigator.tsx       # bottom tab con Home / History / Live
│  │
│  ├─ screens/
│  │   ├─ LoginScreen.tsx
│  │   ├─ RegisterScreen.tsx
│  │   ├─ HomeScreen.tsx         # dashboard general del día
│  │   ├─ HistoryScreen.tsx      # gráficas y rango de fechas
│  │   ├─ LiveScreen.tsx         # monitoreo en vivo
│  │   ├─ ProfileScreen.tsx      # perfil del usuario / dispositivo / emergencia
│  │   └─ onboarding/
│  │        ├─ OnboardingStep1Screen.tsx
│  │        ├─ OnboardingStep2Screen.tsx
│  │        └─ OnboardingStep3Screen.tsx
│  │
│  ├─ components/
│  │   ├─ ScreenWithMenuPush.tsx # layout global con header y sidebar push
│  │   ├─ VitalCard.tsx          # card chica de métricas (usada en Home v1)
│  │   └─ ... otros componentes reutilizables
│  │
│  ├─ theme/
│  │   └─ colors.ts              # paleta global (background, card, accent, etc.)
│  │
│  └─ utils/ (futuro)
│      └─ ... formateo de fechas, etc.
│
└─ package.json
```

---

## Flujo de pantallas

### 1. Login / Register
- **Login**: Autenticación con correo y contraseña (mock sin validación real por ahora).
- **Register**: Recoge nombre, edad, correo y contraseña. Redirige al login tras registro.
- **Navegación**: Post-registro, el usuario inicia sesión para acceder al onboarding o al dashboard.

### 2. Onboarding
- Se muestra solo en el primer uso (3 pantallas):
  - "Monitorea tus signos vitales en tiempo real."
  - "Consulta tu historial de salud."
  - "Recibe alertas y recomendaciones."
- Navega al **TabNavigator** principal al finalizar.

### 3. HomeScreen (Dashboard 🏠)
- Resumen diario con:
  - Última sesión monitoreada (e.g., "hace 2h").
  - Promedios de ritmo cardíaco, SpO₂ y temperatura.
  - Mini tendencias (sparklines).
  - Recomendaciones de salud (e.g., "todo estable", "vigila fiebre").
  - Acciones rápidas: "Iniciar monitoreo en vivo", "Ver historial".
  - Últimas alertas importantes.
- **Propósito**: Visión general del bienestar diario.

### 4. LiveScreen (Monitoreo ❤️)
- Estado del dispositivo (conectado/no conectado).
- Última lectura (hace X segundos).
- Métricas en tiempo real (ritmo cardíaco, SpO₂, temperatura) con colores (rojo/verde/amarillo).
- Mini gráfica en vivo del pulso.
- Alertas en tiempo real (e.g., "Oxigenación baja", "Temperatura elevada").
- **Propósito**: Monitoreo clínico en tiempo real.

### 5. HistoryScreen (Histórico 📊)
- Selector de rango de fechas (Hoy, 7 días, 30 días, Custom).
- Gráficas de:
  - Ritmo cardíaco (bpm).
  - SpO₂ (%).
  - Temperatura corporal (°F).
- Estadísticas (promedio, máximo, fiebre, etc.).
- **Tecnologías**: `react-native-chart-kit` + `react-native-svg`.
- **Propósito**: Análisis de progreso y tendencias.

### 6. ProfileScreen (Perfil 👤)
- Datos del usuario (nombre, edad, correo).
- Contacto de emergencia.
- Dispositivo vinculado:
  - ID del sensor.
  - Estado ("Conectado").
  - Última sincronización.
  - Nivel de batería.
- Acciones: Cambiar contraseña, cerrar sesión (futuro: reset stack al login).

### 7. Sidebar / Menú lateral
- Componente `ScreenWithMenuPush`:
  - Botón hamburguesa (arriba a la derecha).
  - Empuja la pantalla a la derecha al abrirse.
- Opciones:
  - Perfil.
  - Contacto de emergencia.
  - Historial completo.
  - Alertas y recomendaciones.
  - Cerrar sesión.

## Temas de diseño (UI)
La app usa un tema oscuro estilo "dashboard médico nocturno". Colores definidos en:

```javascript
export const colors = {
  background: '#0F172A', // Fondo global
  card: '#1E2537', // Tarjetas
  accent: '#4FD1C5', // Estado OK
  text: '#FFFFFF', // Texto principal
  muted: '#94A3B8', // Texto secundario
  dim: '#475569', // Texto apagado
  danger: '#F87171', // Alertas críticas
  warning: '#FACC15', // Precaución
  border: '#2E3A5C', // Bordes
  sidebarBg: '#111827', // Menú lateral
  sidebarBorder: '#1F2937',
  tabBarBg: '#1E2537', // Bottom tab
  tabBarBorder: '#2E3A5C',
  tabIconInactive: '#64748B',
  tabIconActive: '#FFFFFF',
  tabIconBgActive: '#334155',
  tabTextInactive: '#64748B',
  tabTextActive: '#FFFFFF',
  blackOnAccent: '#0F172A',
};
```

## Requisitos Previos
- **Node.js** y **npm** instalados.
- **Expo CLI**: Instala globalmente con `npm install -g expo-cli`.
- **Android Studio** (opcional, para emulador Android).
- **Expo Go** (app móvil para pruebas en dispositivos físicos).
- Dispositivo físico o emulador con conexión a la misma red WiFi que la PC (para pruebas locales).

## Instalación / Setup

1. **Clonar e instalar dependencias**
   ```bash
   git clone <tu-repo>
   cd pulse-vital
   npm install
   ```

2. **Instalar librerías necesarias para gráfica**
    ```bash
    npm install react-native-chart-kit
    npx expo install react-native-svg
    react-native-svg es necesaria porque react-native-chart-kit dibuja charts en SVG
    
    
3. **Correr el proyecto (modo desarrollo Expo)**

    ```bash
    npx expo start
    ```
    
Esto abre el panel de Expo.

Ahí puedes elegir:

a) presionar a para abrir Android Emulator (si tienes Android Studio configurado)

b) presionar w para abrir en web/browser

c) escanear el QR con la app Expo Go en tu teléfono físico (misma red WiFi)


## Problemas comunes

❗ "The requested URL timed out" al abrir en el teléfono físico

Asegúrate que tu teléfono y tu PC estén en la misma red WiFi.

Desactiva VPN en el teléfono.

Asegura que el firewall de la PC no bloquee puertos LAN.

En Expo, cambia de conexión "Tunnel" → "LAN" o al revés y vuelve a escanear el QR.

    ```bash
    npx expo start --tunnel
    ```
    
❗ Parpadeo/blanco al navegar entre pantallas onboarding

Eso pasa cuando el fondo por default de navegación es blanco.

Lo estamos corrigiendo con:

    ```bash
    <NavigationContainer

    theme={{
    
    ...DefaultTheme,
    
    colors: { ...DefaultTheme.colors, background: colors.background },
    
    }}
    
    \>
    ```

y cada pantalla usa contentStyle: { backgroundColor: colors.background }.

❗ Scroll cortado detrás de la tab bar flotante

ScreenWithMenuPush ya mete padding extra abajo con safe-area + 80px aprox, para que la pill flotante de la tab bar no tape el contenido.

## Próximos pasos (roadmap corto)

1. Guardar isFirstTime en algún estado / AsyncStorage para decidir si mostramos Onboarding o vamos directo a Home después de login.

2. Integrar un BLE / WiFi bridge real con el sensor físico para poblar LiveScreen.

3. Guardar lecturas históricas en backend (o en local primero) para alimentar HistoryScreen.

4. Agregar alerta de emergencia: si SpO₂ < cierto umbral, avisar al contacto de emergencia.

5. Implementar “Cerrar sesión” real: limpiar estado y navegar a Login.

## Licencia / Disclaimer

Esta app NO sustituye evaluación médica profesional.

Los datos mostrados son informativos.

Ante síntomas graves, debes buscar ayuda médica presencial inmediata.

## Autores / Crédito

UI / flujo: Pulse Vital

Frontend: React Native + Expo + TypeScript

Sensor objetivo inicial: MAX30102 (frecuencia cardíaca / oxigenación), temperatura externa reportada por el dispositivo.
