import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './src/theme/colors';
import { SlideMenuProvider } from './src/navigation/SlideMenuContext';
import { AuthProvider } from './src/context/AuthContext';

const PulseTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
    border: colors.border,
    text: colors.text,
    primary: colors.accent,
    notification: colors.accent,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={PulseTheme}>
        <SlideMenuProvider>
          <StatusBar barStyle="light-content" backgroundColor={colors.background} />
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </SlideMenuProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
