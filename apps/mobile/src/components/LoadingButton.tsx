import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

type ButtonVariant = 'primary' | 'destructive' | 'outline';

interface LoadingButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
}

/**
 * Reusable button with loading state, disabled state, and multiple variants.
 * Replaces the repeated TouchableOpacity + ActivityIndicator + Text pattern.
 */
export const LoadingButton = React.memo(function LoadingButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}: LoadingButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    variantStyles[variant].container,
    isDisabled && styles.disabled,
  ];

  const textStyle = variantStyles[variant].text;

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.onSurfaceVariant : '#ffffff'} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 8,
  },
  disabled: {
    opacity: 0.7,
  },
  // Primary
  primaryContainer: {
    backgroundColor: COLORS.primary,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  // Destructive
  destructiveContainer: {
    backgroundColor: COLORS.error,
    elevation: 4,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  destructiveText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  // Outline
  outlineContainer: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainer,
  },
  outlineText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 16,
    fontWeight: '700',
  },
});

const variantStyles: Record<ButtonVariant, { container: object; text: object }> = {
  primary: { container: styles.primaryContainer, text: styles.primaryText },
  destructive: { container: styles.destructiveContainer, text: styles.destructiveText },
  outline: { container: styles.outlineContainer, text: styles.outlineText },
};
