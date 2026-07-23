import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { hapticFeedback } from '../../utils/haptics';
import { useTheme } from '../../context/ThemeContext';

function GlassTabBar() {
  const { isDark } = useTheme();

  return (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      <BlurView intensity={100} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      {/* Frosted glass overlay */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: isDark
              ? Platform.OS === 'ios'
                ? 'rgba(8, 17, 15, 0.82)'
                : 'rgba(8, 17, 15, 0.92)'
              : Platform.OS === 'ios'
                ? 'rgba(255, 255, 255, 0.85)'
                : 'rgba(255, 255, 255, 0.95)',
          },
        ]}
      />
      {/* Subtle top glass border */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: isDark ? 'rgba(52, 211, 153, 0.15)' : 'rgba(0, 0, 0, 0.08)',
        }}
      />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const isAndroid = Platform.OS === 'android';
  const { isDark } = useTheme();

  return (
    <Tabs
      screenListeners={{
        tabPress: () => hapticFeedback.selection(),
      }}
      screenOptions={{
        tabBarActiveTintColor: isDark ? '#34d399' : '#006948',
        tabBarInactiveTintColor: isDark ? 'rgba(255, 255, 255, 0.4)' : '#6d7a72',
        headerShown: false,
        tabBarBackground: () => <GlassTabBar />,
        tabBarStyle: {
          position: 'absolute',
          height: isAndroid ? 60 + insets.bottom : 76,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          paddingBottom: isAndroid ? (insets.bottom > 0 ? insets.bottom : 10) : 20,
          paddingTop: 12,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="personal"
        options={{
          title: 'Personal',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
