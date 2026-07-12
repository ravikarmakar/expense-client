import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { GROUP_TYPES, useCreateGroupController, type GroupType } from '@workspace/api';
import { BottomSheetModal } from '../../../components/BottomSheetModal';
import { FormInput } from '../../../components/FormInput';
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
    errorMessage,
    isPending,
    handleClose,
    handleSubmit,
    handleChangeName,
    handleChangeDescription,
    handleChangeType,
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

        {/* Group Type Pill Selector */}
        <Text style={styles.inputLabel}>Group Type</Text>
        <View style={{ marginBottom: 12 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeSelectorRow}
          >
            {(GROUP_TYPES as unknown as GroupType[]).map((t) => {
              const isSelected = type === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.typePill, isSelected && styles.typePillSelected]}
                  onPress={() => handleChangeType(t)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.typePillEmoji}>{TYPE_EMOJIS[t]}</Text>
                  <Text style={[styles.typePillText, isSelected && styles.typePillTextSelected]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

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
