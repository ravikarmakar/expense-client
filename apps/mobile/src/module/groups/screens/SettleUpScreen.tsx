import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TopAppBar } from '../../../components/TopAppBar';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';
import { useSettleUpScreenController } from '@workspace/api';
import { useRouteParams, settleUpParamsSchema } from '../../../hooks/useRouteParams';
import { SettleUpSkeleton } from '../components/SettleUpSkeleton';
import { SettleUpItem } from '../components/SettleUpItem';
import { useReminderCooldown } from '../../../hooks/useReminderCooldown';
import { useTheme } from '../../../context/ThemeContext';
import { BottomSheetModal } from '../../../components/BottomSheetModal';
import { LoadingButton } from '../../../components/LoadingButton';

export default function SettleUpScreen() {
  const router = useRouter();
  const searchParams = useRouteParams(settleUpParamsSchema);
  const { isDark } = useTheme();

  const {
    flattenedDebts,
    totalOwedToMe,
    totalIOwe,
    netBalance,
    isLoading,
    activeTab,
    setActiveTab,
    settleModalVisible,
    setSettleModalVisible,
    settleUserName,
    settleGroupName,
    settleGroupEmoji,
    settleBalance,
    settleAmount,
    setSettleAmount,
    settleDirection,
    handleSettlePress,
    submitSettleUp,
    isConfirmDisabled,
    isSettling,
  } = useSettleUpScreenController({
    initialTab: searchParams.type,
    onSettleSuccess: () => {
      Alert.alert('Done! 🎉', 'Settlement recorded successfully.');
    },
    onSettleError: (err) => {
      Alert.alert('Error', err);
    },
  });

  const { cooldowns, triggerCooldown } = useReminderCooldown();

  const showSkeleton = isLoading;

  return (
    <View style={[styles.container, isDark && { backgroundColor: '#0B1512' }]}>
      <TopAppBar
        title="Settle Up"
        showBack={true}
        onBack={() => router.back()}
        titleStyle={{ fontSize: 24, fontWeight: '800' }}
        variant={isDark ? 'dark' : 'light'}
      />

      {/* Settle Up Overview Dashboard Card */}
      <View
        style={[
          styles.dashboardCard,
          !isDark && {
            backgroundColor: '#006948',
            borderColor: 'transparent',
            shadowColor: '#006948',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.22,
            shadowRadius: 14,
            elevation: 6,
          },
          isDark && {
            backgroundColor: '#0D1A16',
            borderColor: '#1E2F2B',
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.cardSubTitle,
                !isDark && { color: 'rgba(255, 255, 255, 0.72)' },
                isDark && { color: '#74817B' },
              ]}
            >
              NET SETTLEMENT BALANCE
            </Text>
            <Text
              style={[
                styles.cardNetBalanceAmount,
                {
                  color:
                    netBalance > 0
                      ? isDark
                        ? '#34D399'
                        : '#85f8c4'
                      : netBalance < 0
                        ? isDark
                          ? '#F87171'
                          : '#ffb4ab'
                        : '#ffffff',
                },
              ]}
            >
              {netBalance > 0 ? '+' : ''}
              {CURRENCY_SYMBOL}
              {netBalance.toFixed(2)}
            </Text>
          </View>
          <View
            style={[
              styles.badgeIconBg,
              {
                backgroundColor:
                  netBalance > 0
                    ? isDark
                      ? 'rgba(52, 211, 153, 0.16)'
                      : 'rgba(133, 248, 196, 0.2)'
                    : netBalance < 0
                      ? isDark
                        ? 'rgba(248, 113, 113, 0.16)'
                        : 'rgba(255, 180, 171, 0.2)'
                      : isDark
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(255, 255, 255, 0.18)',
              },
            ]}
          >
            <Ionicons
              name={
                netBalance > 0 ? 'trending-up' : netBalance < 0 ? 'trending-down' : 'scale-outline'
              }
              size={24}
              color={
                netBalance > 0
                  ? isDark
                    ? '#34D399'
                    : '#85f8c4'
                  : netBalance < 0
                    ? isDark
                      ? '#F87171'
                      : '#ffb4ab'
                    : '#ffffff'
              }
            />
          </View>
        </View>

        <View
          style={[
            styles.cardDivider,
            !isDark && { backgroundColor: 'rgba(255, 255, 255, 0.14)' },
            isDark && { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
          ]}
        />

        {/* Owes & Owed Summary Stat Sub-Cards */}
        <View style={styles.cardStatsRow}>
          {/* Who Owes You */}
          <TouchableOpacity
            style={[
              styles.statCardBlock,
              !isDark && {
                backgroundColor: 'rgba(0, 0, 0, 0.16)',
                borderColor:
                  activeTab === 'owed' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)',
              },
              isDark && {
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderColor:
                  activeTab === 'owed' ? 'rgba(52, 211, 153, 0.4)' : 'rgba(255, 255, 255, 0.06)',
              },
            ]}
            onPress={() => setActiveTab('owed')}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.statIconBg,
                {
                  backgroundColor: isDark ? 'rgba(52, 211, 153, 0.16)' : 'rgba(133, 248, 196, 0.2)',
                },
              ]}
            >
              <Ionicons name="arrow-down" size={14} color={isDark ? '#34D399' : '#85f8c4'} />
            </View>
            <View style={styles.statCardTextCol}>
              <View style={styles.statLabelRow}>
                <Text
                  style={[
                    styles.statCardLabel,
                    !isDark && { color: 'rgba(255, 255, 255, 0.75)' },
                    isDark && { color: '#74817B' },
                  ]}
                >
                  Owed to you
                </Text>
                {activeTab === 'owed' && <View style={styles.activeWhiteDot} />}
              </View>
              <Text style={[styles.statCardValue, { color: isDark ? '#34D399' : '#85f8c4' }]}>
                {CURRENCY_SYMBOL}
                {totalOwedToMe.toFixed(2)}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Who You Owe */}
          <TouchableOpacity
            style={[
              styles.statCardBlock,
              !isDark && {
                backgroundColor: 'rgba(0, 0, 0, 0.16)',
                borderColor:
                  activeTab === 'owe' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)',
              },
              isDark && {
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderColor:
                  activeTab === 'owe' ? 'rgba(248, 113, 113, 0.4)' : 'rgba(255, 255, 255, 0.06)',
              },
            ]}
            onPress={() => setActiveTab('owe')}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.statIconBg,
                {
                  backgroundColor: isDark
                    ? 'rgba(248, 113, 113, 0.16)'
                    : 'rgba(255, 180, 171, 0.2)',
                },
              ]}
            >
              <Ionicons name="arrow-up" size={14} color={isDark ? '#F87171' : '#ffb4ab'} />
            </View>
            <View style={styles.statCardTextCol}>
              <View style={styles.statLabelRow}>
                <Text
                  style={[
                    styles.statCardLabel,
                    !isDark && { color: 'rgba(255, 255, 255, 0.75)' },
                    isDark && { color: '#74817B' },
                  ]}
                >
                  You owe
                </Text>
                {activeTab === 'owe' && <View style={styles.activeWhiteDot} />}
              </View>
              <Text style={[styles.statCardValue, { color: isDark ? '#F87171' : '#ffb4ab' }]}>
                {CURRENCY_SYMBOL}
                {totalIOwe.toFixed(2)}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {showSkeleton ? (
        <SettleUpSkeleton />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Active Tab Section Header */}
          <View style={styles.listHeaderRow}>
            <Text style={[styles.listSectionTitle, isDark && { color: '#ffffff' }]}>
              {activeTab === 'owed' ? 'Who Owes You' : 'Who You Owe'}
            </Text>
          </View>
          {flattenedDebts.length === 0 && (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="sparkles" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>{"You're All Clear!"}</Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'owed'
                  ? 'Excellent! No one currently owes you money.'
                  : 'Great! You have no outstanding bills to settle.'}
              </Text>
            </View>
          )}

          {flattenedDebts.map((item, index) => {
            const key = `${item.userId}-${item.groupId}`;
            const isCooldown = !!cooldowns[key];
            return (
              <SettleUpItem
                key={`${item.userId}-${item.groupId}-${index}`}
                userId={item.userId}
                name={item.name}
                email={item.email}
                image={item.image}
                groupId={item.groupId}
                groupName={item.groupName}
                groupEmoji={item.groupEmoji}
                balance={item.balance}
                activeTab={activeTab}
                onSettlePress={handleSettlePress}
                isCooldown={isCooldown}
                onReminderSent={() => triggerCooldown(item.userId, item.groupId)}
              />
            );
          })}
        </ScrollView>
      )}

      {/* ── Reusable Bottom Sheet Modal: Settle Up ── */}
      <BottomSheetModal
        visible={settleModalVisible}
        onClose={() => setSettleModalVisible(false)}
        title="Settle Up"
        subtitle={
          settleDirection === 'owed'
            ? `Record payment from ${settleUserName}`
            : `Record payment to ${settleUserName}`
        }
        variant={isDark ? 'dark' : 'light'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
        >
          <View style={styles.modalBody}>
            {/* Group & User Context */}
            <View
              style={[
                styles.modalContextRow,
                isDark && {
                  backgroundColor: '#101917',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                },
              ]}
            >
              <View
                style={[
                  styles.modalContextIcon,
                  isDark && { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                ]}
              >
                <Text style={styles.modalContextEmoji}>{settleGroupEmoji}</Text>
              </View>
              <View style={styles.modalContextInfo}>
                <Text style={[styles.modalContextName, isDark && { color: '#ffffff' }]}>
                  {settleUserName}
                </Text>
                <Text style={[styles.modalContextGroup, isDark && { color: '#9CA3AF' }]}>
                  {settleGroupName}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.amountInputContainer,
                isDark && {
                  backgroundColor: '#101917',
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                },
              ]}
            >
              <Text style={[styles.amountCurrency, isDark && { color: '#10B981' }]}>
                {CURRENCY_SYMBOL}
              </Text>
              <TextInput
                style={[styles.amountInput, isDark && { color: '#ffffff' }]}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.4)' : COLORS.outline}
                value={settleAmount}
                onChangeText={(val) => {
                  if (/^\d{0,7}\.?\d{0,2}$/.test(val)) {
                    setSettleAmount(val);
                  }
                }}
                autoFocus={true}
                selectionColor={isDark ? '#10B981' : COLORS.primary}
              />
            </View>

            <View style={styles.balanceInfoBlock}>
              <Text style={[styles.balanceInfoLabel, isDark && { color: '#9CA3AF' }]}>
                Total Balance: {CURRENCY_SYMBOL}
                {settleBalance.toFixed(2)}
              </Text>
              {(() => {
                const inputVal = parseFloat(settleAmount) || 0;
                const remaining = Math.max(0, settleBalance - inputVal);
                return (
                  <Text style={[styles.balanceInfoRemaining, isDark && { color: '#34D399' }]}>
                    Remaining Balance: {CURRENCY_SYMBOL}
                    {remaining.toFixed(2)}
                  </Text>
                );
              })()}
            </View>

            <View style={styles.modalActionButtons}>
              <View style={{ flex: 1 }}>
                <LoadingButton
                  variant="outline"
                  title="Cancel"
                  onPress={() => setSettleModalVisible(false)}
                  disabled={isSettling}
                />
              </View>
              <View style={{ flex: 1 }}>
                <LoadingButton
                  variant="primary"
                  title="Confirm"
                  onPress={submitSettleUp}
                  loading={isSettling}
                  disabled={isConfirmDisabled}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#f8f9fa',
  },
  dashboardCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 18,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardSubTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  cardNetBalanceAmount: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: -0.6,
  },
  badgeIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    marginVertical: 14,
  },
  cardStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCardBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  statIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statCardTextCol: {
    flex: 1,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  activeWhiteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
    marginLeft: 6,
  },
  statCardValue: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: -0.2,
  },
  listHeaderRow: {
    marginBottom: 12,
    marginTop: 4,
  },
  listSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface || '#191c1d',
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  emptyTitle: {
    color: COLORS.onSurface || '#191c1d',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: COLORS.onSurfaceVariant || '#3d4a42',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },

  // ── Modal Styles ──
  modalBody: {
    gap: 16,
  },
  modalContextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  modalContextIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalContextEmoji: {
    fontSize: 18,
  },
  modalContextInfo: {
    flex: 1,
  },
  modalContextName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  modalContextGroup: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.outline,
    marginTop: 1,
  },
  modalSub: {
    fontSize: 13,
    color: COLORS.outline,
    lineHeight: 18,
    fontWeight: '500',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainer,
    paddingHorizontal: 16,
    height: 56,
  },
  amountCurrency: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
    padding: 0,
  },
  balanceInfoBlock: {
    alignItems: 'center',
  },
  balanceInfoLabel: {
    fontSize: 13,
    color: COLORS.outline,
    fontWeight: '600',
  },
  balanceInfoRemaining: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 4,
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
});
