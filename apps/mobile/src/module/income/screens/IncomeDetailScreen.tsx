import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';
import { globalStyles } from '../../../styles/globalStyles';
import { useIncome, useDeleteIncome } from '@workspace/api';
import { TopAppBar } from '../../../components/TopAppBar';
import { ErrorView } from '../../../components/ErrorView';
import { AddIncomeModal } from '../../../components/AddIncomeModal';
import { useRouteParams, idParamSchema } from '../../../hooks/useRouteParams';
import { CustomAlertDialog } from '../../../components/CustomAlertDialog';
import { SkeletonLoader } from '../../../components/SkeletonLoader';
import { useTheme } from '../../../context/ThemeContext';
import { AppBackground } from '../../../components/AppBackground';
import { hapticFeedback } from '../../../utils/haptics';

const SOURCE_VISUALS: Record<string, { icon: string; color: string; bg: string }> = {
  Salary: { icon: 'cash-outline', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
  'Parents / Family': { icon: 'heart-outline', color: '#EC4899', bg: 'rgba(236, 72, 153, 0.12)' },
  'Pocket Money': { icon: 'wallet-outline', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
  Freelance: { icon: 'laptop-outline', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' },
  Investment: { icon: 'trending-up-outline', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' },
  Bonus: { icon: 'gift-outline', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
  Other: {
    icon: 'ellipsis-horizontal-circle-outline',
    color: '#6B7280',
    bg: 'rgba(107, 114, 128, 0.12)',
  },
};

function getSourceVisual(source: string) {
  return SOURCE_VISUALS[source] || SOURCE_VISUALS.Other;
}

export default function IncomeDetailScreen() {
  const { id } = useRouteParams(idParamSchema);
  const { data: income, isLoading, isError, refetch } = useIncome(id);
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const variant = isDark ? 'dark' : 'light';

  const [editVisible, setEditVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    showCancel?: boolean;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    onCancel?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const deleteIncome = useDeleteIncome();

  const handleDelete = () => {
    setAlertConfig({
      visible: true,
      title: 'Delete Income',
      message: 'Are you sure you want to delete this income entry? This action cannot be undone.',
      showCancel: true,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      icon: 'trash',
      iconColor: COLORS.error,
      onConfirm: () => {
        setAlertConfig((prev) => ({ ...prev, visible: false }));
        if (income) {
          deleteIncome.mutate(income.id, {
            onSuccess: () => {
              hapticFeedback.success();
              router.back();
            },
            onError: (err) => {
              setAlertConfig({
                visible: true,
                title: 'Error',
                message: err.message || 'Failed to delete income entry',
                icon: 'alert-circle',
                iconColor: COLORS.error,
                onConfirm: () => {
                  setAlertConfig((prev) => ({ ...prev, visible: false }));
                },
              });
            },
          });
        }
      },
      onCancel: () => {
        setAlertConfig((prev) => ({ ...prev, visible: false }));
      },
    });
  };

  if (isLoading) {
    return (
      <AppBackground style={styles.container}>
        <TopAppBar title="Income Details" showBack onBack={() => router.back()} variant={variant} />
        <View style={{ padding: 20, gap: 16 }}>
          <SkeletonLoader height={180} borderRadius={24} />
          <SkeletonLoader height={90} borderRadius={20} />
          <SkeletonLoader height={110} borderRadius={20} />
        </View>
      </AppBackground>
    );
  }

  if (isError || !income) {
    return (
      <AppBackground style={styles.container}>
        <TopAppBar title="Income Details" showBack onBack={() => router.back()} variant={variant} />
        <ErrorView message="Failed to load income details" onRetry={refetch} />
      </AppBackground>
    );
  }

  const visual = getSourceVisual(income.source);
  const dateObj = new Date(income.date);
  const dateStr = dateObj.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const createdDate = new Date(income.createdAt || income.date);
  let hours = createdDate.getHours();
  const minutes = createdDate.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const timeStr = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;

  return (
    <AppBackground style={styles.container}>
      <TopAppBar
        title="Income Details"
        showBack
        onBack={() => router.back()}
        rightActionIcon="ellipsis-vertical"
        onRightActionPress={() => setMenuVisible(true)}
        variant={variant}
      />

      <ScrollView
        contentContainerStyle={[globalStyles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View style={[styles.heroCard, isDark ? styles.heroCardDark : styles.heroCardLight]}>
          <View style={[styles.heroIconBg, { backgroundColor: visual.bg }]}>
            <Ionicons name={visual.icon as never} size={36} color={visual.color} />
          </View>
          <Text style={[styles.heroTitle, isDark && { color: '#ffffff' }]}>{income.source}</Text>
          <Text style={styles.heroAmount}>
            +{CURRENCY_SYMBOL}
            {income.amount.toFixed(2)}
          </Text>

          {income.paymentMethod && (
            <View style={[styles.methodBadgeLarge, isDark && styles.methodBadgeLargeDark]}>
              <Ionicons name="card-outline" size={14} color="#10B981" />
              <Text style={[styles.methodBadgeLargeText, isDark && { color: '#34D399' }]}>
                Received via {income.paymentMethod}
              </Text>
            </View>
          )}

          <View style={styles.heroMeta}>
            <View style={[styles.metaBadge, isDark && styles.metaBadgeDark]}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={isDark ? '#9CA3AF' : COLORS.onSurfaceVariant}
              />
              <Text style={[styles.metaBadgeText, isDark && { color: '#D1D5DB' }]}>{dateStr}</Text>
            </View>
            <View style={[styles.metaBadge, isDark && styles.metaBadgeDark]}>
              <Ionicons
                name="time-outline"
                size={14}
                color={isDark ? '#9CA3AF' : COLORS.onSurfaceVariant}
              />
              <Text style={[styles.metaBadgeText, isDark && { color: '#D1D5DB' }]}>{timeStr}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && { color: '#ffffff' }]}>Payment Method</Text>
          <View
            style={[styles.detailCard, isDark ? styles.detailCardDark : styles.detailCardLight]}
          >
            <View style={styles.detailRow}>
              <View style={[styles.detailIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                <Ionicons name="wallet-outline" size={20} color="#10B981" />
              </View>
              <View style={styles.detailInfo}>
                <Text style={[styles.detailLabel, isDark && { color: 'rgba(255, 255, 255, 0.5)' }]}>
                  Payment Mode
                </Text>
                <Text style={[styles.detailValue, isDark && { color: '#ffffff' }]}>
                  {income.paymentMethod || 'Cash'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notes Section */}
        {income.notes ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && { color: '#ffffff' }]}>
              Notes & Details
            </Text>
            <View
              style={[styles.detailCard, isDark ? styles.detailCardDark : styles.detailCardLight]}
            >
              <View style={styles.detailRow}>
                <View
                  style={[styles.detailIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}
                >
                  <Ionicons name="document-text-outline" size={20} color="#3B82F6" />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={[styles.notesText, isDark && { color: 'rgba(255, 255, 255, 0.9)' }]}>
                    {income.notes}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : null}

        {/* Audit Info Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && { color: '#ffffff' }]}>Record Info</Text>
          <View
            style={[styles.detailCard, isDark ? styles.detailCardDark : styles.detailCardLight]}
          >
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, isDark && { color: 'rgba(255, 255, 255, 0.5)' }]}>
                Created
              </Text>
              <Text style={[styles.infoValue, isDark && { color: 'rgba(255, 255, 255, 0.8)' }]}>
                {new Date(income.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Edit Income Modal */}
      <AddIncomeModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        editingIncome={income}
        onSuccess={() => refetch()}
        variant={variant}
      />

      <CustomAlertDialog
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        showCancel={alertConfig.showCancel}
        onCancel={alertConfig.onCancel}
        icon={alertConfig.icon}
        iconColor={alertConfig.iconColor}
      />

      {/* 3-Dot Overflow Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <View
            style={[
              styles.menuContainer,
              {
                top: insets.top + 50,
                backgroundColor: isDark ? '#101917' : '#ffffff',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f3f4',
              },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                setEditVisible(true);
              }}
            >
              <Ionicons
                name="pencil-outline"
                size={20}
                color={isDark ? '#ffffff' : COLORS.onSurface}
              />
              <Text style={[styles.menuItemText, isDark && { color: '#ffffff' }]}>
                Edit Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.menuItem,
                styles.menuItemBorder,
                isDark && { borderTopColor: 'rgba(255, 255, 255, 0.08)' },
              ]}
              onPress={() => {
                setMenuVisible(false);
                handleDelete();
              }}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
              <Text style={[styles.menuItemText, { color: COLORS.error }]}>Delete Income</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },
  heroCardLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  heroCardDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroIconBg: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#191c1d',
    marginBottom: 6,
  },
  heroAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  methodBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  methodBadgeLargeDark: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  methodBadgeLargeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  heroMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  metaBadgeDark: {
    backgroundColor: '#131D1A',
  },
  metaBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#191c1d',
    marginBottom: 10,
  },
  detailCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  detailCardLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  detailCardDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#191c1d',
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menuContainer: {
    position: 'absolute',
    right: 16,
    borderRadius: 16,
    padding: 6,
    minWidth: 160,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 10,
  },
  menuItemBorder: {
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  menuItemText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
});
