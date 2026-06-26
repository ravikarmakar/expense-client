import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import type { User } from '@workspace/types';

export default function StarterScreen() {
  const dummyUser: User = {
    id: '2',
    name: 'Mobile App Workspace',
    email: 'mobile@workspace.local',
    createdAt: new Date(),
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Expo Workspace' }} />
      <View style={styles.card}>
        <Text style={styles.title}>React Native Expo</Text>
        <Text style={styles.subtitle}>
          This Expo application is running inside a Turborepo monorepo using pnpm. It shares
          configurations and TypeScript types with the web application.
        </Text>

        <View style={styles.logBox}>
          <Text style={styles.logTitle}>{'// Verified Shared Type Import'}</Text>
          <Text style={styles.logText}>User ID: {dummyUser.id}</Text>
          <Text style={styles.logText}>Name: {dummyUser.name}</Text>
          <Text style={styles.logText}>Email: {dummyUser.email}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0c1b',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00c6ff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  logBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  logTitle: {
    color: '#00c6ff',
    fontSize: 12,
    marginBottom: 8,
  },
  logText: {
    fontSize: 12,
    color: '#fff',
    lineHeight: 18,
  },
});
