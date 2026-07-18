import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, CURRENCY_SYMBOL } from '../../../../constants/theme';
import { detailStyles as styles } from '../../styles/group.styles';
import { useGroupDetail } from '../../contexts/GroupDetailContext';

export function GroupDetailHeader() {
  const { id, group, routeEmoji, routeName, insets, setMenuVisible } = useGroupDetail();
  const wallet = group?.wallet;

  const displayEmoji = group?.emoji ?? routeEmoji ?? '👥';
  const displayName = group?.name ?? routeName ?? 'Group Detail';

  return (
    <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {displayEmoji} {displayName}
      </Text>
      {wallet ? (
        <TouchableOpacity
          onPress={() => router.push(`/groups/${id}/wallet`)}
          style={localStyles.walletHeaderPill}
          activeOpacity={0.7}
        >
          <Ionicons name="wallet" size={14} color={COLORS.primary} />
          <Text style={localStyles.walletHeaderBalance} numberOfLines={1}>
            {CURRENCY_SYMBOL}
            {wallet.balance.toFixed(2)}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => router.push(`/groups/${id}/wallet`)}
          style={styles.walletBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="wallet" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.moreBtn}>
        <Ionicons name="ellipsis-vertical" size={25} color={COLORS.onSurface} />
      </TouchableOpacity>
    </View>
  );
}

const localStyles = StyleSheet.create({
  walletHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 8,
    gap: 4,
  },
  walletHeaderBalance: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
