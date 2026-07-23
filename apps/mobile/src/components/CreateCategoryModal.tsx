import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCreateCategory } from '@workspace/api';
import { COLORS } from '../constants/theme';
import { BottomSheetModal } from './BottomSheetModal';
import { TactileButton } from './TactileButton';
import { useTheme } from '../context/ThemeContext';

const ICON_OPTIONS = [
  'restaurant-outline',
  'cart-outline',
  'car-outline',
  'airplane-outline',
  'home-outline',
  'flash-outline',
  'game-controller-outline',
  'film-outline',
  'fitness-outline',
  'medical-outline',
  'paw-outline',
  'gift-outline',
  'book-outline',
  'briefcase-outline',
  'school-outline',
  'musical-notes-outline',
  'cafe-outline',
  'construct-outline',
  'heart-outline',
  'shirt-outline',
  'laptop-outline',
  'wifi-outline',
  'bus-outline',
  'wallet-outline',
  'fast-food-outline',
  'sparkles-outline',
  'subway-outline',
  'cash-outline',
];

const COLOR_OPTIONS = [
  '#E53935', // Red
  '#D81B60', // Pink
  '#8E24AA', // Purple
  '#5E35B1', // Deep Purple
  '#3F51B5', // Indigo
  '#1E88E5', // Blue
  '#0288D1', // Light Blue
  '#00ACC1', // Cyan
  '#00897B', // Teal
  '#10B981', // Emerald
  '#43A047', // Green
  '#7CB342', // Lime
  '#AFB42B', // Olive
  '#FDD835', // Yellow
  '#F59E0B', // Amber
  '#FB8C00', // Orange
  '#F4511E', // Deep Orange
  '#EF4444', // Crimson
  '#EC4899', // Hot Pink
  '#D946EF', // Fuchsia
  '#A855F7', // Violet
  '#6366F1', // Royal Blue
  '#3B82F6', // Sky Blue
  '#06B6D4', // Aqua
  '#14B8A6', // Mint
  '#84CC16', // Chartreuse
  '#EAB308', // Gold
  '#F97316', // Coral
  '#6D4C41', // Brown
  '#78716C', // Stone
  '#546E7A', // Slate
  '#374151', // Charcoal
];

interface CreateCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  groupId?: string;
}

export function CreateCategoryModal({
  visible,
  onClose,
  onSuccess,
  groupId,
}: CreateCategoryModalProps) {
  const createCategory = useCreateCategory();
  const { isDark } = useTheme();

  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [showCustomColorInput, setShowCustomColorInput] = useState(false);
  const [customHexInput, setCustomHexInput] = useState('');

  const handleCreate = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Required', 'Please enter a category name.');
      return;
    }

    createCategory.mutate(
      {
        name: trimmedName,
        icon: selectedIcon,
        color: selectedColor,
        groupId,
      },
      {
        onSuccess: () => {
          setName('');
          setSelectedIcon(ICON_OPTIONS[0]);
          setSelectedColor(COLOR_OPTIONS[0]);
          setCustomHexInput('');
          setShowCustomColorInput(false);
          Alert.alert('Success', `Category "${trimmedName}" created successfully!`);
          onClose();
          onSuccess?.();
        },
        onError: (err) => {
          Alert.alert('Error', err.message || 'Failed to create category.');
        },
      }
    );
  };

  const isFormDisabled = !name.trim() || createCategory.isPending;

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title="Add Custom Category"
      variant={isDark ? 'dark' : 'light'}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.formContainer}>
          <Text style={[styles.inputLabel, { color: isDark ? '#A8B3AE' : COLORS.outline }]}>
            Category Name
          </Text>
          <View
            style={[
              styles.inputContainer,
              isDark && {
                backgroundColor: '#101917',
                borderColor: 'rgba(255, 255, 255, 0.12)',
              },
            ]}
          >
            <TextInput
              style={[styles.textInput, isDark && { color: '#ffffff' }]}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Pets, Hobbies, Rent"
              placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.3)' : COLORS.outlineVariant}
              maxLength={20}
              editable={!createCategory.isPending}
            />
          </View>

          {/* Avatar-Style Icon Selection (4-Row Scrollable Box) */}
          <Text style={[styles.inputLabel, { color: isDark ? '#A8B3AE' : COLORS.outline }]}>
            Select Icon
          </Text>
          <View
            style={[
              styles.iconScrollBox,
              isDark && {
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              },
            ]}
          >
            <ScrollView
              style={{ maxHeight: 222 }}
              contentContainerStyle={styles.gridContainer}
              nestedScrollEnabled
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="always"
            >
              {ICON_OPTIONS.map((icon) => {
                const isSelected = selectedIcon === icon;
                return (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.avatarIconItem,
                      isDark && {
                        backgroundColor: '#101917',
                        borderColor: 'rgba(255, 255, 255, 0.08)',
                      },
                      isSelected && {
                        borderColor: selectedColor,
                        backgroundColor: isDark ? `${selectedColor}25` : `${selectedColor}18`,
                        borderWidth: 2.5,
                      },
                    ]}
                    onPress={() => {
                      setSelectedIcon(icon);
                      Keyboard.dismiss();
                    }}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name={icon as never}
                      size={22}
                      color={isSelected ? selectedColor : isDark ? '#9CA3AF' : COLORS.outline}
                    />
                    {isSelected && (
                      <View style={[styles.checkBadge, { backgroundColor: selectedColor }]}>
                        <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Color Palette Selection (Scrollable Box + Custom Color Input) */}
          <View style={styles.colorHeaderRow}>
            <Text
              style={[
                styles.inputLabel,
                { color: isDark ? '#A8B3AE' : COLORS.outline, marginTop: 0 },
              ]}
            >
              Select Color
            </Text>
            <TouchableOpacity
              onPress={() => setShowCustomColorInput(!showCustomColorInput)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.customToggleText, { color: isDark ? '#10B981' : COLORS.primary }]}
              >
                {showCustomColorInput ? 'Hide Custom Hex' : '+ Custom Hex Color'}
              </Text>
            </TouchableOpacity>
          </View>

          {showCustomColorInput && (
            <View
              style={[
                styles.customColorRow,
                isDark ? styles.customColorDark : styles.customColorLight,
              ]}
            >
              <View
                style={[
                  styles.customColorPreview,
                  {
                    backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(selectedColor)
                      ? selectedColor
                      : '#10B981',
                  },
                ]}
              />
              <Text style={[styles.hashPrefix, { color: isDark ? '#10B981' : COLORS.primary }]}>
                #
              </Text>
              <TextInput
                style={[styles.customHexInput, { color: isDark ? '#FFFFFF' : '#191C1D' }]}
                value={customHexInput}
                onChangeText={(val) => {
                  const cleaned = val.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
                  setCustomHexInput(cleaned);
                  if (cleaned.length === 6) {
                    setSelectedColor(`#${cleaned}`);
                  }
                }}
                placeholder="10B981"
                placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.3)' : '#a0aec0'}
                maxLength={6}
                autoCapitalize="characters"
              />
            </View>
          )}

          <View
            style={[
              styles.iconScrollBox,
              isDark && {
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              },
            ]}
          >
            <ScrollView
              style={{ maxHeight: 152 }}
              contentContainerStyle={styles.colorGridContainer}
              nestedScrollEnabled
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="always"
            >
              {COLOR_OPTIONS.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorItem,
                      { backgroundColor: color },
                      isSelected && styles.colorItemActive,
                    ]}
                    onPress={() => {
                      setSelectedColor(color);
                      Keyboard.dismiss();
                    }}
                    activeOpacity={0.7}
                  >
                    {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <TactileButton
            title="Create Category"
            onPress={handleCreate}
            loading={createCategory.isPending}
            disabled={isFormDisabled}
            provider="emerald"
            style={styles.createBtn}
          />
        </View>
      </ScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },
  formContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  createBtn: {
    marginTop: 8,
    height: 52,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    paddingLeft: 2,
    marginTop: 16,
  },
  inputContainer: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    justifyContent: 'center',
    marginBottom: 4,
  },
  textInput: {
    color: COLORS.onSurface,
    fontSize: 15,
    fontWeight: '600',
    height: '100%',
  },
  iconScrollBox: {
    borderRadius: 20,
    padding: 10,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    marginBottom: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
  },
  avatarIconItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    position: 'relative',
  },
  checkBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  colorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  customToggleText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  customColorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  customColorLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e2ece6',
  },
  customColorDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  customColorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  hashPrefix: {
    fontSize: 18,
    fontWeight: '800',
    marginRight: 4,
  },
  customHexInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  colorGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
  },
  colorItem: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorItemActive: {
    borderWidth: 3,
    borderColor: '#ffffff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
