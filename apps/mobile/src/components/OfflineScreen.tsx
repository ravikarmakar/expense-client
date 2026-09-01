import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../constants/theme';

interface OfflineScreenProps {
  onRetry: () => Promise<void> | void;
}

export function OfflineScreen({ onRetry }: OfflineScreenProps) {
  const { isDark } = useTheme();
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#08110F' : COLORS.background }]}>
      <View style={styles.content}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.1)' : 'rgba(0, 105, 72, 0.08)' },
          ]}
        >
          <Ionicons name="cloud-offline-outline" size={56} color={isDark ? '#34d399' : '#006948'} />
        </View>

        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#191c1d' }]}>
          No Internet Connection
        </Text>

        <Text style={[styles.subtitle, { color: isDark ? 'rgba(255, 255, 255, 0.6)' : '#6d7a72' }]}>
          Please check your Wi-Fi or mobile data network and try again.
        </Text>

        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: isDark ? '#34d399' : '#006948' }]}
          onPress={handleRetry}
          disabled={isRetrying}
          activeOpacity={0.8}
        >
          {isRetrying ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons name="refresh" size={18} color="#ffffff" />
              <Text style={styles.retryButtonText}>Retry</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconWrapper: {
    width: 104,
    height: 104,
    borderRadius: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    shadowColor: '#006948',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
