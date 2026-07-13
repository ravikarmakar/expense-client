import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { GROUP_TYPES, useCreateGroupController, type GroupType } from '@workspace/api';
import { BottomSheetModal } from '../../../components/BottomSheetModal';
import { FormInput } from '../../../components/FormInput';
import { DropdownSelector } from '../../../components/DropdownSelector';
import { createGroupStyles as styles } from '../styles/create-group.styles';

export const TYPE_EMOJIS: Record<GroupType, string> = {
  Roommates: '🏠',
  Travel: '✈️',
  Friends: '👥',
  Family: '🏠',
  Office: '💼',
  Event: '🎉',
  Couple: '👥',
  Study: '📚',
  'Food / Mess': '🍽️',
  Gaming: '🎮',
  Other: '👥',
};

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (groupId: string) => void;
}

export function CreateGroupModal({ visible, onClose, onSuccess }: CreateGroupModalProps) {
  const {
    name,
    description,
    type,
    isTypeDropdownOpen,
    errorMessage,
    isPending,
    handleClose,
    handleSubmit,
    handleChangeName,
    handleChangeDescription,
    handleChangeType,
    handleToggleTypeDropdown,
  } = useCreateGroupController({
    onSuccess,
    onClose,
  });

  return (
    <BottomSheetModal visible={visible} onClose={handleClose} title="Create Group">
      {/* Error Banner */}
      {errorMessage ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color={COLORS.error} />
          <View style={{ flex: 1 }}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        </View>
      ) : null}

      {/* Main Form */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.stepContent}
      >
        <FormInput
          label="Group Name *"
          value={name}
          onChangeText={handleChangeName}
          placeholder="e.g. Europe Trip 2024"
          icon="people-outline"
          maxLength={50}
          showCharCount
          autoFocus
        />

        <FormInput
          label="Description (optional)"
          value={description}
          onChangeText={handleChangeDescription}
          placeholder="What is this group for?"
          multiline
          numberOfLines={3}
          maxLength={200}
        />

        <DropdownSelector
          label="Group Type"
          isOpen={isTypeDropdownOpen}
          onToggle={handleToggleTypeDropdown}
          selectedItem={type}
          placeholder="Select Type"
          options={GROUP_TYPES}
          getOptionKey={(item) => item}
          onSelect={(item) => {
            handleChangeType(item);
          }}
          renderHeaderContent={(item) => (
            <Text style={styles.dropdownHeaderText}>
              {TYPE_EMOJIS[item]} {item}
            </Text>
          )}
          renderOptionContent={(item) => (
            <Text style={styles.dropdownItemLabel}>
              {TYPE_EMOJIS[item]} {item}
            </Text>
          )}
        />

        <TouchableOpacity
          style={[
            styles.primaryBtn,
            (name.trim().length < 3 || isPending) && styles.primaryBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={name.trim().length < 3 || isPending}
          activeOpacity={0.85}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.primaryBtnText}>Create Group</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </BottomSheetModal>
  );
}
