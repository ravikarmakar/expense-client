import React, { useRef } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, Animated } from 'react-native';
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
 * Reusable button with 3D tactile depth, loading state, disabled state, and multiple variants.
 */
export const LoadingButton = React.memo(function LoadingButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}: LoadingButtonProps) {
  const isDisabled = disabled || loading;
  const translateY = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (isDisabled) return;
    Animated.timing(translateY, {
      toValue: 2.5,
      duration: 60,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (isDisabled) return;
    Animated.spring(translateY, {
      toValue: 0,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const textStyle = variantStyles[variant].text;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[styles.outerWrapper, isDisabled && styles.disabled]}
    >
      <Animated.View
        style={[styles.base, variantStyles[variant].container, { transform: [{ translateY }] }]}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'outline' ? COLORS.onSurfaceVariant : '#ffffff'} />
        ) : (
          <Text style={textStyle}>{title}</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  outerWrapper: {
    width: '100%',
    marginTop: 8,
  },
  base: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  // Primary
  primaryContainer: {
    backgroundColor: COLORS.primary,
    borderBottomWidth: 4,
    borderBottomColor: '#004730',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  // Destructive
  destructiveContainer: {
    backgroundColor: COLORS.error,
    borderBottomWidth: 4,
    borderBottomColor: '#8a1111',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    elevation: 4,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  destructiveText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  // Outline
  outlineContainer: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainer,
    borderBottomWidth: 3.5,
    borderBottomColor: COLORS.outlineVariant,
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
