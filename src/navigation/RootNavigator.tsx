import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

import OnboardingStep1Screen from '../screens/onboarding/OnboardingStep1Screen';
import OnboardingStep2Screen from '../screens/onboarding/OnboardingStep2Screen';
import OnboardingStep3Screen from '../screens/onboarding/OnboardingStep3Screen';

import TabNavigator from './TabNavigator';

import ProfileScreen from '../screens/ProfileScreen';
import HistoryScreen from '../screens/HistoryScreen';

import { colors } from '../theme/colors';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;

  OnboardingStep1: undefined;
  OnboardingStep2: undefined;
  OnboardingStep3: undefined;

  MainTabs: undefined;

  Profile: undefined;
  History: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Fase 1: antes de iniciar sesión → Login / Register
  if (!isLoggedIn) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Login">
          {(props) => (
            <LoginScreen
              {...props}
              onLogin={() => {
                // cuando el usuario "inicia sesión"
                // lo marcamos como logueado
                setIsLoggedIn(true);
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    );
  }

  // Fase 2 y 3: usuario logueado
  // Aquí ya tenemos:
  // - onboarding steps (primero que nada)
  // - luego el TabNavigator (MainTabs)
  // - y pantallas extra como Profile e History
  //
  // Nota: Profile e History están registradas aquí incluso si
  // también tienes tabs que muestran info parecida. Eso es normal:
  // esto permite navegar directo desde el menú lateral.
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade',
      }}
    >
      {/* Onboarding flow */}
      <Stack.Screen name="OnboardingStep1" component={OnboardingStep1Screen} />
      <Stack.Screen name="OnboardingStep2" component={OnboardingStep2Screen} />
      <Stack.Screen name="OnboardingStep3" component={OnboardingStep3Screen} />

      {/* Pantalla principal con tabs */}
      <Stack.Screen name="MainTabs" component={TabNavigator} />

      {/* Rutas accesibles desde el menú lateral */}
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
    </Stack.Navigator>
  );
}
