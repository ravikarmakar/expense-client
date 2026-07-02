import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import {
  useUpdateGroup,
  clientCreateGroupSchema,
  getErrorMessage,
  GROUP_TYPES,
  type Group,
  type GroupType,
} from '@workspace/api';

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

interface EditGroupModalProps {
  visible: boolean;
  onClose: () => void;
  group: Group;
  onSuccess?: () => void;
}

export function EditGroupModal({ visible, onClose, group, onSuccess }: EditGroupModalProps) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description ?? '');
  const [type, setType] = useState<GroupType>((group.type as GroupType) ?? 'Other');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const updateGroup = useUpdateGroup();

  // Reset fields when group changes or modal opens
  useEffect(() => {
    if (visible) {
      setName(group.name);
      setDescription(group.description ?? '');
      setType((group.type as GroupType) ?? 'Other');
      setIsTypeDropdownOpen(false);
      setErrorMessage('');
    }
  }, [visible, group]);

  const handleClose = () => {
    setErrorMessage('');
    onClose();
  };

  const handleSubmit = () => {
    setErrorMessage('');
    const validation = clientCreateGroupSchema
      .pick({ name: true, description: true, emoji: true, type: true })
      .safeParse({
        name,
        description: description.trim() || undefined,
        emoji: TYPE_EMOJIS[type] || '👥',
        type,
      });

    if (!validation.success) {
      setErrorMessage(validation.error.issues[0].message);
      return;
    }

    updateGroup.mutate(
      {
        id: group.id,
        name: name.trim(),
        description: description.trim() || undefined,
        emoji: TYPE_EMOJIS[type] || '👥',
        type,
      },
      {
        onSuccess: () => {
          Alert.alert('Success! 🎉', 'Group updated successfully.');
          handleClose();
          onSuccess?.();
        },
        onError: (err) => {
          setErrorMessage(getErrorMessage(err, 'Failed to update group.'));
        },
      }
    );
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />

        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.sheetTitle}>Edit Group</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Error banner */}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={COLORS.error} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.stepContent}
          >
            <Text style={styles.inputLabel}>Group Name *</Text>
            <View style={styles.inputRow}>
              <Ionicons
                name="people-outline"
                size={18}
                color={COLORS.outline}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="e.g. Europe Trip 2024"
                placeholderTextColor={COLORS.outlineVariant}
                maxLength={50}
              />
              <Text style={styles.charCount}>{name.length}/50</Text>
            </View>

            <Text style={styles.inputLabel}>Description (optional)</Text>
            <View style={[styles.inputRow, styles.inputRowMultiline]}>
              <TextInput
                style={[styles.textInput, styles.textInputMultiline]}
                value={description}
                onChangeText={setDescription}
                placeholder="What is this group for?"
                placeholderTextColor={COLORS.outlineVariant}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>

            {/* Group Type dropdown */}
            <Text style={styles.inputLabel}>Group Type</Text>
            <View style={styles.dropdownWrapper}>
              <TouchableOpacity
                style={styles.dropdownHeader}
                onPress={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                activeOpacity={0.8}
              >
                <Text style={styles.dropdownHeaderText}>
                  {TYPE_EMOJIS[type]} {type}
                </Text>
                <Ionicons
                  name={isTypeDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={COLORS.outline}
                />
              </TouchableOpacity>

              {isTypeDropdownOpen && (
                <View style={styles.dropdownList}>
                  {GROUP_TYPES.map((t) => {
                    const isSelected = type === t;
                    return (
                      <TouchableOpacity
                        key={t}
                        style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                        onPress={() => {
                          setType(t);
                          setIsTypeDropdownOpen(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.dropdownItemLabel,
                            isSelected && styles.dropdownItemLabelActive,
                          ]}
                        >
                          {TYPE_EMOJIS[t]} {t}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark" size={16} color={COLORS.primary} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                (name.trim().length < 3 || updateGroup.isPending) && styles.primaryBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={name.trim().length < 3 || updateGroup.isPending}
              activeOpacity={0.85}
            >
              {updateGroup.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={[styles.primaryBtnText, { marginLeft: 8 }]}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '92%',
    flexShrink: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.outlineVariant,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.errorContainer,
    marginHorizontal: 24,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '600',
  },
  stepContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
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
  emojiRow: {
    paddingBottom: 16,
    gap: 8,
  },
  emojiBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiBtnSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondaryFixed,
  },
  emojiText: { fontSize: 22 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    marginBottom: 16,
  },
  inputRowMultiline: {
    height: 80,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  inputIcon: { marginRight: 10 },
  textInput: {
    flex: 1,
    color: COLORS.onSurface,
    fontSize: 15,
    fontWeight: '500',
  },
  textInputMultiline: {
    height: '100%',
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: COLORS.outline,
  },
  dropdownWrapper: {
    marginBottom: 20,
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
  dropdownHeaderText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.onSurface,
  },
  dropdownList: {
    marginTop: 6,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    padding: 6,
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
  dropdownItemLabel: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
  dropdownItemLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 20,
    width: '100%',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    marginTop: 8,
  },
  primaryBtnDisabled: { opacity: 0.5, elevation: 0 },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
