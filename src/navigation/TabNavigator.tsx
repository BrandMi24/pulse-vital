import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';

import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import LiveScreen from '../screens/LiveScreen';

import { MaterialCommunityIcons } from '@expo/vector-icons';

export type TabParamList = {
  HistoryTab: undefined;
  HomeTab: undefined;
  MonitorTab: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_HEIGHT = 85;
const TAB_CONTENT_HEIGHT = 56;

export default function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,

        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 30, // súbelo un poco
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: TAB_HEIGHT,
        },

        tabBarBackground: () => <View style={styles.tabBarBackground} />,

        tabBarIcon: ({ focused }) => {
          let iconName = '';
          let label = '';

          if (route.name === 'HomeTab') {
            iconName = 'home-outline';
            label = 'Home';
          } else if (route.name === 'HistoryTab') {
            iconName = 'chart-bar';
            label = 'History';
          } else if (route.name === 'MonitorTab') {
            iconName = 'heart-pulse';
            label = 'Monitory';
          }

          return (
            <View style={styles.tapArea}>
              <View style={styles.tabContentBox}>
                <View
                  style={[
                    styles.iconWrapper,
                    focused && styles.iconWrapperActive,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={iconName as any}
                    size={22}
                    color={
                      focused
                        ? colors.tabIconActive
                        : colors.tabIconInactive
                    }
                  />
                </View>

                <Text
                  style={[
                    styles.tabLabel,
                    focused && styles.tabLabelActive,
                    {
                      color: focused
                        ? colors.tabTextActive
                        : colors.tabTextInactive,
                    },
                  ]}
                >
                  {label}
                </Text>
              </View>
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="HistoryTab" component={HistoryScreen} />
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="MonitorTab" component={LiveScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarBackground: {
    position: 'absolute',
    alignSelf: 'center',      // centra horizontalmente
    bottom: 0,
    width: '95%',             // o usa un valor fijo, ej: 300
    height: TAB_HEIGHT,
    borderRadius: 26,
    backgroundColor: colors.tabBarBg,
    borderWidth: 1,
    borderColor: colors.tabBarBorder,
  },

  tapArea: {
    flex: 1,
    height: TAB_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabContentBox: {
    height: TAB_CONTENT_HEIGHT,
    width: '100%',
    maxWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    transform: [{ translateY: 20 }], // 🔥 Baja todo un poco más dentro de la barra
  },

  iconWrapper: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'transparent',
    transform: [{ translateY: 4 }], // 🔥 Baja el ícono dentro del rectángulo
  },

  iconWrapperActive: {
    backgroundColor: colors.tabIconBgActive,
  },

  tabLabel: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 16,
    textAlign: 'center',
    includeFontPadding: false,
  },

  tabLabelActive: {
    fontWeight: '600',
  },
});
