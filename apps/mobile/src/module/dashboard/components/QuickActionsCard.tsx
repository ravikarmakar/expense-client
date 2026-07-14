import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../../../constants/theme';
import { globalStyles } from '../../../styles/globalStyles';

interface QuickActionsCardProps {
  onAddExpensePress: () => void;
  onCreateGroupPress: () => void;
  disabled?: boolean;
}

export const QuickActionsCard = React.memo(function QuickActionsCard({
  onAddExpensePress,
  onCreateGroupPress,
  disabled,
}: QuickActionsCardProps) {
  return (
    <View style={[globalStyles.sectionContainer, styles.container]}>
      <View style={styles.headerRow}>
        <Text style={[globalStyles.sectionTitle, styles.sectionTitle]}>Quick Actions</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickActionsScroll}
      >
        {/* Add Expense */}
        <TouchableOpacity
          style={[styles.quickActionItem, disabled && { opacity: 0.5 }]}
          activeOpacity={0.8}
          onPress={onAddExpensePress}
          disabled={disabled}
        >
          <View style={[styles.quickActionIconContainer, { backgroundColor: '#e6f4ea' }]}>
            <Ionicons name="add" size={30} color={COLORS.primary} />
          </View>
          <Text style={styles.quickActionLabel} numberOfLines={2}>
            Add Expense
          </Text>
        </TouchableOpacity>

        {/* My Wallet */}
        <TouchableOpacity
          style={[styles.quickActionItem, disabled && { opacity: 0.5 }]}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/personal')}
          disabled={disabled}
        >
          <View style={[styles.quickActionIconContainer, { backgroundColor: '#e8f0fe' }]}>
            <Ionicons name="wallet" size={28} color="#1a73e8" />
          </View>
          <Text style={styles.quickActionLabel} numberOfLines={2}>
            My Wallet
          </Text>
        </TouchableOpacity>

        {/* New Group */}
        <TouchableOpacity
          style={[styles.quickActionItem, disabled && { opacity: 0.5 }]}
          activeOpacity={0.8}
          onPress={onCreateGroupPress}
          disabled={disabled}
        >
          <View style={[styles.quickActionIconContainer, { backgroundColor: '#f3e5f5' }]}>
            <Ionicons name="people" size={28} color="#7b1fa2" />
          </View>
          <Text style={styles.quickActionLabel} numberOfLines={2}>
            New Group
          </Text>
        </TouchableOpacity>

        {/* Settle Up */}
        <TouchableOpacity
          style={[styles.quickActionItem, disabled && { opacity: 0.5 }]}
          activeOpacity={0.8}
          onPress={() => router.push('/settle-up')}
          disabled={disabled}
        >
          <View style={[styles.quickActionIconContainer, { backgroundColor: '#fce8e6' }]}>
            <Ionicons name="checkmark-circle" size={28} color="#c5221f" />
          </View>
          <Text style={styles.quickActionLabel} numberOfLines={2}>
            Settle Up
          </Text>
        </TouchableOpacity>

        {/* Ledger */}
        <TouchableOpacity
          style={[styles.quickActionItem, disabled && { opacity: 0.5 }]}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/activity')}
          disabled={disabled}
        >
          <View style={[styles.quickActionIconContainer, { backgroundColor: '#fef7e0' }]}>
            <Ionicons name="receipt" size={28} color="#b06000" />
          </View>
          <Text style={styles.quickActionLabel} numberOfLines={2}>
            Ledger
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  headerRow: {
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
    textTransform: 'none',
    letterSpacing: 0,
    marginBottom: 0,
    marginLeft: 0,
  },
  quickActionsScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  quickActionItem: {
    alignItems: 'center',
    width: 72,
    gap: 6,
  },
  quickActionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.onSurface,
    textAlign: 'center',
  },
});
