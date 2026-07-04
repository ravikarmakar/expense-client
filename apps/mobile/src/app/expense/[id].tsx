import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, CURRENCY_SYMBOL, CATEGORY_ICONS } from '../../constants/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useExpense, useDeleteExpense, useMe } from '@workspace/api';
import { TopAppBar } from '../../components/TopAppBar';
import { LoadingView } from '../../components/LoadingView';
import { ErrorView } from '../../components/ErrorView';
import { EditExpenseModal } from '../../components/EditExpenseModal';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams();
  const { data: expense, isLoading, isError, refetch } = useExpense(id as string);
  const insets = useSafeAreaInsets();

  const [editVisible, setEditVisible] = useState(false);
  const { data: user } = useMe();
  const deleteExpense = useDeleteExpense();

  const isPersonal = expense?.groupId === null;
  const isCreator = expense?.userId === user?.id;
  const canModify = isPersonal && isCreator;

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (expense) {
              deleteExpense.mutate(expense.id, {
                onSuccess: () => {
                  Alert.alert('Success', 'Expense deleted successfully');
                  router.back();
                },
                onError: (err) => {
                  Alert.alert('Error', err.message || 'Failed to delete expense');
                },
              });
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <LoadingView />;
  }

  if (isError || !expense) {
    return <ErrorView message="Failed to load expense details" onRetry={refetch} />;
  }

  const cfg = CATEGORY_ICONS[expense.category] ?? CATEGORY_ICONS.Other;
  const dateStr = new Date(expense.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const createdDate = new Date(expense.createdAt);
  let hours = createdDate.getHours();
  const minutes = createdDate.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursStr = hours.toString().padStart(2, '0');
  const timeStr = `${hoursStr}:${minutes} ${ampm}`;

  return (
    <View style={styles.container}>
      <TopAppBar title="Transaction Details" showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={[globalStyles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroCard}>
          <View style={[styles.heroIconBg, { backgroundColor: cfg.bg }]}>
            {cfg.lib === 'Ionicons' ? (
              <Ionicons name={cfg.icon as never} size={36} color={cfg.color} />
            ) : (
              <MaterialIcons name={cfg.icon as never} size={36} color={cfg.color} />
            )}
          </View>
          <Text style={styles.heroTitle}>{expense.title}</Text>
          <Text style={styles.heroAmount}>
            {CURRENCY_SYMBOL}
            {expense.amount.toFixed(2)}
          </Text>

          {expense.isWalletPayment && (
            <View style={styles.walletBadgeLarge}>
              <Ionicons name="wallet" size={14} color={COLORS.onPrimaryFixedVariant} />
              <Text style={styles.walletBadgeLargeText}>Paid via Group Wallet</Text>
            </View>
          )}

          <View style={styles.heroMeta}>
            <View style={styles.metaBadge}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.onSurfaceVariant} />
              <Text style={styles.metaBadgeText}>{dateStr}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Ionicons name="time-outline" size={14} color={COLORS.onSurfaceVariant} />
              <Text style={styles.metaBadgeText}>{timeStr}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Ionicons name="pricetag-outline" size={14} color={COLORS.onSurfaceVariant} />
              <Text style={styles.metaBadgeText}>{expense.category}</Text>
            </View>
            {expense.groupId ? (
              <View style={styles.metaBadge}>
                <Ionicons name="people-outline" size={14} color={COLORS.onSurfaceVariant} />
                <Text style={styles.metaBadgeText}>
                  {expense.group ? `${expense.group.emoji} ${expense.group.name}` : 'Group Expense'}
                </Text>
              </View>
            ) : (
              <View style={styles.metaBadge}>
                <Ionicons name="person-outline" size={14} color={COLORS.onSurfaceVariant} />
                <Text style={styles.metaBadgeText}>Personal Expense</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons (Only for Personal & Creator) */}
        {canModify && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.editBtn]}
              onPress={() => setEditVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="pencil" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.editBtnText}>Edit Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={handleDelete}
              disabled={deleteExpense.isPending}
              activeOpacity={0.8}
            >
              <Ionicons name="trash" size={18} color={COLORS.error} style={{ marginRight: 6 }} />
              <Text style={styles.deleteBtnText}>
                {deleteExpense.isPending ? 'Deleting...' : 'Delete Expense'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Paid By Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paid By</Text>
          <View style={styles.paidByCard}>
            <Image
              source={{
                uri:
                  expense.paidBy.image ||
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuD5T5AJUovvhA_WnRPgEHHUebHGXF5_1EiHG95y-QfKq2nOO07Mu6O3nzSp4AjHOG8hjAGd0Le9T3VMsQ554EcRvn-FBqlSpjy3oLYsJUgXfzsRNskrMk9B58aBpvnyrr9dunlwrQ3t-uLtHtQ5AeVKOCn-64fTFblLeVHlXrsHWRLrpvOIYhhnMeriv4c4aLSPUpLcih10KZ6yXzN32ixRZd3TUiAozHsESLzxhXawBgffwZTpUF4UXguT6m8ijF1N9kQL0fwVx9xM',
              }}
              style={styles.paidByAvatar}
            />
            <View style={styles.paidByInfo}>
              <Text style={styles.paidByName}>{expense.paidBy.name}</Text>
              <Text style={styles.paidBySub}>
                {CURRENCY_SYMBOL}
                {expense.amount.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes Section */}
        {expense.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Ionicons name="document-text-outline" size={20} color={COLORS.outline} />
              <Text style={styles.notesText}>{expense.notes}</Text>
            </View>
          </View>
        )}

        {/* Split Details Section */}
        {expense.splits && expense.splits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Split Details</Text>
            <View style={styles.splitsCard}>
              {expense.splits.map((split, index) => (
                <View key={split.userId}>
                  <View style={styles.splitRow}>
                    <Image
                      source={{
                        uri:
                          split.image ||
                          'https://lh3.googleusercontent.com/aida-public/AB6AXuD5T5AJUovvhA_WnRPgEHHUebHGXF5_1EiHG95y-QfKq2nOO07Mu6O3nzSp4AjHOG8hjAGd0Le9T3VMsQ554EcRvn-FBqlSpjy3oLYsJUgXfzsRNskrMk9B58aBpvnyrr9dunlwrQ3t-uLtHtQ5AeVKOCn-64fTFblLeVHlXrsHWRLrpvOIYhhnMeriv4c4aLSPUpLcih10KZ6yXzN32ixRZd3TUiAozHsESLzxhXawBgffwZTpUF4UXguT6m8ijF1N9kQL0fwVx9xM',
                      }}
                      style={styles.splitAvatar}
                    />
                    <View style={styles.splitInfo}>
                      <Text style={styles.splitName}>{split.name}</Text>
                      {split.paid ? (
                        <View style={styles.statusBadgeSettled}>
                          <Text style={styles.statusBadgeSettledText}>Settled</Text>
                        </View>
                      ) : (
                        <View style={styles.statusBadgePending}>
                          <Text style={styles.statusBadgePendingText}>Pending</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.splitAmount}>
                      {CURRENCY_SYMBOL}
                      {split.amount.toFixed(2)}
                    </Text>
                  </View>
                  {index < expense.splits.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {expense && (
        <EditExpenseModal
          visible={editVisible}
          onClose={() => setEditVisible(false)}
          expense={expense}
          onSuccess={() => refetch()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  heroCard: {
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  heroIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.onSurface,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginBottom: 16,
  },
  walletBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryFixed,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    marginBottom: 16,
  },
  walletBadgeLargeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onPrimaryFixedVariant,
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
    backgroundColor: COLORS.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  metaBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  paidByCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  paidByAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceContainerHigh,
    marginRight: 16,
  },
  paidByInfo: {
    flex: 1,
  },
  paidByName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  paidBySub: {
    fontSize: 14,
    color: COLORS.outline,
    fontWeight: '500',
  },
  notesCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    gap: 12,
  },
  notesText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.onSurfaceVariant,
    lineHeight: 22,
  },
  splitsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    overflow: 'hidden',
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  splitAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerHigh,
    marginRight: 12,
  },
  splitInfo: {
    flex: 1,
  },
  splitName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  statusBadgeSettled: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusBadgeSettledText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2e7d32',
  },
  statusBadgePending: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.errorContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusBadgePendingText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.onErrorContainer,
  },
  splitAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainer,
    marginLeft: 68,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  editBtn: {
    borderColor: COLORS.primaryFixed,
    backgroundColor: 'transparent',
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  deleteBtn: {
    borderColor: COLORS.errorContainer,
    backgroundColor: 'transparent',
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.error,
  },
});
