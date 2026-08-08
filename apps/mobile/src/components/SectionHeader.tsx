import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
  seeAllText?: string;
  /** Use large variant (20px bold) instead of small uppercase label */
  large?: boolean;
}

export const SectionHeader = React.memo(function SectionHeader({
  title,
  onSeeAll,
  seeAllText = 'See All',
  large = true,
}: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={large ? styles.titleLarge : styles.titleSmall}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity
          onPress={onSeeAll}
          activeOpacity={0.7}
          hitSlop={8}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <Text style={styles.seeAllText}>{seeAllText}</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={COLORS.secondary}
            style={{ marginLeft: 2 }}
          />
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  titleLarge: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  titleSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
  },
});
