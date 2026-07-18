import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CURRENCY_SYMBOL } from '../../../../constants/theme';
import { walletStyles as styles } from '../../../groups/styles/group.styles';

interface WalletBalanceCardProps {
  balance: number;
  managerName?: string;
}

export function WalletBalanceCard({ balance, managerName }: WalletBalanceCardProps) {
  return (
    <LinearGradient
      colors={['#4b41e1', '#6f66ec']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.balanceCard}
    >
      <View style={[styles.abstractCircle, styles.circleTopRight]} />
      <View style={[styles.abstractCircle, styles.circleBottomLeft]} />
      <Text style={styles.balanceLabel}>WALLET BALANCE</Text>
      <Text style={styles.balanceAmount}>
        {CURRENCY_SYMBOL}
        {balance.toFixed(2)}
      </Text>
      <View style={styles.balanceRow}>
        <Ionicons name="person" size={14} color="rgba(255,255,255,0.8)" />
        <Text style={styles.balanceMeta}>Managed by {managerName || 'Unknown'}</Text>
      </View>
    </LinearGradient>
  );
}
