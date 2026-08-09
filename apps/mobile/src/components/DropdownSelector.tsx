import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface DropdownSelectorProps<T> {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  selectedItem: T | null;
  placeholder: string;
  options: readonly T[];
  renderHeaderContent: (item: T) => React.ReactNode;
  renderOptionContent: (item: T) => React.ReactNode;
  getOptionKey: (item: T) => string;
  onSelect: (item: T) => void;
  variant?: 'light' | 'dark';
}

export function DropdownSelector<T>({
  label,
  isOpen,
  onToggle,
  selectedItem,
  placeholder,
  options,
  renderHeaderContent,
  renderOptionContent,
  getOptionKey,
  onSelect,
  variant = 'light',
}: DropdownSelectorProps<T>) {
  const isDark = variant === 'dark';

  return (
    <View style={styles.container}>
      <Text style={[styles.inputLabel, isDark && { color: '#9CA3AF' }]}>{label}</Text>
      <View style={styles.dropdownWrapper}>
        <TouchableOpacity
          style={[
            styles.dropdownHeader,
            isDark && {
              backgroundColor: '#101917',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            },
          ]}
          onPress={onToggle}
          activeOpacity={0.8}
        >
          <View style={styles.dropdownHeaderLeft}>
            {selectedItem ? (
              renderHeaderContent(selectedItem)
            ) : (
              <Text style={[styles.placeholderText, isDark && { color: '#74817B' }]}>
                {placeholder}
              </Text>
            )}
          </View>
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={isDark ? '#9CA3AF' : COLORS.outline}
          />
        </TouchableOpacity>

        {isOpen && (
          <ScrollView
            style={[
              styles.dropdownList,
              isDark && {
                backgroundColor: '#131D1A',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              },
            ]}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            {options.map((option) => {
              const key = getOptionKey(option);
              const isSelected = selectedItem ? getOptionKey(selectedItem) === key : false;
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.dropdownItem,
                    isDark && { backgroundColor: 'transparent' },
                    isSelected &&
                      (isDark
                        ? { backgroundColor: 'rgba(16, 185, 129, 0.15)' }
                        : styles.dropdownItemActive),
                  ]}
                  onPress={() => onSelect(option)}
                  activeOpacity={0.7}
                >
                  <View style={styles.dropdownItemLeft}>{renderOptionContent(option)}</View>
                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={isDark ? '#10B981' : COLORS.primary}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  dropdownWrapper: {
    position: 'relative',
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceContainerLow,
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  dropdownHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  placeholderText: {
    fontSize: 15,
    color: COLORS.outlineVariant,
    fontWeight: '500',
  },
  dropdownList: {
    marginTop: 6,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    padding: 6,
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.surfaceContainer,
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
});
