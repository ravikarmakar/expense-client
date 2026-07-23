import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { globalStyles } from '../../../styles/globalStyles';
import { ScalePressable } from '../../../components/ScalePressable';

interface QuickActionsCardProps {
  onAddExpensePress: () => void;
  onCreateGroupPress: () => void;
  onCreateCategoryPress: () => void;
  onScanReceiptPress?: () => void;
  variant?: 'light' | 'dark';
}

/**
 * Premium glassmorphic Quick Actions Row.
 * Replaced bright backgrounds with dark matte surfaces and crisp accent icons.
 */
export const QuickActionsCard = React.memo(function QuickActionsCard({
  onAddExpensePress,
  onCreateGroupPress,
  onCreateCategoryPress,
  onScanReceiptPress,
  variant = 'light',
}: QuickActionsCardProps) {
  const isDark = variant === 'dark';

  return (
    <View style={[globalStyles.sectionContainer, styles.container]}>
      <View style={styles.headerRow}>
        <Text
          style={[
            globalStyles.sectionTitle,
            styles.sectionTitle,
            { color: isDark ? '#FFFFFF' : '#191c1d' },
          ]}
        >
          Quick Actions
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickActionsScroll}
      >
        {/* Add Expense */}
        <ScalePressable style={styles.quickActionItem} onPress={onAddExpensePress}>
          <View
            style={[
              styles.quickActionIconContainer,
              isDark
                ? styles.darkIconContainer
                : { backgroundColor: '#e6f4ea', borderColor: '#d0e5dd', borderWidth: 1 },
            ]}
          >
            <Ionicons name="add" size={26} color={isDark ? '#10B981' : '#006948'} />
          </View>
          <Text
            style={[styles.quickActionLabel, { color: isDark ? '#ffffff' : '#191c1d' }]}
            numberOfLines={2}
          >
            Add Expense
          </Text>
        </ScalePressable>

        {/* My Wallet */}
        <ScalePressable
          style={styles.quickActionItem}
          onPress={() => router.push('/(tabs)/personal')}
        >
          <View
            style={[
              styles.quickActionIconContainer,
              isDark
                ? styles.darkIconContainer
                : { backgroundColor: '#e8f0fe', borderColor: '#d3e2fd', borderWidth: 1 },
            ]}
          >
            <Ionicons name="wallet" size={24} color={isDark ? '#60A5FA' : '#1a73e8'} />
          </View>
          <Text
            style={[styles.quickActionLabel, { color: isDark ? '#ffffff' : '#191c1d' }]}
            numberOfLines={2}
          >
            My Wallet
          </Text>
        </ScalePressable>

        {/* New Group */}
        <ScalePressable style={styles.quickActionItem} onPress={onCreateGroupPress}>
          <View
            style={[
              styles.quickActionIconContainer,
              isDark
                ? styles.darkIconContainer
                : { backgroundColor: '#f3e5f5', borderColor: '#e9d5ff', borderWidth: 1 },
            ]}
          >
            <Ionicons name="people" size={24} color={isDark ? '#C084FC' : '#7b1fa2'} />
          </View>
          <Text
            style={[styles.quickActionLabel, { color: isDark ? '#ffffff' : '#191c1d' }]}
            numberOfLines={2}
          >
            New Group
          </Text>
        </ScalePressable>

        {/* Settle Up */}
        <ScalePressable style={styles.quickActionItem} onPress={() => router.push('/settle-up')}>
          <View
            style={[
              styles.quickActionIconContainer,
              isDark
                ? styles.darkIconContainer
                : { backgroundColor: '#fce8e6', borderColor: '#fecaca', borderWidth: 1 },
            ]}
          >
            <Ionicons name="checkmark-circle" size={24} color={isDark ? '#F87171' : '#c5221f'} />
          </View>
          <Text
            style={[styles.quickActionLabel, { color: isDark ? '#ffffff' : '#191c1d' }]}
            numberOfLines={2}
          >
            Settle Up
          </Text>
        </ScalePressable>

        {/* Ledger */}
        <ScalePressable
          style={styles.quickActionItem}
          onPress={() => router.push('/(tabs)/activity')}
        >
          <View
            style={[
              styles.quickActionIconContainer,
              isDark
                ? styles.darkIconContainer
                : { backgroundColor: '#fef7e0', borderColor: '#fef08a', borderWidth: 1 },
            ]}
          >
            <Ionicons name="receipt" size={24} color={isDark ? '#FBBF24' : '#b06000'} />
          </View>
          <Text
            style={[styles.quickActionLabel, { color: isDark ? '#ffffff' : '#191c1d' }]}
            numberOfLines={2}
          >
            Ledger
          </Text>
        </ScalePressable>

        {/* Scan Receipt */}
        <ScalePressable style={styles.quickActionItem} onPress={onScanReceiptPress}>
          <View
            style={[
              styles.quickActionIconContainer,
              isDark
                ? styles.darkIconContainer
                : { backgroundColor: '#e0f7fa', borderColor: '#99f6e4', borderWidth: 1 },
            ]}
          >
            <Ionicons name="camera" size={24} color={isDark ? '#10B981' : '#00838f'} />
          </View>
          <Text
            style={[styles.quickActionLabel, { color: isDark ? '#ffffff' : '#191c1d' }]}
            numberOfLines={2}
          >
            Scan Receipt
          </Text>
        </ScalePressable>

        {/* Categories */}
        <ScalePressable style={styles.quickActionItem} onPress={onCreateCategoryPress}>
          <View
            style={[
              styles.quickActionIconContainer,
              isDark
                ? styles.darkIconContainer
                : { backgroundColor: '#e0f2fe', borderColor: '#bae6fd', borderWidth: 1 },
            ]}
          >
            <Ionicons name="grid" size={24} color={isDark ? '#38BDF8' : '#0284c7'} />
          </View>
          <Text
            style={[styles.quickActionLabel, { color: isDark ? '#ffffff' : '#191c1d' }]}
            numberOfLines={2}
          >
            Categories
          </Text>
        </ScalePressable>
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerRow: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#191c1d',
    letterSpacing: -0.5,
  },
  quickActionsScroll: {
    paddingHorizontal: 4,
    gap: 14,
  },
  quickActionItem: {
    alignItems: 'center',
    width: 72,
    gap: 8,
  },
  quickActionIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lightIconContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2ece6',
  },
  darkIconContainer: {
    backgroundColor: '#101917',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  quickActionLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#191c1d',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
});
