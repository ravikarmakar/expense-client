import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { styles } from '../styles/groups-tab.styles';

export type FilterType = 'all' | 'owed' | 'owe' | 'settled' | 'deactivated';

interface GroupsFilterPillsProps {
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
  activeCount: number;
  deactivatedCount: number;
}

export function GroupsFilterPills({
  activeFilter,
  setActiveFilter,
  activeCount,
  deactivatedCount,
}: GroupsFilterPillsProps) {
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
        contentContainerStyle={styles.filterContainer}
      >
        <TouchableOpacity
          style={[styles.filterPill, activeFilter === 'all' && styles.filterPillActive]}
          onPress={() => setActiveFilter('all')}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.filterPillText, activeFilter === 'all' && styles.filterPillTextActive]}
          >
            All Groups ({activeCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterPill, activeFilter === 'owed' && styles.filterPillActive]}
          onPress={() => setActiveFilter('owed')}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.filterPillText, activeFilter === 'owed' && styles.filterPillTextActive]}
          >
            Owed to me
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterPill, activeFilter === 'owe' && styles.filterPillActive]}
          onPress={() => setActiveFilter('owe')}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.filterPillText, activeFilter === 'owe' && styles.filterPillTextActive]}
          >
            You owe
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterPill, activeFilter === 'settled' && styles.filterPillActive]}
          onPress={() => setActiveFilter('settled')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.filterPillText,
              activeFilter === 'settled' && styles.filterPillTextActive,
            ]}
          >
            Settled
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterPill, activeFilter === 'deactivated' && styles.filterPillActive]}
          onPress={() => setActiveFilter('deactivated')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.filterPillText,
              activeFilter === 'deactivated' && styles.filterPillTextActive,
            ]}
          >
            Deactivated ({deactivatedCount})
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
