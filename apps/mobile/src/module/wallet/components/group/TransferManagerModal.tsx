import React from 'react';
import {
  Modal,
  Pressable,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/theme';
import { walletStyles as styles } from '../../../groups/styles/group.styles';
import { useTheme } from '../../../../context/ThemeContext';

interface TransferManagerModalProps {
  visible: boolean;
  onClose: () => void;
  members: Array<{
    userId: string;
    name: string;
  }>;
  currentManagerId?: string;
  currentUserId?: string;
  newManagerId: string;
  setNewManagerId: (id: string) => void;
  onSave: () => void;
  isPending: boolean;
}

export function TransferManagerModal({
  visible,
  onClose,
  members,
  currentManagerId,
  currentUserId,
  newManagerId,
  setNewManagerId,
  onSave,
  isPending,
}: TransferManagerModalProps) {
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
                Transfer Manager Role
              </Text>
              <Text style={[localStyles.modalSub, isDark && { color: '#9CA3AF' }]}>
                Select a group member to transfer the wallet manager role to.
              </Text>

              <Text style={[styles.inputLabel, isDark && { color: '#9CA3AF' }]}>
                Choose Wallet Manager
              </Text>
              <View style={styles.managerSelectBox}>
                {[...members]
                  .sort((a, b) => {
                    if (a.userId === currentManagerId) return -1;
                    if (b.userId === currentManagerId) return 1;
                    return 0;
                  })
                  .map((m) => (
                    <TouchableOpacity
                      key={m.userId}
                      style={[
                        styles.managerOption,
                        isDark && {
                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                          borderColor: 'rgba(255, 255, 255, 0.08)',
                        },
                        newManagerId === m.userId && styles.managerOptionActive,
                        newManagerId === m.userId &&
                          isDark && {
                            backgroundColor: 'rgba(52, 211, 153, 0.15)',
                            borderColor: '#34D399',
                          },
                      ]}
                      onPress={() => setNewManagerId(m.userId)}
                    >
                      <Text
                        style={[
                          styles.managerOptionText,
                          isDark && { color: '#F9FAFB' },
                          newManagerId === m.userId && styles.managerOptionTextActive,
                          newManagerId === m.userId && isDark && { color: '#34D399' },
                        ]}
                      >
                        {m.name}
                        {m.userId === currentUserId ? ' (You)' : ''}
                      </Text>
                      {newManagerId === m.userId && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={isDark ? '#34D399' : COLORS.primary}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
              </View>

              <View style={[styles.modalActions, { marginTop: 16 }]}>
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
                    <Text style={styles.modalSaveText}>Transfer</Text>
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
  modalSub: {
    fontSize: 13,
    color: COLORS.outline,
    marginBottom: 16,
    textAlign: 'center',
  },
});
