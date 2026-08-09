import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { globalStyles } from '../styles/globalStyles';
import { useTheme } from '../context/ThemeContext';
import { hapticFeedback } from '../utils/haptics';
import { useSettingsController } from '@workspace/api';
import { getAppVersionInfo } from '../utils/appVersion';

export default function SettingsDetailScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, themeMode, setThemeMode } = useTheme();
  const versionInfo = getAppVersionInfo();

  // Local preferences toggles
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [expenseNotifs, setExpenseNotifs] = useState(true);
  const [settlementNotifs, setSettlementNotifs] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const { handleLogout, isLoggingOut } = useSettingsController({
    onLogoutError: (err) => {
      Alert.alert('Error', err);
    },
  });

  const handleSelectTheme = (mode: 'light' | 'dark') => {
    hapticFeedback.selection();
    setThemeMode(mode);
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Top Navigation Header */}
      <View
        style={[
          styles.headerContainer,
          isDark && styles.headerContainerDark,
          { paddingTop: insets.top + 12 },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={[styles.backBtn, isDark && styles.backBtnDark]}
            activeOpacity={0.7}
            onPress={() => {
              hapticFeedback.selection();
              router.back();
            }}
          >
            <Ionicons name="arrow-back" size={24} color={isDark ? '#F9FAFB' : COLORS.onSurface} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>Settings</Text>
            <Text style={[styles.headerSubtitle, isDark && styles.headerSubtitleDark]}>
              Preferences & App Management
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[globalStyles.scrollContent, { paddingTop: 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Section 1: Appearance & Preferences ── */}
        <View style={[styles.settingsSection, isDark && styles.settingsSectionDark]}>
          <Text style={[styles.settingsGroupTitle, isDark && styles.settingsGroupTitleDark]}>
            Appearance & Preferences
          </Text>

          {/* Theme Switcher */}
          <View style={[styles.settingsItem, isDark && styles.settingsItemDark]}>
            <View style={styles.settingsItemLeft}>
              <View
                style={[
                  styles.iconBadge,
                  {
                    backgroundColor: themeMode === 'dark' ? 'rgba(52, 211, 153, 0.15)' : '#fff3e0',
                  },
                ]}
              >
                <Ionicons
                  name={themeMode === 'dark' ? 'moon' : 'sunny'}
                  size={18}
                  color={themeMode === 'dark' ? '#34d399' : '#f59e0b'}
                />
              </View>
              <Text style={[styles.settingsItemLabel, isDark && styles.settingsItemLabelDark]}>
                Theme
              </Text>
            </View>

            <View style={[styles.themeTogglePill, isDark && styles.themeTogglePillDark]}>
              <TouchableOpacity
                style={[
                  styles.themeOptionBtn,
                  themeMode === 'light' && styles.themeOptionActiveLight,
                ]}
                activeOpacity={0.8}
                onPress={() => handleSelectTheme('light')}
              >
                <Ionicons
                  name="sunny-outline"
                  size={12}
                  color={themeMode === 'light' ? '#1e293b' : COLORS.outline}
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    themeMode === 'light' && styles.themeOptionTextActiveLight,
                  ]}
                >
                  Light
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeOptionBtn,
                  themeMode === 'dark' && styles.themeOptionActiveDark,
                ]}
                activeOpacity={0.8}
                onPress={() => handleSelectTheme('dark')}
              >
                <Ionicons
                  name="moon-outline"
                  size={12}
                  color={themeMode === 'dark' ? '#10B981' : COLORS.outline}
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    themeMode === 'dark' && styles.themeOptionTextActiveDark,
                  ]}
                >
                  Dark
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Haptic Feedback Toggle */}
          <View style={[styles.settingsItem, isDark && styles.settingsItemDark]}>
            <View style={styles.settingsItemLeft}>
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: isDark ? 'rgba(192, 132, 252, 0.15)' : '#f3e5f5' },
                ]}
              >
                <Ionicons
                  name="hardware-chip-outline"
                  size={18}
                  color={isDark ? '#C084FC' : '#7b1fa2'}
                />
              </View>
              <Text style={[styles.settingsItemLabel, isDark && styles.settingsItemLabelDark]}>
                Haptic Vibrations
              </Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={(val) => {
                hapticFeedback.selection();
                setHapticsEnabled(val);
              }}
              trackColor={{ false: '#e2e8f0', true: isDark ? '#059669' : COLORS.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* ── Section 2: Account & Security ── */}
        <View style={[styles.settingsSection, isDark && styles.settingsSectionDark]}>
          <Text style={[styles.settingsGroupTitle, isDark && styles.settingsGroupTitleDark]}>
            Security & Authentication
          </Text>

          <TouchableOpacity
            style={[styles.settingsItem, isDark && styles.settingsItemDark]}
            activeOpacity={0.7}
            onPress={() => router.push('/change-password')}
          >
            <View style={styles.settingsItemLeft}>
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: isDark ? 'rgba(248, 113, 113, 0.15)' : '#fce8e6' },
                ]}
              >
                <Ionicons name="key" size={18} color={isDark ? '#F87171' : '#c5221f'} />
              </View>
              <Text style={[styles.settingsItemLabel, isDark && styles.settingsItemLabelDark]}>
                Change Password
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? '#6B7280' : COLORS.outlineVariant}
            />
          </TouchableOpacity>

          {/* Biometric Security */}
          <View style={[styles.settingsItem, isDark && styles.settingsItemDark]}>
            <View style={styles.settingsItemLeft}>
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.15)' : '#e6f4ea' },
                ]}
              >
                <Ionicons
                  name="finger-print-outline"
                  size={18}
                  color={isDark ? '#34D399' : '#137333'}
                />
              </View>
              <Text style={[styles.settingsItemLabel, isDark && styles.settingsItemLabelDark]}>
                Face ID / Biometric Lock
              </Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={(val) => {
                hapticFeedback.selection();
                setBiometricsEnabled(val);
              }}
              trackColor={{ false: '#e2e8f0', true: isDark ? '#059669' : COLORS.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* ── Section 3: Notification Preferences ── */}
        <View style={[styles.settingsSection, isDark && styles.settingsSectionDark]}>
          <Text style={[styles.settingsGroupTitle, isDark && styles.settingsGroupTitleDark]}>
            Notification Preferences
          </Text>

          <View style={[styles.settingsItem, isDark && styles.settingsItemDark]}>
            <View style={styles.settingsItemLeft}>
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : '#fef7e0' },
                ]}
              >
                <Ionicons
                  name="notifications-outline"
                  size={18}
                  color={isDark ? '#FBBF24' : '#b06000'}
                />
              </View>
              <Text style={[styles.settingsItemLabel, isDark && styles.settingsItemLabelDark]}>
                Expense Activity Alerts
              </Text>
            </View>
            <Switch
              value={expenseNotifs}
              onValueChange={(val) => {
                hapticFeedback.selection();
                setExpenseNotifs(val);
              }}
              trackColor={{ false: '#e2e8f0', true: isDark ? '#059669' : COLORS.primary }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={[styles.settingsItem, isDark && styles.settingsItemDark]}>
            <View style={styles.settingsItemLeft}>
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe' },
                ]}
              >
                <Ionicons name="cash-outline" size={18} color={isDark ? '#38BDF8' : '#0284c7'} />
              </View>
              <Text style={[styles.settingsItemLabel, isDark && styles.settingsItemLabelDark]}>
                Settlement Reminders
              </Text>
            </View>
            <Switch
              value={settlementNotifs}
              onValueChange={(val) => {
                hapticFeedback.selection();
                setSettlementNotifs(val);
              }}
              trackColor={{ false: '#e2e8f0', true: isDark ? '#059669' : COLORS.primary }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={[styles.settingsItem, isDark && styles.settingsItemDark]}>
            <View style={styles.settingsItemLeft}>
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: isDark ? 'rgba(96, 165, 250, 0.15)' : '#e2f2ff' },
                ]}
              >
                <Ionicons name="mail-outline" size={18} color={isDark ? '#60A5FA' : '#0066cc'} />
              </View>
              <Text style={[styles.settingsItemLabel, isDark && styles.settingsItemLabelDark]}>
                Weekly Expense Summary
              </Text>
            </View>
            <Switch
              value={weeklyDigest}
              onValueChange={(val) => {
                hapticFeedback.selection();
                setWeeklyDigest(val);
              }}
              trackColor={{ false: '#e2e8f0', true: isDark ? '#059669' : COLORS.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* ── Section 4: Data & Storage ── */}
        <View style={[styles.settingsSection, isDark && styles.settingsSectionDark]}>
          <Text style={[styles.settingsGroupTitle, isDark && styles.settingsGroupTitleDark]}>
            Data & Management
          </Text>

          <TouchableOpacity
            style={[styles.settingsItem, isDark && styles.settingsItemDark]}
            activeOpacity={0.7}
            onPress={() => router.push('/categories')}
          >
            <View style={styles.settingsItemLeft}>
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: isDark ? 'rgba(96, 165, 250, 0.15)' : '#e2f2ff' },
                ]}
              >
                <Ionicons name="grid" size={18} color={isDark ? '#60A5FA' : '#0066cc'} />
              </View>
              <Text style={[styles.settingsItemLabel, isDark && styles.settingsItemLabelDark]}>
                Manage Categories
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? '#6B7280' : COLORS.outlineVariant}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingsItem, isDark && styles.settingsItemDark]}
            activeOpacity={0.7}
            onPress={() => router.push('/personal-wallet')}
          >
            <View style={styles.settingsItemLeft}>
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.15)' : '#e6f4ea' },
                ]}
              >
                <Ionicons name="wallet" size={18} color={isDark ? '#34D399' : '#137333'} />
              </View>
              <Text style={[styles.settingsItemLabel, isDark && styles.settingsItemLabelDark]}>
                Personal Wallet
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? '#6B7280' : COLORS.outlineVariant}
            />
          </TouchableOpacity>
        </View>

        {/* ── Section 5: Support & Legal ── */}
        <View style={[styles.settingsSection, isDark && styles.settingsSectionDark]}>
          <Text style={[styles.settingsGroupTitle, isDark && styles.settingsGroupTitleDark]}>
            Support & Legal
          </Text>

          <TouchableOpacity
            style={[styles.settingsItem, isDark && styles.settingsItemDark]}
            activeOpacity={0.7}
            onPress={() => {
              hapticFeedback.selection();
              Alert.alert(
                'Send Feedback',
                'We would love to hear your thoughts! Send your feedback or feature suggestions to support@splitshare.app.',
                [{ text: 'OK' }]
              );
            }}
          >
            <View style={styles.settingsItemLeft}>
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe' },
                ]}
              >
                <Ionicons
                  name="chatbubble-ellipses"
                  size={18}
                  color={isDark ? '#38BDF8' : '#0284c7'}
                />
              </View>
              <Text style={[styles.settingsItemLabel, isDark && styles.settingsItemLabelDark]}>
                Send Feedback
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? '#6B7280' : COLORS.outlineVariant}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingsItem, isDark && styles.settingsItemDark]}
            activeOpacity={0.7}
            onPress={() => {
              hapticFeedback.selection();
              Alert.alert(
                'Terms of Service',
                'By using SplitShare, you agree to our fair usage policies, shared ledger rules, and account guidelines.',
                [{ text: 'Close' }]
              );
            }}
          >
            <View style={styles.settingsItemLeft}>
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: isDark ? 'rgba(96, 165, 250, 0.15)' : '#e2f2ff' },
                ]}
              >
                <Ionicons name="document-text" size={18} color={isDark ? '#60A5FA' : '#0066cc'} />
              </View>
              <Text style={[styles.settingsItemLabel, isDark && styles.settingsItemLabelDark]}>
                Terms of Service
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? '#6B7280' : COLORS.outlineVariant}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingsItem, isDark && styles.settingsItemDark]}
            activeOpacity={0.7}
            onPress={() => {
              hapticFeedback.selection();
              Alert.alert(
                'Privacy Policy',
                'Your expense data is securely encrypted. We never sell your financial records to third parties.',
                [{ text: 'Close' }]
              );
            }}
          >
            <View style={styles.settingsItemLeft}>
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: isDark ? 'rgba(96, 165, 250, 0.15)' : '#e2f2ff' },
                ]}
              >
                <Ionicons name="lock-closed" size={18} color={isDark ? '#60A5FA' : '#0066cc'} />
              </View>
              <Text style={[styles.settingsItemLabel, isDark && styles.settingsItemLabelDark]}>
                Privacy Policy
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? '#6B7280' : COLORS.outlineVariant}
            />
          </TouchableOpacity>
        </View>

        {/* ── Section 6: Session & Log Out ── */}
        <View style={styles.logoutSectionContainer}>
          <TouchableOpacity
            style={[
              styles.logoutBtn,
              isDark && styles.logoutBtnDark,
              isLoggingOut && { opacity: 0.5 },
            ]}
            activeOpacity={0.7}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            <View style={styles.settingsItemLeft}>
              <View style={[styles.logoutIconBadge, isDark && styles.logoutIconBadgeDark]}>
                <Ionicons name="log-out" size={16} color={isDark ? '#F87171' : COLORS.error} />
              </View>
              <Text
                style={[
                  styles.settingsItemLabel,
                  { color: isDark ? '#F87171' : COLORS.error, fontWeight: '700' },
                ]}
              >
                Log Out of Account
              </Text>
            </View>
            {isLoggingOut ? (
              <ActivityIndicator size="small" color={isDark ? '#F87171' : COLORS.error} />
            ) : (
              <Ionicons
                name="chevron-forward"
                size={18}
                color={isDark ? '#F87171' : COLORS.error}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Application Version Footer */}
        <View style={styles.footerContainer}>
          <Text style={[styles.footerBrand, isDark && { color: '#9CA3AF' }]}>SplitShare</Text>
          <Text style={[styles.footerVersion, isDark && { color: '#6B7280' }]}>
            {versionInfo.displayString}
          </Text>
          <Text style={[styles.footerCopyright, isDark && { color: '#6B7280' }]}>
            © 2026 SplitShare Inc. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  containerDark: {
    backgroundColor: '#08110F',
  },
  headerContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  headerContainerDark: {
    backgroundColor: '#0D1714',
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  backBtnDark: {
    backgroundColor: '#131D1A',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.3,
  },
  headerTitleDark: {
    color: '#F9FAFB',
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.outline,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerSubtitleDark: {
    color: '#9CA3AF',
  },
  settingsSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    padding: 16,
    marginBottom: 16,
  },
  settingsSectionDark: {
    backgroundColor: '#131D1A',
    borderColor: '#1E292B',
  },
  logoutSectionContainer: {
    marginBottom: 20,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  logoutBtnDark: {
    backgroundColor: '#131D1A',
    borderColor: '#1E292B',
  },
  logoutIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#fde8e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIconBadgeDark: {
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
  },
  settingsGroupTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    paddingLeft: 4,
  },
  settingsGroupTitleDark: {
    color: '#34D399',
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  settingsItemDark: {
    borderBottomColor: '#1E292B',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  settingsItemLabelDark: {
    color: '#F9FAFB',
  },
  themeTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 20,
    padding: 3,
    gap: 2,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  themeTogglePillDark: {
    backgroundColor: '#0D1714',
    borderColor: '#1E292B',
  },
  themeOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 4,
  },
  themeOptionActiveLight: {
    backgroundColor: '#ffffff',
    elevation: 1,
  },
  themeOptionActiveDark: {
    backgroundColor: '#131D1A',
    elevation: 1,
  },
  themeOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.outline,
  },
  themeOptionTextActiveLight: {
    color: '#1e293b',
    fontWeight: '700',
  },
  themeOptionTextActiveDark: {
    color: '#34D399',
    fontWeight: '700',
  },
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 40,
    gap: 4,
  },
  footerBrand: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.outline,
    letterSpacing: 0.5,
  },
  footerVersion: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.outlineVariant,
  },
  footerCopyright: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.outlineVariant,
    marginTop: 4,
  },
});
