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
import { ModalContainer } from '../../../components/ModalContainer';
import { LoadingButton } from '../../../components/LoadingButton';

export default function SettleUpScreen() {
  const router = useRouter();
  const searchParams = useRouteParams(settleUpParamsSchema);

  const {
    flattenedDebts,
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
    <View style={styles.container}>
      <TopAppBar title="Settle Up" showBack={true} onBack={() => router.back()} />

      {/* Segment Tab Selectors */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'owed' && styles.tabButtonActive]}
          onPress={() => setActiveTab('owed')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-down"
            size={16}
            color={activeTab === 'owed' ? '#ffffff' : COLORS.onSurfaceVariant}
          />
          <Text style={[styles.tabButtonText, activeTab === 'owed' && styles.tabButtonTextActive]}>
            Who Owes You
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'owe' && styles.tabButtonActive]}
          onPress={() => setActiveTab('owe')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-up"
            size={16}
            color={activeTab === 'owe' ? '#ffffff' : COLORS.onSurfaceVariant}
          />
          <Text style={[styles.tabButtonText, activeTab === 'owe' && styles.tabButtonTextActive]}>
            Who You Owe
          </Text>
        </TouchableOpacity>
      </View>

      {showSkeleton ? (
        <SettleUpSkeleton />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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

      {/* ── Modal: Settle Up ── */}
      <ModalContainer
        visible={settleModalVisible}
        onClose={() => setSettleModalVisible(false)}
        title="Settle Up"
        loading={isSettling}
      >
        <View style={styles.modalBody}>
          {/* Group & User Context */}
          <View style={styles.modalContextRow}>
            <View style={styles.modalContextIcon}>
              <Text style={styles.modalContextEmoji}>{settleGroupEmoji}</Text>
            </View>
            <View style={styles.modalContextInfo}>
              <Text style={styles.modalContextName}>{settleUserName}</Text>
              <Text style={styles.modalContextGroup}>{settleGroupName}</Text>
            </View>
          </View>

          <Text style={styles.modalSub}>
            {settleDirection === 'owed'
              ? `Record the amount ${settleUserName} paid you:`
              : `Record the amount you paid ${settleUserName}:`}
          </Text>

          <View style={styles.amountInputContainer}>
            <Text style={styles.amountCurrency}>{CURRENCY_SYMBOL}</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={COLORS.outline}
              value={settleAmount}
              onChangeText={(val) => {
                if (/^\d{0,7}\.?\d{0,2}$/.test(val)) {
                  setSettleAmount(val);
                }
              }}
              autoFocus={true}
            />
          </View>

          <View style={styles.balanceInfoBlock}>
            <Text style={styles.balanceInfoLabel}>
              Total Balance: {CURRENCY_SYMBOL}
              {settleBalance.toFixed(2)}
            </Text>
            {(() => {
              const inputVal = parseFloat(settleAmount) || 0;
              const remaining = Math.max(0, settleBalance - inputVal);
              return (
                <Text style={styles.balanceInfoRemaining}>
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
      </ModalContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#f8f9fa',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary || '#006948',
  },
  tabButtonText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant || '#3d4a42',
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#ffffff',
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
