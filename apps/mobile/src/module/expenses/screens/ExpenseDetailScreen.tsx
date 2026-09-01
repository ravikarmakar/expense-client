import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Modal, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';
import { globalStyles } from '../../../styles/globalStyles';
import { useExpense, useDeleteExpense, useMe, useCategories } from '@workspace/api';
import { TopAppBar } from '../../../components/TopAppBar';
import { ErrorView } from '../../../components/ErrorView';
import { EditExpenseModal } from '../../../components/EditExpenseModal';
import { useRouteParams, idParamSchema } from '../../../hooks/useRouteParams';
import { ExpenseDetailSkeleton } from '../components/ExpenseDetailSkeleton';
import { detailStyles as styles } from '../styles/expense.styles';
import { CustomAlertDialog } from '../../../components/CustomAlertDialog';
import { useTheme } from '../../../context/ThemeContext';
import { AppBackground } from '../../../components/AppBackground';

import { getCategoryVisuals } from '../../../constants/categories';
import { hapticFeedback } from '../../../utils/haptics';

export default function ExpenseDetailScreen() {
  const { id } = useRouteParams(idParamSchema);
  const { data: expense, isLoading, isError, refetch } = useExpense(id);
  const { data: categoriesData } = useCategories();
  const customCategories = categoriesData?.custom || [];
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

  const { data: user } = useMe();
  const deleteExpense = useDeleteExpense();

  const isPersonal = expense?.groupId === null;
  const isCreator = expense?.userId === user?.id;
  const canModify = isPersonal && isCreator;

  const handleDelete = () => {
    setAlertConfig({
      visible: true,
      title: 'Delete Expense',
      message: 'Are you sure you want to delete this expense? This action cannot be undone.',
      showCancel: true,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      icon: 'trash',
      iconColor: COLORS.error,
      onConfirm: () => {
        setAlertConfig((prev) => ({ ...prev, visible: false }));
        if (expense) {
          deleteExpense.mutate(expense.id, {
            onSuccess: () => {
              hapticFeedback.success();
              router.back();
            },
            onError: (err) => {
              setAlertConfig({
                visible: true,
                title: 'Error',
                message: err.message || 'Failed to delete expense',
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
    return <ExpenseDetailSkeleton />;
  }

  if (isError || !expense) {
    return <ErrorView message="Failed to load expense details" onRetry={refetch} />;
  }

  const visuals = getCategoryVisuals(expense.category, customCategories);
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
    <AppBackground style={styles.container}>
      <TopAppBar
        title="Expense Details"
        showBack
        onBack={() => router.back()}
        variant={variant}
        rightActionIcon={canModify ? 'ellipsis-vertical' : undefined}
        onRightActionPress={canModify ? () => setMenuVisible(true) : undefined}
      />

      <ScrollView
        contentContainerStyle={[globalStyles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View
          style={[
            styles.heroCard,
            isDark && { backgroundColor: '#101917', borderColor: 'rgba(255, 255, 255, 0.08)' },
          ]}
        >
          <View
            style={[
              styles.heroIconBg,
              { backgroundColor: isDark ? `${visuals.color}25` : visuals.bg },
            ]}
          >
            {visuals.lib === 'Ionicons' ? (
              <Ionicons name={visuals.icon as never} size={36} color={visuals.color} />
            ) : (
              <MaterialIcons name={visuals.icon as never} size={36} color={visuals.color} />
            )}
          </View>
          <Text style={[styles.heroTitle, isDark && { color: '#F9FAFB' }]}>{expense.title}</Text>
          <Text style={[styles.heroAmount, isDark && { color: '#F9FAFB' }]}>
            {CURRENCY_SYMBOL}
            {expense.amount.toFixed(2)}
          </Text>

          {expense.isWalletPayment && (
            <View
              style={[
                styles.walletBadgeLarge,
                isDark && { backgroundColor: 'rgba(52, 211, 153, 0.15)' },
              ]}
            >
              <Ionicons
                name="wallet"
                size={14}
                color={isDark ? '#34D399' : COLORS.onPrimaryFixedVariant}
              />
              <Text style={[styles.walletBadgeLargeText, isDark && { color: '#34D399' }]}>
                Paid via Group Wallet
                {expense.walletAmount !== undefined && expense.walletAmount !== null
                  ? ` (${CURRENCY_SYMBOL}${expense.walletAmount.toFixed(2)})`
                  : ''}
              </Text>
            </View>
          )}

          <View style={styles.heroMeta}>
            {/* Date Badge */}
            <View
              style={[
                styles.metaBadge,
                { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe' },
              ]}
            >
              <Ionicons name="calendar-outline" size={14} color={isDark ? '#38BDF8' : '#0284c7'} />
              <Text
                style={[
                  styles.metaBadgeText,
                  { color: isDark ? '#38BDF8' : '#0284c7', fontWeight: '700' },
                ]}
              >
                {dateStr}
              </Text>
            </View>

            {/* Time Badge */}
            <View
              style={[
                styles.metaBadge,
                { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : '#fef3c7' },
              ]}
            >
              <Ionicons name="time-outline" size={14} color={isDark ? '#FBBF24' : '#d97706'} />
              <Text
                style={[
                  styles.metaBadgeText,
                  { color: isDark ? '#FBBF24' : '#d97706', fontWeight: '700' },
                ]}
              >
                {timeStr}
              </Text>
            </View>

            {/* Category Badge */}
            <View
              style={[
                styles.metaBadge,
                { backgroundColor: isDark ? `${visuals.color}25` : visuals.bg },
              ]}
            >
              <Ionicons name="pricetag-outline" size={14} color={visuals.color} />
              <Text style={[styles.metaBadgeText, { color: visuals.color, fontWeight: '700' }]}>
                {expense.category}
              </Text>
            </View>

            {/* Payment Method Badge */}
            <View
              style={[
                styles.metaBadge,
                { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.15)' : '#dcfce7' },
              ]}
            >
              <Ionicons name="card-outline" size={14} color={isDark ? '#34D399' : '#15803d'} />
              <Text
                style={[
                  styles.metaBadgeText,
                  { color: isDark ? '#34D399' : '#15803d', fontWeight: '700' },
                ]}
              >
                {expense.paymentMethod || 'UPI'}
              </Text>
            </View>

            {/* Expense Type Badge (Group vs Personal) */}
            {expense.groupId ? (
              <View
                style={[
                  styles.metaBadge,
                  { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.15)' : '#e6f4ea' },
                ]}
              >
                <Ionicons name="people-outline" size={14} color={isDark ? '#34D399' : '#059669'} />
                <Text
                  style={[
                    styles.metaBadgeText,
                    { color: isDark ? '#34D399' : '#059669', fontWeight: '700' },
                  ]}
                >
                  {expense.group ? `${expense.group.emoji} ${expense.group.name}` : 'Group Expense'}
                </Text>
              </View>
            ) : (
              <View
                style={[
                  styles.metaBadge,
                  { backgroundColor: isDark ? 'rgba(129, 140, 248, 0.18)' : '#e0e7ff' },
                ]}
              >
                <Ionicons name="person-outline" size={14} color={isDark ? '#818CF8' : '#4338ca'} />
                <Text
                  style={[
                    styles.metaBadgeText,
                    { color: isDark ? '#818CF8' : '#4338ca', fontWeight: '700' },
                  ]}
                >
                  Personal Expense
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Paid By Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && { color: '#F9FAFB' }]}>Paid By</Text>
          {expense.isWalletPayment ? (
            <View
              style={[
                styles.walletPaidCard,
                isDark && { backgroundColor: '#101917', borderColor: 'rgba(255, 255, 255, 0.08)' },
              ]}
            >
              {/* Row 1: Wallet contribution if there is any */}
              {(() => {
                const walletAmt = expense.walletAmount ?? 0;
                const userAmt = expense.amount - walletAmt;
                return (
                  <>
                    {(walletAmt > 0 || walletAmt === 0) && (
                      <View style={styles.walletPaidRow}>
                        <View style={styles.walletAvatarBg}>
                          <Ionicons name="wallet" size={22} color={COLORS.primary} />
                        </View>
                        <View style={styles.paidByInfo}>
                          <Text style={[styles.paidByName, isDark && { color: '#F9FAFB' }]}>
                            Group Wallet
                          </Text>
                          <Text style={[styles.paidBySub, isDark && { color: '#9CA3AF' }]}>
                            {CURRENCY_SYMBOL}
                            {(walletAmt > 0 ? walletAmt : expense.amount).toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    )}

                    {walletAmt > 0 && userAmt > 0 && (
                      <View
                        style={[
                          styles.walletPaidDivider,
                          isDark && { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                        ]}
                      />
                    )}

                    {walletAmt > 0 && userAmt > 0 && (
                      <View style={styles.walletPaidRow}>
                        <Image
                          source={{
                            uri:
                              expense.paidBy.image ||
                              'https://lh3.googleusercontent.com/aida-public/AB6AXuD5T5AJUovvhA_WnRPgEHHUebHGXF5_1EiHG95y-QfKq2nOO07Mu6O3nzSp4AjHOG8hjAGd0Le9T3VMsQ554EcRvn-FBqlSpjy3oLYsJUgXfzsRNskrMk9B58aBpvnyrr9dunlwrQ3t-uLtHtQ5AeVKOCn-64fTFblLeVHlXrsHWRLrpvOIYhhnMeriv4c4aLSPUpLcih10KZ6yXzN32ixRZd3TUiAozHsESLzxhXawBgffwZTpUF4UXguT6m8ijF1N9kQL0fwVx9xM',
                          }}
                          style={styles.paidByAvatar}
                        />
                        <View style={styles.paidByInfo}>
                          <Text style={[styles.paidByName, isDark && { color: '#F9FAFB' }]}>
                            {expense.paidBy.name}
                          </Text>
                          <Text style={[styles.paidBySub, isDark && { color: '#9CA3AF' }]}>
                            {CURRENCY_SYMBOL}
                            {userAmt.toFixed(2)} (Personal contribution)
                          </Text>
                        </View>
                      </View>
                    )}
                  </>
                );
              })()}
            </View>
          ) : (
            <View
              style={[
                styles.paidByCard,
                isDark && { backgroundColor: '#101917', borderColor: 'rgba(255, 255, 255, 0.08)' },
              ]}
            >
              <Image
                source={{
                  uri:
                    expense.paidBy.image ||
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuD5T5AJUovvhA_WnRPgEHHUebHGXF5_1EiHG95y-QfKq2nOO07Mu6O3nzSp4AjHOG8hjAGd0Le9T3VMsQ554EcRvn-FBqlSpjy3oLYsJUgXfzsRNskrMk9B58aBpvnyrr9dunlwrQ3t-uLtHtQ5AeVKOCn-64fTFblLeVHlXrsHWRLrpvOIYhhnMeriv4c4aLSPUpLcih10KZ6yXzN32ixRZd3TUiAozHsESLzxhXawBgffwZTpUF4UXguT6m8ijF1N9kQL0fwVx9xM',
                }}
                style={styles.paidByAvatar}
              />
              <View style={styles.paidByInfo}>
                <Text style={[styles.paidByName, isDark && { color: '#F9FAFB' }]}>
                  {expense.paidBy.name}
                </Text>
                <Text style={[styles.paidBySub, isDark && { color: '#9CA3AF' }]}>
                  {CURRENCY_SYMBOL}
                  {expense.amount.toFixed(2)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Notes Section */}
        {expense.notes && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && { color: '#F9FAFB' }]}>Notes</Text>
            <View
              style={[
                styles.notesCard,
                isDark && { backgroundColor: '#101917', borderColor: 'rgba(255, 255, 255, 0.08)' },
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={20}
                color={isDark ? '#9CA3AF' : COLORS.outline}
              />
              <Text style={[styles.notesText, isDark && { color: '#9CA3AF' }]}>
                {expense.notes}
              </Text>
            </View>
          </View>
        )}

        {/* Split Details Section */}
        {expense.splits && expense.splits.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && { color: '#F9FAFB' }]}>Split Details</Text>
            <View
              style={[
                styles.splitsCard,
                isDark && { backgroundColor: '#101917', borderColor: 'rgba(255, 255, 255, 0.08)' },
              ]}
            >
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
                      <Text style={[styles.splitName, isDark && { color: '#F9FAFB' }]}>
                        {split.name}
                      </Text>
                      {split.paid || (expense.isWalletPayment && split.amount === 0) ? (
                        <View style={styles.statusBadgeSettled}>
                          <Text style={styles.statusBadgeSettledText}>Settled</Text>
                        </View>
                      ) : (
                        <View style={styles.statusBadgePending}>
                          <Text style={styles.statusBadgePendingText}>Pending</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.splitAmount, isDark && { color: '#F9FAFB' }]}>
                      {CURRENCY_SYMBOL}
                      {split.amount.toFixed(2)}
                    </Text>
                  </View>
                  {index < expense.splits.length - 1 && (
                    <View
                      style={[
                        styles.divider,
                        isDark && { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                      ]}
                    />
                  )}
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
          variant={variant}
        />
      )}

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
              { top: insets.top + 50 },
              isDark && { backgroundColor: '#131D1A', borderColor: 'rgba(255, 255, 255, 0.12)' },
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
                color={isDark ? '#F9FAFB' : COLORS.onSurface}
              />
              <Text style={[styles.menuItemText, isDark && { color: '#F9FAFB' }]}>
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
              <Text style={[styles.menuItemText, { color: COLORS.error }]}>Delete Expense</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </AppBackground>
  );
}
