import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  Pressable,
  Dimensions,
  GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useIncomes, useDeleteIncome, useDashboard, type Income } from '@workspace/api';
import { COLORS, CURRENCY_SYMBOL } from '../constants/theme';
import { TopAppBar } from '../components/TopAppBar';
import { AddIncomeModal } from '../components/AddIncomeModal';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { useTheme } from '../context/ThemeContext';
import { AppBackground } from '../components/AppBackground';
import { hapticFeedback } from '../utils/haptics';

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

function formatFullDateTime(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const dateFormatted = d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    return `${dateFormatted}, ${timeStr}`;
  } catch {
    return dateStr;
  }
}

export default function IncomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const variant = isDark ? 'dark' : 'light';

  const { data: dashboardData } = useDashboard();
  const totalMonthlyIncome = dashboardData?.stats?.totalIncome ?? 0;

  const { data, isLoading, isRefetching, refetch } = useIncomes();
  const deleteIncome = useDeleteIncome();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [actionMenuIncome, setActionMenuIncome] = useState<Income | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 16 });

  const handleMenuPress = (event: GestureResponderEvent, item: Income) => {
    hapticFeedback.selection();
    const pageY = event.nativeEvent.pageY;
    // Position menu above or below tap location to prevent clipping at screen edges
    const estimatedMenuHeight = 90;
    const topPos =
      pageY + estimatedMenuHeight > Dimensions.get('window').height - 100
        ? pageY - estimatedMenuHeight - 10
        : pageY + 10;
    setMenuPosition({
      top: topPos,
      right: 20,
    });
    setActionMenuIncome(item);
  };

  const handleDelete = (id: string, source: string, amount: number) => {
    hapticFeedback.mediumImpact();
    Alert.alert(
      'Delete Income',
      `Are you sure you want to delete this ${source} entry (+${CURRENCY_SYMBOL}${amount.toFixed(2)})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteIncome.mutate(id, {
              onSuccess: () => {
                hapticFeedback.success();
                refetch();
              },
              onError: (err) => {
                Alert.alert('Error', err.message || 'Failed to delete income.');
              },
            });
          },
        },
      ]
    );
  };

  const incomes = data?.incomes ?? [];

  return (
    <AppBackground style={styles.container}>
      <TopAppBar title="Income History" showBack onBack={() => router.back()} variant={variant} />

      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#10B981" />
        }
      >
        {/* Total Monthly Income Hero Banner */}
        <View style={[styles.heroBanner, isDark ? styles.heroBannerDark : styles.heroBannerLight]}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroTitleRow}>
              <View style={styles.emeraldBadge}>
                <Ionicons name="arrow-down-circle" size={18} color="#10B981" />
              </View>
              <Text style={[styles.heroLabel, isDark && { color: 'rgba(255, 255, 255, 0.7)' }]}>
                THIS MONTH{"'"}S INCOME
              </Text>
            </View>
          </View>
          <Text style={[styles.heroAmount, isDark && { color: '#ffffff' }]}>
            +{CURRENCY_SYMBOL}
            {totalMonthlyIncome.toFixed(2)}
          </Text>
        </View>

        {/* Income List Section (Full-Width Rows like ExpenseItem) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && { color: '#ffffff' }]}>
              All Income Records ({incomes.length})
            </Text>
          </View>

          {isLoading ? (
            <View>
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={[styles.incomeRow, isDark ? styles.incomeRowDark : styles.incomeRowLight]}
                >
                  <SkeletonLoader
                    width={48}
                    height={48}
                    borderRadius={24}
                    style={{ marginRight: 14 }}
                  />
                  <View style={{ flex: 1, gap: 6 }}>
                    <SkeletonLoader width={100} height={12} borderRadius={4} />
                    <SkeletonLoader width={140} height={15} borderRadius={4} />
                    <SkeletonLoader width={110} height={12} borderRadius={4} />
                  </View>
                  <SkeletonLoader width={75} height={18} borderRadius={4} />
                </View>
              ))}
            </View>
          ) : incomes.length > 0 ? (
            <View>
              {incomes.map((item) => {
                const visual = getSourceVisual(item.source);
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.incomeRow,
                      isDark ? styles.incomeRowDark : styles.incomeRowLight,
                    ]}
                  >
                    {/* Avatar Icon */}
                    <View style={[styles.avatarCircle, { backgroundColor: visual.bg }]}>
                      <Ionicons name={visual.icon as never} size={22} color={visual.color} />
                    </View>

                    {/* Middle Info */}
                    <View style={styles.middleSection}>
                      <Text
                        style={[
                          styles.sourceSubtitle,
                          isDark && { color: 'rgba(255, 255, 255, 0.45)' },
                        ]}
                        numberOfLines={1}
                      >
                        Income • {item.source}
                        {item.paymentMethod ? ` • ${item.paymentMethod}` : ''}
                      </Text>
                      <Text
                        style={[styles.titleText, isDark && { color: '#ffffff' }]}
                        numberOfLines={1}
                      >
                        {item.notes ? item.notes : item.source}
                      </Text>
                      <Text
                        style={[styles.dateText, isDark && { color: 'rgba(255, 255, 255, 0.4)' }]}
                      >
                        {formatFullDateTime(item.date || item.createdAt)}
                      </Text>
                    </View>

                    {/* Right Amount & 3-Dots Menu */}
                    <View style={styles.rightSection}>
                      <Text style={styles.amountText}>
                        +{CURRENCY_SYMBOL}
                        {item.amount.toFixed(2)}
                      </Text>
                      <TouchableOpacity
                        onPress={(e) => handleMenuPress(e, item)}
                        style={styles.menuBtn}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="ellipsis-vertical"
                          size={18}
                          color={isDark ? 'rgba(255, 255, 255, 0.6)' : '#6B7280'}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={[styles.emptyCard, isDark && styles.emptyCardDark]}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="cash-outline" size={32} color="#10B981" />
              </View>
              <Text style={[styles.emptyTitle, isDark && { color: '#ffffff' }]}>
                No Income Recorded
              </Text>
              <Text style={[styles.emptySub, isDark && { color: 'rgba(255, 255, 255, 0.55)' }]}>
                Track your salary, family allowance, freelance, and bonuses here.
              </Text>
              <TouchableOpacity
                style={styles.emptyAddBtn}
                onPress={() => {
                  hapticFeedback.selection();
                  setAddModalVisible(true);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={18} color="#ffffff" />
                <Text style={styles.emptyAddBtnText}>Add Your First Income</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <AddIncomeModal
        visible={addModalVisible}
        onClose={() => {
          setAddModalVisible(false);
          setEditingIncome(null);
        }}
        onSuccess={refetch}
        variant={variant}
        editingIncome={editingIncome}
      />

      {/* 3-Dot Dropdown Overflow Menu Overlay (Matches Expense Detail page) */}
      <Modal
        visible={Boolean(actionMenuIncome)}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActionMenuIncome(null)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setActionMenuIncome(null)}>
          <View
            style={[
              styles.menuContainer,
              {
                top: menuPosition.top,
                right: menuPosition.right,
                backgroundColor: isDark ? '#101917' : '#ffffff',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f3f4',
              },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                const target = actionMenuIncome;
                setActionMenuIncome(null);
                if (target) {
                  setEditingIncome(target);
                  setAddModalVisible(true);
                }
              }}
            >
              <Ionicons
                name="pencil-outline"
                size={18}
                color={isDark ? '#ffffff' : COLORS.onSurface}
              />
              <Text style={[styles.menuItemText, isDark && { color: '#ffffff' }]}>Edit Income</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.menuItem,
                styles.menuItemBorder,
                isDark && { borderTopColor: 'rgba(255, 255, 255, 0.08)' },
              ]}
              onPress={() => {
                const target = actionMenuIncome;
                setActionMenuIncome(null);
                if (target) {
                  handleDelete(target.id, target.source, target.amount);
                }
              }}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.error} />
              <Text style={[styles.menuItemText, { color: COLORS.error }]}>Delete Income</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Floating Action Button (Larger Icon-Only Circular FAB) */}
      <TouchableOpacity
        style={[styles.fab, { bottom: Math.max(36, insets.bottom + 28) }]}
        onPress={() => {
          hapticFeedback.selection();
          setAddModalVisible(true);
        }}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={32} color="#ffffff" />
      </TouchableOpacity>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 0,
    paddingTop: 12,
    gap: 20,
  },
  heroBanner: {
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  heroBannerLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  heroBannerDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emeraldBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.outline,
    letterSpacing: 1,
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: -0.5,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#191c1d',
  },
  incomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  incomeRowLight: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#f1f3f4',
  },
  incomeRowDark: {
    backgroundColor: 'transparent',
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  sourceSubtitle: {
    fontSize: 11.5,
    color: '#70757a',
    marginBottom: 2,
    fontWeight: '400',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#202124',
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  dateText: {
    fontSize: 11.5,
    color: '#70757a',
    fontWeight: '400',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#137333',
  },
  menuBtn: {
    padding: 6,
    marginLeft: 4,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menuContainer: {
    position: 'absolute',
    borderRadius: 16,
    padding: 6,
    minWidth: 150,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
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
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 28,
    alignItems: 'center',
    gap: 8,
  },
  emptyCardDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emptyIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#191c1d',
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.outline,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 8,
  },
  emptyAddBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 99,
  },
});
