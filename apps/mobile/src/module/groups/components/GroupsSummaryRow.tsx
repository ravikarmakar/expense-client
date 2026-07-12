import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';
import { styles } from '../styles/groups-tab.styles';

interface GroupsSummaryRowProps {
  totalOwedToMe: number;
  totalIOwe: number;
}

export const GroupsSummaryRow = React.memo(function GroupsSummaryRow({
  totalOwedToMe,
  totalIOwe,
}: GroupsSummaryRowProps) {
  return (
    <View style={styles.groupsSummaryRow}>
      <View style={[styles.groupsSummaryCard, styles.summaryCardGreen]}>
        <View style={styles.summaryCardHeader}>
          <Text style={styles.groupsSummaryLabel}>Owed to you</Text>
          <View style={[styles.summaryIconBg, styles.summaryIconBgGreen]}>
            <Ionicons name="arrow-down" size={12} color={COLORS.primary} />
          </View>
        </View>
        <Text style={styles.groupsSummaryValueGreen}>
          {CURRENCY_SYMBOL}
          {totalOwedToMe.toFixed(2)}
        </Text>
      </View>
      <View style={[styles.groupsSummaryCard, styles.summaryCardRed]}>
        <View style={styles.summaryCardHeader}>
          <Text style={styles.groupsSummaryLabel}>You owe</Text>
          <View style={[styles.summaryIconBg, styles.summaryIconBgRed]}>
            <Ionicons name="arrow-up" size={12} color={COLORS.error} />
          </View>
        </View>
        <Text style={styles.groupsSummaryValueRed}>
          {CURRENCY_SYMBOL}
          {totalIOwe.toFixed(2)}
        </Text>
      </View>
    </View>
  );
});
