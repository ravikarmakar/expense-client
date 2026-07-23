import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, CURRENCY_SYMBOL } from '../constants/theme';
import { getCategoryVisuals } from '../constants/categories';
import { useCategories } from '@workspace/api';
import { styles as modalStyles } from '../module/groups/styles/add-expense.styles';

interface SuccessCardProps {
  title: string;
  amount: number;
  category: string;
  groupName?: string;
  variant?: 'light' | 'dark';
}

export function SuccessCard({
  title,
  amount,
  category,
  groupName,
  variant = 'light',
}: SuccessCardProps) {
  const isDark = variant === 'dark';
  const { data: categoriesData } = useCategories();
  const customCategories = categoriesData?.custom || [];
  const config = getCategoryVisuals(category, customCategories);

  const renderContent = () => (
    <>
      <View style={modalStyles.successCardRow}>
        <View style={[modalStyles.successIconBg, { backgroundColor: config.bg }]}>
          {config.lib === 'Ionicons' ? (
            <Ionicons name={config.icon as never} size={20} color={config.color} />
          ) : (
            <MaterialIcons name={config.icon as never} size={20} color={config.color} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={[modalStyles.successExpenseTitle, isDark && { color: '#FFFFFF' }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text style={[modalStyles.successExpenseCategory, isDark && { color: '#74817B' }]}>
            {category}
          </Text>
        </View>
        <Text style={[modalStyles.successExpenseAmount, isDark && { color: '#FFFFFF' }]}>
          {CURRENCY_SYMBOL}
          {amount.toFixed(2)}
        </Text>
      </View>

      {groupName && (
        <View
          style={[
            modalStyles.successGroupRow,
            isDark && { borderTopColor: 'rgba(255, 255, 255, 0.06)' },
          ]}
        >
          <Ionicons name="people" size={14} color={isDark ? '#74817B' : COLORS.outline} />
          <Text
            style={[modalStyles.successGroupText, isDark && { color: '#74817B' }]}
            numberOfLines={1}
          >
            Split in{' '}
            <Text style={{ fontWeight: '700', color: isDark ? '#FFFFFF' : COLORS.onSurface }}>
              {groupName}
            </Text>
          </Text>
        </View>
      )}
    </>
  );

  return (
    <View
      style={[
        modalStyles.successCard,
        isDark && {
          backgroundColor: 'transparent',
          borderColor: 'rgba(255, 255, 255, 0.06)',
          borderWidth: 1,
          padding: 0,
          overflow: 'hidden',
        },
      ]}
    >
      {isDark ? (
        <LinearGradient
          colors={['rgba(34, 48, 40, 0.65)', 'rgba(20, 30, 24, 0.85)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ padding: 16 }}
        >
          {renderContent()}
        </LinearGradient>
      ) : (
        renderContent()
      )}
    </View>
  );
}
