import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { globalStyles } from '../../../styles/globalStyles';
import { SplitSummaryCard } from '../components/group-details/SplitSummaryCard';
import { AddExpenseModal } from '../../../components/AddExpenseModal';
import { EditGroupModal } from '../components/EditGroupModal';
import { ErrorView } from '../../../components/ErrorView';
import { z } from 'zod';
import { useRouteParams } from '../../../hooks/useRouteParams';
import { detailStyles as styles } from '../styles/group.styles';
import { MemberBalanceItemSkeleton } from '../components/group-details/MemberBalanceItemSkeleton';
import SettleUpModal from '../../settlements/components/SettleUpModal';

import { GroupDetailHeader } from '../components/group-details/GroupDetailHeader';
import { GroupBalanceCard } from '../components/group-details/GroupBalanceCard';
import { GroupRecentActivity } from '../components/group-details/GroupRecentActivity';
import { GroupOverflowMenuModal } from '../components/group-details/GroupOverflowMenuModal';
import { GroupDetailProvider, useGroupDetail } from '../contexts/GroupDetailContext';

const groupRouteSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  emoji: z.string().optional(),
});

function GroupDetailContent() {
  const {
    id,
    user,
    group,
    isAdmin,
    isLoading,
    isFetching,
    isError,
    refetch,
    isRefreshing,
    handleRefresh,
    addExpenseVisible,
    setAddExpenseVisible,
    settleModalVisible,
    setSettleModalVisible,
    settleMember,
    settleAmount,
    setSettleAmount,
    handleSendReminder,
    handleSettleUp,
    submitSettleUp,
    settlingUserId,
    sendReminder,
    settleUp,
    editGroupVisible,
    setEditGroupVisible,
    refetchActivity,
    routeName,
    insets,
  } = useGroupDetail();

  const showSkeleton = isLoading || (isFetching && !isRefreshing);

  if (isError || (!group && !isLoading)) {
    return <ErrorView message="Failed to load group" onRetry={refetch} />;
  }

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <GroupDetailHeader />

      <ScrollView
        contentContainerStyle={[globalStyles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {/* ── Balance Card ── */}
        <GroupBalanceCard />

        {/* ── Member Balances ── */}
        <View style={globalStyles.sectionContainer}>
          <View style={globalStyles.sectionHeaderRow}>
            <Text
              style={[
                globalStyles.sectionTitle,
                {
                  fontSize: 16,
                  color: COLORS.onSurface,
                  textTransform: 'none',
                  letterSpacing: 0,
                  fontWeight: '700',
                  marginBottom: 0,
                },
              ]}
            >
              Balances
            </Text>
            {isAdmin && group?.isActive !== false && (
              <TouchableOpacity
                onPress={() => router.push(`/groups/${id}/add-member`)}
                activeOpacity={0.7}
              >
                <View style={styles.addMemberBtn}>
                  <Ionicons name="person-add" size={14} color={COLORS.secondary} />
                  <Text style={styles.addMemberBtnText}>Add</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
          {showSkeleton || !group ? (
            <View style={localStyles.membersSkeletonContainer}>
              <MemberBalanceItemSkeleton />
              <MemberBalanceItemSkeleton />
              <MemberBalanceItemSkeleton isLast />
            </View>
          ) : (
            <SplitSummaryCard
              members={group.members}
              currentUserId={user?.id}
              onSettleUp={handleSettleUp}
              isSettling={settlingUserId}
              onSendReminder={handleSendReminder}
              isReminding={sendReminder.isPending ? sendReminder.variables : null}
            />
          )}
        </View>

        {/* ── Recent Activity ── */}
        <GroupRecentActivity />
      </ScrollView>

      {/* ── FAB: Add Expense ── */}
      {!isLoading && group && group.isActive !== false && (
        <TouchableOpacity
          style={[
            styles.fab,
            { bottom: 24 + insets.bottom },
            group.memberCount <= 1 && styles.fabDisabled,
          ]}
          activeOpacity={0.85}
          onPress={() => {
            if (group.memberCount <= 1) {
              Alert.alert(
                'Add Member First',
                'You need at least one other member in the group to add split expenses. Please add a member to the group first.',
                [
                  {
                    text: 'Add Member',
                    onPress: () => router.push(`/groups/${id}/add-member`),
                  },
                  { text: 'Cancel', style: 'cancel' },
                ]
              );
            } else {
              setAddExpenseVisible(true);
            }
          }}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      )}

      <AddExpenseModal
        visible={addExpenseVisible}
        onClose={() => setAddExpenseVisible(false)}
        groupId={id}
        groupName={group?.name ?? routeName ?? 'Group'}
        onSuccess={(isWallet) => {
          if (!isWallet) {
            refetch();
          }
          refetchActivity();
        }}
      />

      {/* ── Modal: Settle Up ── */}
      <SettleUpModal
        visible={settleModalVisible}
        onClose={() => setSettleModalVisible(false)}
        settleMember={settleMember}
        settleAmount={settleAmount}
        setSettleAmount={setSettleAmount}
        onSubmit={submitSettleUp}
        isPending={settleUp.isPending}
      />

      {group && (
        <EditGroupModal
          visible={editGroupVisible}
          onClose={() => setEditGroupVisible(false)}
          group={group}
          onSuccess={() => {
            refetch();
          }}
        />
      )}

      {/* ── Overflow Menu Modal ── */}
      <GroupOverflowMenuModal />
    </View>
  );
}

export default function GroupDetailScreen() {
  const { id, name, emoji } = useRouteParams(groupRouteSchema);

  return (
    <GroupDetailProvider id={id} routeName={name} routeEmoji={emoji}>
      <GroupDetailContent />
    </GroupDetailProvider>
  );
}

const localStyles = StyleSheet.create({
  membersSkeletonContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    overflow: 'hidden',
  },
});
