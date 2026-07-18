import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';
import { useGroupWalletController } from '@workspace/api';
import { ErrorView } from '../../../components/ErrorView';
import { GroupWalletSkeleton } from '../components/group/GroupWalletSkeleton';
import { EmptyState } from '../../../components/EmptyState';
import { useRouteParams, idParamSchema } from '../../../hooks/useRouteParams';
import { walletStyles as styles } from '../../groups/styles/group.styles';

// Extracted Components
import { WalletBalanceCard } from '../components/group/WalletBalanceCard';
import { ActiveTargetBanner } from '../components/group/ActiveTargetBanner';
import { YourContributionCard } from '../components/group/YourContributionCard';
import { MemberContributionsList } from '../components/group/MemberContributionsList';
import { TransactionHistoryList } from '../components/group/TransactionHistoryList';

// Extracted Modals
import { WalletOptionsModal } from '../components/group/WalletOptionsModal';
import { TransferManagerModal } from '../components/group/TransferManagerModal';
import { SetTargetModal } from '../components/group/SetTargetModal';
import { TargetRulesModal } from '../components/group/TargetRulesModal';

export default function GroupWalletScreen() {
  const insets = useSafeAreaInsets();
  const { id: groupId } = useRouteParams(idParamSchema);

  const controller = useGroupWalletController({
    groupId,
    onSetupWalletSuccess: () => {
      // Setup successful
    },
    onSetupWalletError: (err) => {
      Alert.alert('Error', err);
    },
    onContributeSuccess: (amount) => {
      Alert.alert(
        'Success! 🎉',
        `Contributed ${CURRENCY_SYMBOL}${amount.toFixed(2)} to the wallet.`
      );
    },
    onContributeError: (err) => {
      Alert.alert('Error', err);
    },
    onUpdateManagerSuccess: () => {
      Alert.alert('Success! 🎉', 'Wallet Manager updated successfully.');
    },
    onUpdateManagerError: (err) => {
      Alert.alert('Error', err);
    },
    onUpdateTargetSuccess: () => {
      Alert.alert('Success! 🎉', 'Contribution target set successfully.');
    },
    onUpdateTargetError: (err) => {
      Alert.alert('Error', err);
    },
  });

  const {
    user,
    group,
    wallet,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    contributeAmount,
    setContributeAmount,
    showContributeInput,
    setShowContributeInput,
    isRefreshing,
    menuVisible,
    setMenuVisible,
    managerModalVisible,
    setManagerModalVisible,
    targetModalVisible,
    setTargetModalVisible,
    infoModalVisible,
    setInfoModalVisible,
    newTarget,
    setNewTarget,
    newManagerId,
    setNewManagerId,
    durationMode,
    setDurationMode,
    customDate,
    setCustomDate,
    isOwner,
    isManager,
    handleRefresh,
    handleSetupWallet,
    handleContribute,
    handleSaveManager,
    handleSaveTarget,
    shareTarget,
    myPaid,
    myPending,
    contributeError,
    sortedMembers,
    openSettings,
    handleShowTargetInfo,
    handleOpenManagerModal,
    handleOpenTargetModal,
    contribute,
    updateManager,
    updateTarget,
    transactions,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = controller;

  // ── Loading ──
  if (isLoading || (isFetching && !isRefreshing)) {
    return <GroupWalletSkeleton />;
  }

  // ── Error ──
  if (isError) {
    const errorMsg =
      (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
      (error as Error)?.message ||
      'Failed to load wallet';
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Group Wallet</Text>
        </View>
        <ErrorView message={errorMsg} onRetry={refetch} />
      </View>
    );
  }

  // ── No Wallet — Setup ──
  if (!wallet) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Group Wallet</Text>
        </View>
        <EmptyState
          icon="wallet-outline"
          title="No Group Wallet"
          description="Set up a shared fund to collect contributions and pay group expenses directly."
          ctaText={isOwner ? 'Set Up Wallet' : undefined}
          ctaIcon="add-circle-outline"
          ctaColor={COLORS.secondary}
          onCtaPress={isOwner ? handleSetupWallet : undefined}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Wallet</Text>
        {isManager && (
          <TouchableOpacity onPress={openSettings} style={styles.settingsBtn}>
            <Ionicons name="settings-outline" size={22} color={COLORS.onSurface} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {/* ── Balance Card ── */}
        <WalletBalanceCard balance={wallet.balance} managerName={wallet.manager?.name} />

        {/* ── Active Target Banner ── */}
        {wallet.targetContribution > 0 && (
          <ActiveTargetBanner
            targetContribution={wallet.targetContribution}
            targetExpiresAt={wallet.targetExpiresAt ?? null}
            onShowTargetInfo={handleShowTargetInfo}
          />
        )}

        {/* ── Your Contribution Quick Action ── */}
        <YourContributionCard
          myPaid={myPaid}
          shareTarget={shareTarget}
          myPending={myPending}
          contributeAmount={contributeAmount}
          setContributeAmount={setContributeAmount}
          showContributeInput={showContributeInput}
          setShowContributeInput={setShowContributeInput}
          onContribute={handleContribute}
          isPending={contribute.isPending}
          contributeError={contributeError}
        />

        {/* ── All Members Contributions ── */}
        <MemberContributionsList
          sortedMembers={sortedMembers}
          contributions={wallet.contributions}
          targetContribution={wallet.targetContribution}
          walletManagerId={wallet.walletManagerId}
          currentUserId={user?.id}
        />

        {/* ── Transaction History (Group Activity) ── */}
        <TransactionHistoryList
          transactions={transactions}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={fetchNextPage}
        />
      </ScrollView>

      {/* ── Options Modal ── */}
      <WalletOptionsModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onTransferManager={handleOpenManagerModal}
        onSetTarget={handleOpenTargetModal}
        onShowRules={() => {
          setMenuVisible(false);
          setInfoModalVisible(true);
        }}
      />

      {/* ── Transfer Manager Modal ── */}
      <TransferManagerModal
        visible={managerModalVisible}
        onClose={() => setManagerModalVisible(false)}
        members={group?.members ?? []}
        currentManagerId={wallet.walletManagerId}
        currentUserId={user?.id}
        newManagerId={newManagerId}
        setNewManagerId={setNewManagerId}
        onSave={handleSaveManager}
        isPending={updateManager.isPending}
      />

      {/* ── Set Target Modal ── */}
      <SetTargetModal
        visible={targetModalVisible}
        onClose={() => setTargetModalVisible(false)}
        targetContribution={wallet.targetContribution}
        targetExpiresAt={wallet.targetExpiresAt ?? null}
        newTarget={newTarget}
        setNewTarget={setNewTarget}
        durationMode={durationMode}
        setDurationMode={setDurationMode}
        customDate={customDate}
        setCustomDate={setCustomDate}
        onSave={handleSaveTarget}
        isPending={updateTarget.isPending}
        onShowRules={handleShowTargetInfo}
      />

      {/* ── Target Info Modal ── */}
      <TargetRulesModal visible={infoModalVisible} onClose={() => setInfoModalVisible(false)} />
    </View>
  );
}
