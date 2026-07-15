import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';

interface TopAppBarProps {
  onNotificationPress?: () => void;
  onAddFriendPress?: () => void;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  unreadCount?: number;
  rightActionIcon?: keyof typeof Ionicons.glyphMap;
  onRightActionPress?: () => void;
}

export function TopAppBar({
  onNotificationPress,
  onAddFriendPress,
  title,
  showBack,
  onBack,
  unreadCount,
  rightActionIcon,
  onRightActionPress,
}: TopAppBarProps) {
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
          <TouchableOpacity style={styles.headerLogoContainer} activeOpacity={0.75}>
            <View style={styles.logoIconBadge}>
              <MaterialIcons name="account-balance-wallet" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.headerTitle}>SplitShare</Text>
          </TouchableOpacity>
        )}

        {title && showBack && (
          <Text style={styles.centerTitle} numberOfLines={1}>
            {title}
          </Text>
        )}

        {showBack &&
          (rightActionIcon && onRightActionPress ? (
            <TouchableOpacity
              onPress={onRightActionPress}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <Ionicons name={rightActionIcon} size={24} color={COLORS.onSurface} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          ))}

        {!showBack && (
          <View style={styles.rightActions}>
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.7}
              onPress={onAddFriendPress}
            >
              <Ionicons name="person-add" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.7}
              onPress={onNotificationPress}
            >
              <View style={styles.iconWrapper}>
                <Ionicons name="notifications" size={25} color={COLORS.onSurface} />
                {!!unreadCount && unreadCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        )}
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
  logoIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#e8f0fe',
    borderWidth: 1,
    borderColor: '#d2e3fc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginLeft: 10,
    letterSpacing: -0.8,
  },
  centerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconWrapper: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  notificationBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
  },
});
