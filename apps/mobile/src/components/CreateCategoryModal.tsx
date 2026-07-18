import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCreateCategory } from '@workspace/api';
import { COLORS } from '../constants/theme';
import { ModalContainer } from './ModalContainer';
import { LoadingButton } from './LoadingButton';

const ICON_OPTIONS = [
  'fitness-outline',
  'paw-outline',
  'gift-outline',
  'game-controller-outline',
  'book-outline',
  'briefcase-outline',
  'musical-notes-outline',
  'home-outline',
  'construct-outline',
  'heart-outline',
];

const COLOR_OPTIONS = [
  '#E53935', // Red
  '#D81B60', // Pink
  '#8E24AA', // Purple
  '#5E35B1', // Deep Purple
  '#1E88E5', // Blue
  '#00ACC1', // Cyan
  '#43A047', // Green
  '#F4511E', // Orange
];

interface CreateCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateCategoryModal({ visible, onClose, onSuccess }: CreateCategoryModalProps) {
  const createCategory = useCreateCategory();

  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);

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
      },
      {
        onSuccess: () => {
          setName('');
          setSelectedIcon(ICON_OPTIONS[0]);
          setSelectedColor(COLOR_OPTIONS[0]);
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
    <ModalContainer
      visible={visible}
      onClose={onClose}
      title="Add Custom Category"
      loading={createCategory.isPending}
    >
      <View style={styles.formContainer}>
        <Text style={styles.inputLabel}>Category Name</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Pets, Hobbies, Rent"
            placeholderTextColor={COLORS.outlineVariant}
            maxLength={20}
            editable={!createCategory.isPending}
          />
        </View>

        <Text style={styles.inputLabel}>Select Icon</Text>
        <View style={styles.gridContainer}>
          {ICON_OPTIONS.map((icon) => {
            const isSelected = selectedIcon === icon;
            return (
              <TouchableOpacity
                key={icon}
                style={[
                  styles.iconItem,
                  isSelected && {
                    borderColor: selectedColor,
                    backgroundColor: `${selectedColor}15`,
                  },
                ]}
                onPress={() => setSelectedIcon(icon)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={icon as never}
                  size={22}
                  color={isSelected ? selectedColor : COLORS.outline}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.inputLabel}>Select Color</Text>
        <View style={styles.colorGridContainer}>
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
                onPress={() => setSelectedColor(color)}
                activeOpacity={0.7}
              >
                {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
              </TouchableOpacity>
            );
          })}
        </View>

        <LoadingButton
          title="Create Category"
          onPress={handleCreate}
          loading={createCategory.isPending}
          disabled={isFormDisabled}
        />
      </View>
    </ModalContainer>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    paddingLeft: 4,
    marginTop: 16,
  },
  inputContainer: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    justifyContent: 'center',
    marginBottom: 8,
  },
  textInput: {
    color: COLORS.onSurface,
    fontSize: 15,
    fontWeight: '500',
    height: '100%',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
    justifyContent: 'flex-start',
  },
  iconItem: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
  },
  colorGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
    justifyContent: 'flex-start',
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorItemActive: {
    borderWidth: 3,
    borderColor: '#ffffff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});
