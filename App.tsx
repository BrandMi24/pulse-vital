import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './src/theme/colors';

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
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
