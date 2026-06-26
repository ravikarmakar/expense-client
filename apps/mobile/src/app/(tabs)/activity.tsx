import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { COLORS, CURRENCY_SYMBOL } from '../../constants/theme';
import { globalStyles } from '../../styles/globalStyles';
import { TopAppBar } from '../../components/TopAppBar';
import { HighlightItem } from '../../components/HighlightItem';

export default function ActivityTabScreen() {
  return (
    <View style={styles.container}>
      <TopAppBar onNotificationPress={() => {}} />

      <ScrollView
        contentContainerStyle={globalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabHeaderRow}>
          <Text style={styles.tabTitle}>Recent Activity</Text>
        </View>

        <View style={styles.activityFeed}>
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

          <HighlightItem
            title={'You paid for "Burger Joint"'}
            subtitle="Europe Trip 2024 • 3d ago"
            amount={`${CURRENCY_SYMBOL}64.00`}
            secondaryText={`+${CURRENCY_SYMBOL}48.00`}
            secondaryTextColor="green"
            iconName="local-dining"
            iconBgColor={COLORS.secondaryFixed}
            iconColor={COLORS.secondary}
          />

          <HighlightItem
            title={'Marcus added "Flight Tickets"'}
            subtitle="Europe Trip 2024 • 4d ago"
            amount={`${CURRENCY_SYMBOL}450.00`}
            secondaryText="You owe"
            secondaryTextColor="red"
            iconName="flight"
            iconBgColor={COLORS.errorContainer}
            iconColor={COLORS.error}
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
  activityFeed: {
    gap: 12,
  },
});
