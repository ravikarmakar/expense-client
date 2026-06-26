import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export type HighlightIconType =
  | 'shopping-cart'
  | 'done-all'
  | 'electric-bolt'
  | 'local-dining'
  | 'flight';

interface HighlightItemProps {
  title: string;
  subtitle: string;
  amount: string;
  secondaryText?: string;
  secondaryTextColor?: 'green' | 'red' | 'gray';
  iconName: HighlightIconType;
  iconBgColor: string;
  iconColor: string;
}

export function HighlightItem({
  title,
  subtitle,
  amount,
  secondaryText,
  secondaryTextColor = 'gray',
  iconName,
  iconBgColor,
  iconColor,
}: HighlightItemProps) {
  const getSecondaryTextColor = () => {
    if (secondaryTextColor === 'green') return styles.greenText;
    if (secondaryTextColor === 'red') return styles.redText;
    return styles.grayText;
  };

  return (
    <View style={styles.highlightItem}>
      <View style={[styles.highlightIconBg, { backgroundColor: iconBgColor }]}>
        <MaterialIcons name={iconName} size={22} color={iconColor} />
      </View>
      <View style={styles.highlightDetails}>
        <Text style={styles.highlightTitle}>{title}</Text>
        <Text style={styles.highlightSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.highlightAmountCol}>
        <Text style={styles.highlightAmount}>{amount}</Text>
        {secondaryText && (
          <Text style={[styles.highlightStatus, getSecondaryTextColor()]}>{secondaryText}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  highlightIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  highlightDetails: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  highlightSubtitle: {
    fontSize: 11,
    color: COLORS.outline,
    marginTop: 2,
  },
  highlightAmountCol: {
    alignItems: 'flex-end',
  },
  highlightAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  highlightStatus: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  greenText: {
    color: COLORS.primary,
  },
  redText: {
    color: COLORS.error,
  },
  grayText: {
    color: COLORS.outline,
    fontWeight: '500',
  },
});
