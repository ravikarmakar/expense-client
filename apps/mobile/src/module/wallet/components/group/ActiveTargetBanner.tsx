import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL } from '../../../../constants/theme';

interface ActiveTargetBannerProps {
  targetContribution: number;
  targetExpiresAt: string | null;
  onShowTargetInfo: () => void;
}

export function ActiveTargetBanner({
  targetContribution,
  targetExpiresAt,
  onShowTargetInfo,
}: ActiveTargetBannerProps) {
  return (
    <View style={localStyles.targetBanner}>
      <View style={localStyles.targetBannerLeft}>
        <Ionicons name="flag" size={18} color={COLORS.primary} />
        <View>
          <Text style={localStyles.targetBannerTitle}>
            Active Target: {CURRENCY_SYMBOL}
            {targetContribution.toFixed(2)} each
          </Text>
          {targetExpiresAt ? (
            <Text style={localStyles.targetBannerSub}>
              Locked until{' '}
              {new Date(targetExpiresAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          ) : (
            <Text style={localStyles.targetBannerSub}>No expiration date set</Text>
          )}
        </View>
      </View>
      <View style={localStyles.targetBannerRight}>
        <TouchableOpacity onPress={onShowTargetInfo} style={localStyles.infoIconBtn}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={localStyles.lockIconContainer}>
          <Ionicons name="lock-closed" size={16} color={COLORS.outline} />
        </View>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  targetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e6f4ea',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.primaryFixed,
  },
  targetBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  targetBannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIconBtn: {
    padding: 4,
  },
  targetBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  targetBannerSub: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  lockIconContainer: {
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
});
