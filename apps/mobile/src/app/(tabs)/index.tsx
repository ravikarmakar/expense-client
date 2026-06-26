import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, avatars, CURRENCY_SYMBOL } from '../../constants/theme';
import { globalStyles } from '../../styles/globalStyles';
import { TopAppBar } from '../../components/TopAppBar';
import { GroupCard } from '../../components/GroupCard';
import { HighlightItem } from '../../components/HighlightItem';

export default function HomeTabScreen() {
  return (
    <View style={styles.container}>
      <TopAppBar onNotificationPress={() => {}} />

      <ScrollView
        contentContainerStyle={globalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Section */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingSub}>Good Morning,</Text>
          <Text style={styles.greetingName}>Alexander</Text>
        </View>

        {/* Main Balance Card */}
        <View style={styles.balanceCard}>
          <View style={[styles.abstractCircle, styles.circleTopRight]} />
          <View style={[styles.abstractCircle, styles.circleBottomLeft]} />

          <Text style={styles.balanceLabel}>Total Net Balance</Text>
          <Text style={styles.balanceAmount}>{CURRENCY_SYMBOL}1,248.50</Text>

          <View style={styles.balanceDivider} />

          <View style={styles.balanceDetailsRow}>
            <View style={styles.balanceDetailCol}>
              <Text style={styles.balanceDetailLabel}>Owed to you</Text>
              <Text style={styles.balanceDetailValue}>{CURRENCY_SYMBOL}1,890.00</Text>
            </View>
            <View style={[styles.balanceDetailCol, styles.alignEnd]}>
              <Text style={styles.balanceDetailLabel}>You owe</Text>
              <Text style={styles.balanceDetailValueOwe}>{CURRENCY_SYMBOL}641.50</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={globalStyles.sectionContainer}>
          <Text style={globalStyles.sectionTitle}>Quick Actions</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsScroll}
          >
            {/* Scan Receipt */}
            <TouchableOpacity style={styles.quickActionItem} activeOpacity={0.8}>
              <View style={styles.quickActionIconContainer}>
                <MaterialIcons name="document-scanner" size={26} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionLabel} numberOfLines={2}>
                Scan Receipt
              </Text>
            </TouchableOpacity>

            {/* Add Expense */}
            <TouchableOpacity style={styles.quickActionItem} activeOpacity={0.8}>
              <View
                style={[styles.quickActionIconContainer, styles.quickActionIconContainerActive]}
              >
                <Ionicons name="add" size={28} color="#ffffff" />
              </View>
              <Text style={styles.quickActionLabel} numberOfLines={2}>
                Add Expense
              </Text>
            </TouchableOpacity>

            {/* Settle Up */}
            <TouchableOpacity style={styles.quickActionItem} activeOpacity={0.8}>
              <View style={styles.quickActionIconContainer}>
                <MaterialIcons name="payments" size={26} color={COLORS.secondary} />
              </View>
              <Text style={styles.quickActionLabel} numberOfLines={2}>
                Settle Up
              </Text>
            </TouchableOpacity>

            {/* Split Bill */}
            <TouchableOpacity style={styles.quickActionItem} activeOpacity={0.8}>
              <View style={styles.quickActionIconContainer}>
                <MaterialIcons name="call-split" size={26} color={COLORS.tertiary} />
              </View>
              <Text style={styles.quickActionLabel} numberOfLines={2}>
                Split Bill
              </Text>
            </TouchableOpacity>

            {/* Invite Friends */}
            <TouchableOpacity style={styles.quickActionItem} activeOpacity={0.8}>
              <View style={styles.quickActionIconContainer}>
                <Ionicons name="person-add" size={24} color={COLORS.outline} />
              </View>
              <Text style={styles.quickActionLabel} numberOfLines={2}>
                Invite
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Active Groups */}
        <View style={globalStyles.sectionContainer}>
          <View style={globalStyles.sectionHeaderRow}>
            <Text style={globalStyles.sectionTitle}>Active Groups</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/groups')}>
              <Text style={globalStyles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <GroupCard
            name="Europe Trip 2024"
            activity="Last activity: Yesterday"
            memberAvatars={[avatars.womanWithGlasses, avatars.fintechMan]}
            totalMembersCount={5}
            balanceText={`Owed ${CURRENCY_SYMBOL}120`}
            balanceType="owed"
            onPress={() => router.push('/groups')}
          />

          <GroupCard
            name="Roommates Office"
            activity="Electricity bill due tomorrow"
            memberAvatars={[avatars.groupLaugh, avatars.minimalistWoman]}
            totalMembersCount={2}
            balanceText={`You owe ${CURRENCY_SYMBOL}42`}
            balanceType="owe"
            onPress={() => router.push('/groups')}
          />
        </View>

        {/* Recent Highlights */}
        <View style={[globalStyles.sectionContainer, styles.pbHighlight]}>
          <View style={globalStyles.sectionHeaderRow}>
            <Text style={globalStyles.sectionTitle}>Recent Highlights</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/activity')}>
              <Text style={globalStyles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.highlightsContainer}>
            <HighlightItem
              title={'Marcus added "Groceries"'}
              subtitle="Shared with 3 others • 2h ago"
              amount={`${CURRENCY_SYMBOL}85.40`}
              secondaryText={`+${CURRENCY_SYMBOL}21.35`}
              secondaryTextColor="green"
              iconName="shopping-cart"
              iconBgColor={COLORS.secondaryFixed}
              iconColor={COLORS.secondary}
            />

            <HighlightItem
              title="Sarah settled up"
              subtitle="Dinner from last Friday • 5h ago"
              amount={`${CURRENCY_SYMBOL}45.00`}
              secondaryText="Received"
              secondaryTextColor="gray"
              iconName="done-all"
              iconBgColor={COLORS.primaryFixed}
              iconColor={COLORS.primary}
            />

            <HighlightItem
              title="New bill from PG&E"
              subtitle="House account • 1d ago"
              amount={`${CURRENCY_SYMBOL}212.00`}
              secondaryText="Unsplit"
              secondaryTextColor="red"
              iconName="electric-bolt"
              iconBgColor={COLORS.tertiaryFixed}
              iconColor={COLORS.tertiary}
            />
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <Ionicons name="add" size={32} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  greetingContainer: {
    marginBottom: 20,
  },
  greetingSub: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  greetingName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  abstractCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circleTopRight: {
    width: 128,
    height: 128,
    top: -64,
    right: -64,
    backgroundColor: COLORS.primaryFixed,
    opacity: 0.15,
  },
  circleBottomLeft: {
    width: 96,
    height: 96,
    bottom: -48,
    left: -48,
    backgroundColor: COLORS.secondary,
    opacity: 0.1,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryFixed,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.9,
    textAlign: 'center',
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  balanceDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 20,
  },
  balanceDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceDetailCol: {
    flex: 1,
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  balanceDetailLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  balanceDetailValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  balanceDetailValueOwe: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  quickActionsScroll: {
    paddingLeft: 4,
    paddingBottom: 4,
  },
  quickActionItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 64,
  },
  quickActionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  quickActionIconContainerActive: {
    backgroundColor: COLORS.secondary,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.onSurface,
    textAlign: 'center',
    lineHeight: 14,
  },
  pbHighlight: {
    paddingBottom: 24,
  },
  highlightsContainer: {
    gap: 12,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 40,
  },
});
