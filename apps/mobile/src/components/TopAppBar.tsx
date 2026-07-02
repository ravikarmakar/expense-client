import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';

interface TopAppBarProps {
  onNotificationPress?: () => void;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function TopAppBar({ onNotificationPress, title, showBack, onBack }: TopAppBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.headerContainer,
        { paddingTop: insets.top, backgroundColor: COLORS.background },
      ]}
    >
      <View style={styles.header}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.headerLogoContainer} activeOpacity={0.7}>
            <MaterialIcons name="account-balance-wallet" size={24} color={COLORS.primary} />
            <Text style={styles.headerTitle}>SplitShare</Text>
          </TouchableOpacity>
        )}

        {title && showBack && (
          <Text style={styles.centerTitle} numberOfLines={1}>
            {title}
          </Text>
        )}

        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={onNotificationPress}
        >
          {!showBack && (
            <Ionicons name="notifications-outline" size={24} color={COLORS.onSurfaceVariant} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 64,
    justifyContent: 'space-between',
  },
  headerLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 8,
    letterSpacing: -0.5,
  },
  centerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
