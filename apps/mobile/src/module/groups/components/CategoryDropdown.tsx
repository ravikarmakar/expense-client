import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { getCategoryVisuals } from '../../../constants/categories';
import { styles } from '../styles/add-expense.styles';
import { useCategories, type ExpenseCategory } from '@workspace/api';
import { useRouter } from 'expo-router';

interface CategoryDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  category: ExpenseCategory | null;
  onSelect: (cat: ExpenseCategory) => void;
  groupId?: string;
  variant?: 'light' | 'dark';
}

const CategoryIcon = ({
  name,
  color,
  size = 16,
}: {
  name: string;
  color: string;
  size?: number;
}) => {
  const isCustom = name.endsWith('-outline');
  if (isCustom) {
    return <Ionicons name={name as never} size={size} color={color} />;
  }
  return <MaterialIcons name={name as never} size={size} color={color} />;
};

export const CategoryDropdown = React.memo(function CategoryDropdown({
  isOpen,
  onToggle,
  category,
  onSelect,
  groupId,
  variant = 'light',
}: CategoryDropdownProps) {
  const router = useRouter();
  const { data } = useCategories(groupId);

  const customCategories = data?.custom || [];

  const allCategories = React.useMemo(() => {
    const standard = data?.standard || [
      'Food',
      'Transport',
      'Shopping',
      'Entertainment',
      'Bills',
      'Health',
      'Travel',
      'Other',
    ];
    return [...standard, ...customCategories.map((c) => c.name)];
  }, [data, customCategories]);

  const quickCategories = React.useMemo(() => {
    return allCategories.slice(0, 8);
  }, [allCategories]);

  const selectedVisuals = category ? getCategoryVisuals(category, customCategories) : null;
  const isDark = variant === 'dark';

  return (
    <>
      <Text style={[styles.inputLabel, isDark && { color: '#74817B' }]}>Category *</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={localStyles.chipsScroll}
        contentContainerStyle={localStyles.chipsContainer}
        keyboardShouldPersistTaps="handled"
      >
        {quickCategories.map((catName) => {
          const isSelected = category === catName;
          const visuals = getCategoryVisuals(catName, customCategories);
          return (
            <TouchableOpacity
              key={catName}
              style={[
                localStyles.chipItem,
                isDark && {
                  backgroundColor: isSelected ? '#131D1A' : '#101917',
                  borderColor: isSelected ? '#10B981' : 'rgba(255, 255, 255, 0.16)',
                },
                !isDark &&
                  isSelected && {
                    backgroundColor: COLORS.primaryFixed,
                    borderColor: COLORS.primary,
                  },
              ]}
              onPress={() => onSelect(catName)}
              activeOpacity={0.8}
            >
              <CategoryIcon
                name={visuals.icon}
                size={14}
                color={
                  isSelected
                    ? isDark
                      ? '#10B981'
                      : COLORS.primary
                    : isDark
                      ? 'rgba(255, 255, 255, 0.65)'
                      : COLORS.outline
                }
              />
              <Text
                style={[
                  localStyles.chipText,
                  isDark && { color: isSelected ? '#10B981' : 'rgba(255, 255, 255, 0.65)' },
                  !isDark && isSelected && { color: COLORS.primary, fontWeight: '700' },
                ]}
              >
                {catName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View
        style={[
          styles.dropdownWrapper,
          isDark && {
            backgroundColor: '#101917',
            borderColor: 'rgba(255, 255, 255, 0.12)',
            borderWidth: 1,
          },
        ]}
      >
        <TouchableOpacity style={styles.dropdownHeader} onPress={onToggle} activeOpacity={0.8}>
          <View style={styles.dropdownHeaderLeft}>
            {category && selectedVisuals ? (
              <>
                <View style={[styles.dropdownHeaderIcon, { backgroundColor: selectedVisuals.bg }]}>
                  <CategoryIcon
                    name={selectedVisuals.icon}
                    size={18}
                    color={selectedVisuals.color}
                  />
                </View>
                <Text style={[styles.dropdownHeaderText, isDark && { color: '#FFFFFF' }]}>
                  {category}
                </Text>
              </>
            ) : (
              <>
                <View
                  style={[
                    styles.dropdownHeaderIcon,
                    { backgroundColor: isDark ? '#131D1A' : COLORS.surfaceContainerLow },
                  ]}
                >
                  <Ionicons
                    name="apps"
                    size={18}
                    color={isDark ? 'rgba(255, 255, 255, 0.65)' : COLORS.outline}
                  />
                </View>
                <Text
                  style={[
                    styles.dropdownHeaderText,
                    { color: isDark ? 'rgba(255, 255, 255, 0.55)' : COLORS.outlineVariant },
                  ]}
                >
                  Select Category
                </Text>
              </>
            )}
          </View>
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={isDark ? 'rgba(255, 255, 255, 0.65)' : COLORS.outline}
          />
        </TouchableOpacity>

        {isOpen && (
          <ScrollView
            style={[
              styles.dropdownList,
              styles.categoryScroll,
              isDark && {
                backgroundColor: '#101917',
                borderTopColor: 'rgba(255, 255, 255, 0.16)',
              },
            ]}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            {allCategories.map((catName) => {
              const isSelected = category === catName;
              const visuals = getCategoryVisuals(catName, customCategories);
              return (
                <TouchableOpacity
                  key={catName}
                  style={[
                    styles.dropdownItem,
                    isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.04)' },
                    isSelected &&
                      (isDark
                        ? { backgroundColor: 'rgba(16, 185, 129, 0.15)' }
                        : styles.dropdownItemActive),
                  ]}
                  onPress={() => onSelect(catName)}
                  activeOpacity={0.8}
                >
                  <View style={styles.dropdownItemLeft}>
                    <View style={[styles.dropdownItemIcon, { backgroundColor: visuals.bg }]}>
                      <CategoryIcon name={visuals.icon} size={16} color={visuals.color} />
                    </View>
                    <Text
                      style={[
                        styles.dropdownItemLabel,
                        isDark && { color: '#ffffff' },
                        isSelected &&
                          (isDark
                            ? { color: '#10B981', fontWeight: '700' }
                            : styles.dropdownItemLabelActive),
                      ]}
                    >
                      {catName}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-sharp"
                      size={18}
                      color={isDark ? '#10B981' : COLORS.primary}
                    />
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Manage Categories Action Row */}
            {!groupId && (
              <TouchableOpacity
                style={[
                  styles.dropdownManageBtn,
                  isDark && {
                    backgroundColor: '#131D1A',
                    borderTopColor: 'rgba(255, 255, 255, 0.06)',
                  },
                ]}
                onPress={() => {
                  onToggle();
                  router.push('/categories');
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="settings-outline"
                  size={14}
                  color={isDark ? '#10B981' : COLORS.primary}
                />
                <Text style={[styles.dropdownManageBtnText, isDark && { color: '#10B981' }]}>
                  Manage Custom Categories
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
});

const localStyles = StyleSheet.create({
  chipsScroll: {
    marginBottom: 14,
  },
  chipsContainer: {
    gap: 8,
    paddingHorizontal: 4,
  },
  chipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2ece6',
    backgroundColor: '#f4f6f5',
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#6d7a72',
  },
});
