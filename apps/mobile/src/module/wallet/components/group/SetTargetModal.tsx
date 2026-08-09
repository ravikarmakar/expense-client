import React from 'react';
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  View,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL } from '../../../../constants/theme';
import { walletStyles as styles } from '../../../groups/styles/group.styles';
import { useTheme } from '../../../../context/ThemeContext';

interface SetTargetModalProps {
  visible: boolean;
  onClose: () => void;
  targetContribution: number;
  targetExpiresAt: string | null;
  newTarget: string;
  setNewTarget: (target: string) => void;
  durationMode: '4_DAYS' | '1_WEEK' | '2_WEEKS' | '1_MONTH' | 'CUSTOM';
  setDurationMode: (mode: '4_DAYS' | '1_WEEK' | '2_WEEKS' | '1_MONTH' | 'CUSTOM') => void;
  customDate: string;
  setCustomDate: (date: string) => void;
  onSave: () => void;
  isPending: boolean;
  onShowRules: () => void;
}

export function SetTargetModal({
  visible,
  onClose,
  targetContribution,
  targetExpiresAt,
  newTarget,
  setNewTarget,
  durationMode,
  setDurationMode,
  customDate,
  setCustomDate,
  onSave,
  isPending,
  onShowRules,
}: SetTargetModalProps) {
  const { isDark } = useTheme();

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          <Pressable
            style={[
              styles.modalContent,
              { maxHeight: '80%' },
              isDark && {
                backgroundColor: '#101917',
                borderColor: '#1E2F2B',
              },
            ]}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              <Text style={[styles.modalTitle, isDark && { color: '#F9FAFB' }]}>
                Set Target Contribution
              </Text>

              <Text style={[styles.inputLabel, isDark && { color: '#9CA3AF' }]}>
                Target Contribution ({CURRENCY_SYMBOL})
              </Text>
              {targetContribution > 0 ? (
                <View
                  style={[
                    localStyles.lockedTargetContainer,
                    isDark && {
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  ]}
                >
                  <Ionicons
                    name="lock-closed"
                    size={16}
                    color={isDark ? '#9CA3AF' : COLORS.outline}
                  />
                  <Text style={[localStyles.lockedTargetText, isDark && { color: '#F9FAFB' }]}>
                    {targetContribution} (Locked)
                  </Text>
                  <TouchableOpacity onPress={onShowRules} style={{ padding: 4, marginLeft: 6 }}>
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color={isDark ? '#34D399' : COLORS.primary}
                    />
                  </TouchableOpacity>
                  {targetExpiresAt && (
                    <Text style={[localStyles.lockedExpiresText, isDark && { color: '#9CA3AF' }]}>
                      Expires:{' '}
                      {new Date(targetExpiresAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </Text>
                  )}
                </View>
              ) : (
                <>
                  <TextInput
                    style={[
                      styles.textInput,
                      isDark && {
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        borderColor: 'rgba(255, 255, 255, 0.12)',
                        color: '#F9FAFB',
                      },
                    ]}
                    value={newTarget}
                    onChangeText={(val) => {
                      if (/^\d{0,7}\.?\d{0,2}$/.test(val)) {
                        setNewTarget(val);
                      }
                    }}
                    keyboardType="decimal-pad"
                    placeholder="e.g. 500"
                    placeholderTextColor={
                      isDark ? 'rgba(255, 255, 255, 0.4)' : COLORS.outlineVariant
                    }
                  />

                  <Text
                    style={[styles.inputLabel, { marginTop: 12 }, isDark && { color: '#9CA3AF' }]}
                  >
                    Target Duration
                  </Text>
                  <View style={localStyles.presetsRow}>
                    {(['4_DAYS', '1_WEEK', '2_WEEKS', '1_MONTH', 'CUSTOM'] as const).map((mode) => (
                      <TouchableOpacity
                        key={mode}
                        style={[
                          localStyles.presetButton,
                          isDark && {
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                          },
                          durationMode === mode && localStyles.presetButtonActive,
                          durationMode === mode &&
                            isDark && {
                              backgroundColor: 'rgba(52, 211, 153, 0.18)',
                              borderColor: '#34D399',
                            },
                        ]}
                        onPress={() => setDurationMode(mode)}
                      >
                        <Text
                          style={[
                            localStyles.presetText,
                            isDark && { color: '#9CA3AF' },
                            durationMode === mode && localStyles.presetTextActive,
                            durationMode === mode && isDark && { color: '#34D399' },
                          ]}
                        >
                          {mode === '4_DAYS'
                            ? '4 Days'
                            : mode === '1_WEEK'
                              ? '1 Week'
                              : mode === '2_WEEKS'
                                ? '2 Weeks'
                                : mode === '1_MONTH'
                                  ? '1 Month'
                                  : 'Custom'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {durationMode === 'CUSTOM' && (
                    <TextInput
                      style={[
                        styles.textInput,
                        { marginTop: 8 },
                        isDark && {
                          backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          borderColor: 'rgba(255, 255, 255, 0.12)',
                          color: '#F9FAFB',
                        },
                      ]}
                      value={customDate}
                      onChangeText={setCustomDate}
                      placeholder="YYYY-MM-DD (e.g. 2026-08-31)"
                      placeholderTextColor={
                        isDark ? 'rgba(255, 255, 255, 0.4)' : COLORS.outlineVariant
                      }
                    />
                  )}

                  <Text style={[localStyles.expirationPreviewText, isDark && { color: '#9CA3AF' }]}>
                    Expires on:{' '}
                    {(() => {
                      const date = new Date();
                      if (durationMode === '4_DAYS') {
                        date.setDate(date.getDate() + 4);
                      } else if (durationMode === '1_WEEK') {
                        date.setDate(date.getDate() + 7);
                      } else if (durationMode === '2_WEEKS') {
                        date.setDate(date.getDate() + 14);
                      } else if (durationMode === '1_MONTH') {
                        date.setDate(date.getDate() + 30);
                      } else if (durationMode === 'CUSTOM') {
                        const custom = new Date(customDate);
                        if (!isNaN(custom.getTime())) {
                          return custom.toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          });
                        }
                        return 'Invalid Date';
                      }
                      return date.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      });
                    })()}
                  </Text>
                </>
              )}

              <View style={[styles.modalActions, { marginTop: 24 }]}>
                <TouchableOpacity
                  style={[
                    styles.modalCancelBtn,
                    isDark && {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                    },
                  ]}
                  onPress={onClose}
                >
                  <Text style={[styles.modalCancelText, isDark && { color: '#9CA3AF' }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalSaveBtn, isDark && { backgroundColor: '#059669' }]}
                  onPress={onSave}
                  disabled={isPending}
                >
                  {isPending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalSaveText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  lockedTargetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginTop: 6,
  },
  lockedTargetText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  lockedExpiresText: {
    fontSize: 11,
    color: COLORS.outline,
    marginLeft: 'auto',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  presetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surface,
  },
  presetButtonActive: {
    backgroundColor: COLORS.primaryFixed,
    borderColor: COLORS.primary,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.outline,
  },
  presetTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  expirationPreviewText: {
    fontSize: 11,
    color: COLORS.outline,
    marginTop: 8,
    fontWeight: '600',
  },
});
