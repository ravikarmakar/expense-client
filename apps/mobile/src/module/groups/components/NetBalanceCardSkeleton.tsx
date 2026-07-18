import React from 'react';
import { View, Text } from 'react-native';
import { SkeletonLoader } from '../../../components/SkeletonLoader';
import { styles } from '../styles/groups-tab.styles';

export function NetBalanceCardSkeleton() {
  return (
    <View style={styles.netBalanceCard}>
      <View style={styles.netBalanceHeader}>
        <View>
          <Text style={styles.netBalanceLabel}>Net Balance</Text>
          <View style={{ marginTop: 6 }}>
            <SkeletonLoader width={120} height={28} borderRadius={6} />
          </View>
        </View>
        <SkeletonLoader width={28} height={28} borderRadius={14} />
      </View>

      <View style={styles.netBalanceRow}>
        {/* Plus flow */}
        <View style={styles.netBalanceCol}>
          <SkeletonLoader width={24} height={24} borderRadius={12} />
          <View style={styles.netBalanceTextContainer}>
            <Text style={styles.netBalanceDetailLabel}>Owed to you:</Text>
            <SkeletonLoader width={60} height={16} borderRadius={4} />
          </View>
        </View>

        <View style={styles.netBalanceColSeparator} />

        {/* Minus flow */}
        <View style={styles.netBalanceCol}>
          <SkeletonLoader width={24} height={24} borderRadius={12} />
          <View style={styles.netBalanceTextContainer}>
            <Text style={styles.netBalanceDetailLabel}>You owe:</Text>
            <SkeletonLoader width={60} height={16} borderRadius={4} />
          </View>
        </View>
      </View>
    </View>
  );
}
