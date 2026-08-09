import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { styles } from '../styles/groups-tab.styles';

export type FilterType = 'all' | 'owed' | 'owe' | 'settled' | 'deactivated';

interface GroupsFilterPillsProps {
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
  activeCount: number;
  deactivatedCount: number;
  variant?: 'light' | 'dark';
}

export function GroupsFilterPills({
  activeFilter,
  setActiveFilter,
  activeCount,
  deactivatedCount,
  variant = 'light',
}: GroupsFilterPillsProps) {
  const isDark = variant === 'dark';

  const filterOptions: Array<{ key: FilterType; label: string }> = [
    { key: 'all', label: `All Groups (${activeCount})` },
    { key: 'owed', label: 'Owed to me' },
    { key: 'owe', label: 'You owe' },
    { key: 'settled', label: 'Settled' },
    { key: 'deactivated', label: `Deactivated (${deactivatedCount})` },
  ];

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
        contentContainerStyle={styles.filterContainer}
      >
        {filterOptions.map((opt) => {
          const isSelected = activeFilter === opt.key;

          return (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.filterPill,
                isDark && { backgroundColor: '#131D1A', borderColor: '#1E292B' },
                isSelected && styles.filterPillActive,
                isSelected && isDark && { backgroundColor: '#34D399', borderColor: '#34D399' },
              ]}
              onPress={() => setActiveFilter(opt.key)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterPillText,
                  isDark && { color: '#9CA3AF' },
                  isSelected && styles.filterPillTextActive,
                  isSelected && isDark && { color: '#101917', fontWeight: '800' },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
