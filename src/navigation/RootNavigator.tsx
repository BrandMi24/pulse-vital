// navigation/RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

import OnboardingStep1Screen from '../screens/onboarding/OnboardingStep1Screen';
import OnboardingStep2Screen from '../screens/onboarding/OnboardingStep2Screen';
import OnboardingStep3Screen from '../screens/onboarding/OnboardingStep3Screen';

import PairDeviceScreen from '../screens/PairDeviceScreen';

import TabNavigator from './TabNavigator';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;

  OnboardingStep1: undefined;
  OnboardingStep2: undefined;
  OnboardingStep3: undefined;

  MainTabs: undefined;
  PairDevice: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isLoggedIn, login } = useAuth(); // 👈 usamos el contexto

  if (!isLoggedIn) {
    // 🔒 FLOW SIN SESIÓN
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
              onLogin={login} // 👈 marca logged in
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      </Stack.Navigator>
    );
  }

  // ✅ FLOW CON SESIÓN
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="OnboardingStep1" component={OnboardingStep1Screen} />
      <Stack.Screen name="OnboardingStep2" component={OnboardingStep2Screen} />
      <Stack.Screen name="OnboardingStep3" component={OnboardingStep3Screen} />
      <Stack.Screen name="MainTabs" component={TabNavigator} />

      <Stack.Screen name="PairDevice" component={PairDeviceScreen} />

      {/* ForgotPassword disponible también estando logueado */}
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}
