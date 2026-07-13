import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { styles } from '../styles/add-expense.styles';
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@workspace/api';

export const CATEGORY_CONFIG: Record<ExpenseCategory, { icon: string; bg: string; color: string }> =
  {
    Food: { icon: 'restaurant', bg: '#fff3e0', color: '#e65100' },
    Transport: { icon: 'directions-car', bg: '#e3f2fd', color: '#1565c0' },
    Shopping: { icon: 'shopping-bag', bg: '#fce4ec', color: '#c62828' },
    Entertainment: { icon: 'movie', bg: '#f3e5f5', color: '#6a1b9a' },
    Bills: { icon: 'receipt-long', bg: '#e8f5e9', color: '#2e7d32' },
    Health: { icon: 'favorite', bg: '#ffebee', color: '#b71c1c' },
    Travel: { icon: 'flight', bg: '#e0f7fa', color: '#00695c' },
    Other: { icon: 'more-horiz', bg: '#f5f5f5', color: '#424242' },
  };

interface CategoryDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  category: ExpenseCategory | null;
  onSelect: (cat: ExpenseCategory) => void;
}

export const CategoryDropdown = React.memo(function CategoryDropdown({
  isOpen,
  onToggle,
  category,
  onSelect,
}: CategoryDropdownProps) {
  return (
    <>
      <Text style={styles.inputLabel}>Category *</Text>
      <View style={styles.dropdownWrapper}>
        <TouchableOpacity style={styles.dropdownHeader} onPress={onToggle} activeOpacity={0.8}>
          <View style={styles.dropdownHeaderLeft}>
            {category ? (
              <>
                <View
                  style={[
                    styles.dropdownHeaderIcon,
                    { backgroundColor: CATEGORY_CONFIG[category].bg },
                  ]}
                >
                  <MaterialIcons
                    name={CATEGORY_CONFIG[category].icon as never}
                    size={18}
                    color={CATEGORY_CONFIG[category].color}
                  />
                </View>
                <Text style={styles.dropdownHeaderText}>{category}</Text>
              </>
            ) : (
              <>
                <View
                  style={[
                    styles.dropdownHeaderIcon,
                    { backgroundColor: COLORS.surfaceContainerLow },
                  ]}
                >
                  <Ionicons name="apps" size={18} color={COLORS.outline} />
                </View>
                <Text style={[styles.dropdownHeaderText, { color: COLORS.outlineVariant }]}>
                  Select Category
                </Text>
              </>
            )}
          </View>
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.outline}
          />
        </TouchableOpacity>

        {isOpen && (
          <ScrollView
            style={[styles.dropdownList, styles.categoryScroll]}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            {EXPENSE_CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              const cfg = CATEGORY_CONFIG[cat];
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                  onPress={() => onSelect(cat)}
                  activeOpacity={0.8}
                >
                  <View style={styles.dropdownItemLeft}>
                    <View style={[styles.dropdownItemIcon, { backgroundColor: cfg.bg }]}>
                      <MaterialIcons name={cfg.icon as never} size={16} color={cfg.color} />
                    </View>
                    <Text
                      style={[
                        styles.dropdownItemLabel,
                        isSelected && styles.dropdownItemLabelActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-sharp" size={18} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </>
  );
});
