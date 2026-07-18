import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
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
}: CategoryDropdownProps) {
  const router = useRouter();
  const { data } = useCategories();

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

  const selectedVisuals = category ? getCategoryVisuals(category, customCategories) : null;

  return (
    <>
      <Text style={styles.inputLabel}>Category *</Text>
      <View style={styles.dropdownWrapper}>
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
            keyboardShouldPersistTaps="handled"
          >
            {allCategories.map((catName) => {
              const isSelected = category === catName;
              const visuals = getCategoryVisuals(catName, customCategories);
              return (
                <TouchableOpacity
                  key={catName}
                  style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
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
                        isSelected && styles.dropdownItemLabelActive,
                      ]}
                    >
                      {catName}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-sharp" size={18} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Manage Categories Action Row */}
            <TouchableOpacity
              style={styles.dropdownManageBtn}
              onPress={() => {
                onToggle();
                router.push('/categories');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={14} color={COLORS.primary} />
              <Text style={styles.dropdownManageBtnText}>Manage Custom Categories</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </>
  );
});
