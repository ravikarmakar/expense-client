import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SkeletonLoader } from './SkeletonLoader';

interface StatBoxProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  valueColor?: string;
  onPress: () => void;
  loading?: boolean;
}

export const StatBox = React.memo(function StatBox({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  valueColor,
  onPress,
  loading,
}: StatBoxProps) {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={onPress}>
      <View style={[styles.iconBg, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={16} color={iconColor} />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        {loading ? (
          <SkeletonLoader width={50} height={16} style={styles.skeleton} />
        ) : (
          <Text style={[styles.value, valueColor ? { color: valueColor } : undefined]}>
            {value}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  skeleton: {
    marginTop: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
});
