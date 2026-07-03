import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface EmptyStateProps {
  icon?: string;
  iconLib?: 'Ionicons' | 'MaterialIcons';
  emoji?: string;
  title: string;
  description: string;
  ctaText?: string;
  onCtaPress?: () => void;
  ctaIcon?: React.ComponentProps<typeof Ionicons>['name'];
}

export const EmptyState = React.memo(function EmptyState({
  icon,
  iconLib = 'Ionicons',
  emoji,
  title,
  description,
  ctaText,
  onCtaPress,
  ctaIcon,
}: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      {emoji ? (
        <Text style={styles.emptyEmoji}>{emoji}</Text>
      ) : icon ? (
        <View style={styles.iconContainer}>
          {iconLib === 'Ionicons' ? (
            <Ionicons
              name={icon as React.ComponentProps<typeof Ionicons>['name']}
              size={48}
              color={COLORS.outlineVariant}
            />
          ) : (
            <MaterialIcons
              name={icon as React.ComponentProps<typeof MaterialIcons>['name']}
              size={48}
              color={COLORS.outlineVariant}
            />
          )}
        </View>
      ) : null}
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{description}</Text>
      {ctaText && onCtaPress && (
        <TouchableOpacity style={styles.emptyCta} onPress={onCtaPress} activeOpacity={0.8}>
          {ctaIcon && <Ionicons name={ctaIcon} size={18} color="#fff" style={{ marginRight: 6 }} />}
          <Text style={styles.emptyCtaText}>{ctaText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    backgroundColor: 'transparent',
  },
  iconContainer: {
    marginBottom: 16,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.outline,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  emptyCtaText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
