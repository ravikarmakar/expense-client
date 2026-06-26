import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, avatars, CURRENCY_SYMBOL } from '../../constants/theme';
import { globalStyles } from '../../styles/globalStyles';
import { TopAppBar } from '../../components/TopAppBar';
import { GroupCard } from '../../components/GroupCard';

export default function GroupsTabScreen() {
  return (
    <View style={styles.container}>
      <TopAppBar onNotificationPress={() => {}} />

      <ScrollView
        contentContainerStyle={globalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabHeaderRow}>
          <Text style={styles.tabTitle}>My Groups</Text>
          <TouchableOpacity style={styles.createGroupButton} activeOpacity={0.8}>
            <Ionicons name="add" size={18} color="#ffffff" />
            <Text style={styles.createGroupButtonText}>New Group</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.groupsSummaryRow}>
          <View style={styles.groupsSummaryCard}>
            <Text style={styles.groupsSummaryLabel}>Owed to you</Text>
            <Text style={styles.groupsSummaryValueGreen}>{CURRENCY_SYMBOL}1,890.00</Text>
          </View>
          <View style={styles.groupsSummaryCard}>
            <Text style={styles.groupsSummaryLabel}>You owe</Text>
            <Text style={styles.groupsSummaryValueRed}>{CURRENCY_SYMBOL}641.50</Text>
          </View>
        </View>

        <View style={styles.groupsList}>
          <GroupCard
            name="Europe Trip 2024"
            activity="Last activity: Yesterday • Flight tickets split"
            memberAvatars={[avatars.womanWithGlasses, avatars.fintechMan]}
            totalMembersCount={5}
            balanceText={`Owed ${CURRENCY_SYMBOL}120`}
            balanceType="owed"
          />

          <GroupCard
            name="Roommates Office"
            activity="Electricity bill due tomorrow • 4 members"
            memberAvatars={[avatars.groupLaugh, avatars.minimalistWoman]}
            totalMembersCount={4}
            balanceText={`You owe ${CURRENCY_SYMBOL}42`}
            balanceType="owe"
          />

          <GroupCard
            name="Friday Dinners"
            activity="All expenses settled • 3 members"
            memberAvatars={[avatars.fintechMan, avatars.womanWithGlasses]}
            totalMembersCount={3}
            balanceText="Settle Up"
            balanceType="settled"
          />
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
  tabHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  createGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  createGroupButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  groupsSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  groupsSummaryCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  groupsSummaryLabel: {
    fontSize: 11,
    color: COLORS.outline,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  groupsSummaryValueGreen: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  groupsSummaryValueRed: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.error,
  },
  groupsList: {
    gap: 12,
  },
});
