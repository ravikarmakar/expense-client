import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';

interface TopAppBarProps {
  onNotificationPress?: () => void;
  onAddFriendPress?: () => void;
  title?: string;
  titleAlign?: 'left' | 'center';
  showBack?: boolean;
  onBack?: () => void;
  unreadCount?: number;
  rightActionIcon?: keyof typeof Ionicons.glyphMap;
  onRightActionPress?: () => void;
  rightActions?: React.ReactNode;
  variant?: 'light' | 'dark';
  titleStyle?: object;
}

export function TopAppBar({
  onNotificationPress,
  onAddFriendPress,
  title,
  titleAlign = 'left',
  showBack,
  onBack,
  unreadCount,
  rightActionIcon,
  onRightActionPress,
  rightActions,
  variant = 'light',
  titleStyle,
}: TopAppBarProps) {
  const insets = useSafeAreaInsets();
  const isDark = variant === 'dark';
  const textColor = isDark ? '#ffffff' : COLORS.onSurface;
  const iconColor = isDark ? '#ffffff' : COLORS.onSurface;

  return (
    <View
      style={[
        styles.headerContainer,
        isDark ? styles.headerContainerDark : undefined,
        {
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.header}>
        {showBack ? (
          <View style={styles.leftHeaderGroup}>
            <TouchableOpacity onPress={onBack} style={styles.iconButton} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
            {title && (
              <Text
                style={[
                  titleAlign === 'center' ? styles.centerTitle : styles.leftTitle,
                  { color: textColor },
                  titleStyle,
                ]}
                numberOfLines={1}
              >
                {title}
              </Text>
            )}
          </View>
        ) : (
          <TouchableOpacity style={styles.headerLogoContainer} activeOpacity={0.75}>
            <View
              style={[
                styles.logoIconBadge,
                isDark && {
                  backgroundColor: 'rgba(52, 211, 153, 0.12)',
                  borderColor: 'rgba(52, 211, 153, 0.28)',
                },
              ]}
            >
              <MaterialIcons
                name="account-balance-wallet"
                size={22}
                color={isDark ? '#34d399' : COLORS.primary}
              />
            </View>
            <Text style={[styles.headerTitle, { color: textColor }, titleStyle]}>SplitShare</Text>
          </TouchableOpacity>
        )}

        {showBack &&
          (rightActions ? (
            <View style={styles.rightActions}>{rightActions}</View>
          ) : rightActionIcon && onRightActionPress ? (
            <TouchableOpacity
              onPress={onRightActionPress}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <Ionicons name={rightActionIcon} size={24} color={iconColor} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 10 }} />
          ))}

        {!showBack && (
          <View style={styles.rightActions}>
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.7}
              onPress={onAddFriendPress}
            >
              <Ionicons name="person-add" size={24} color={iconColor} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.7}
              onPress={onNotificationPress}
            >
              <View style={styles.iconWrapper}>
                <Ionicons name="notifications" size={25} color={iconColor} />
                {!!unreadCount && unreadCount > 0 && (
                  <View style={[styles.notificationBadge, isDark && { borderColor: '#08110F' }]}>
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
    backgroundColor: COLORS.surface,
  },
  headerContainerDark: {
    backgroundColor: '#0D1714',
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 64,
    justifyContent: 'space-between',
  },
  leftHeaderGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
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
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginLeft: 10,
    letterSpacing: -0.8,
  },
  leftTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  centerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
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
