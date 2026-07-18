import React from 'react';
import { Text, StyleProp, TextStyle } from 'react-native';
import { CURRENCY_SYMBOL } from '../constants/theme';

interface CurrencyTextProps {
  amount: number;
  style?: StyleProp<TextStyle>;
  /** Number of decimal places (default: 2) */
  decimals?: number;
  /** Show sign prefix (+/-) for non-zero values */
  showSign?: boolean;
}

/**
 * Renders a formatted currency value.
 * Replaces the repeated `{CURRENCY_SYMBOL}{value.toFixed(2)}` pattern.
 */
export const CurrencyText = React.memo(function CurrencyText({
  amount,
  style,
  decimals = 2,
  showSign = false,
}: CurrencyTextProps) {
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toFixed(decimals);

  let prefix = CURRENCY_SYMBOL;
  if (showSign && amount > 0) {
    prefix = `+${CURRENCY_SYMBOL}`;
  } else if (showSign && amount < 0) {
    prefix = `-${CURRENCY_SYMBOL}`;
  }

  return (
    <Text style={style}>
      {prefix}
      {formatted}
    </Text>
  );
});
