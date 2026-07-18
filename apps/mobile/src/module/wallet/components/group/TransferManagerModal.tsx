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
  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          <Pressable style={[styles.modalContent, { maxHeight: '80%' }]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              <Text style={styles.modalTitle}>Transfer Manager Role</Text>
              <Text style={localStyles.modalSub}>
                Select a group member to transfer the wallet manager role to.
              </Text>

              <Text style={styles.inputLabel}>Choose Wallet Manager</Text>
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
                        newManagerId === m.userId && styles.managerOptionActive,
                      ]}
                      onPress={() => setNewManagerId(m.userId)}
                    >
                      <Text
                        style={[
                          styles.managerOptionText,
                          newManagerId === m.userId && styles.managerOptionTextActive,
                        ]}
                      >
                        {m.name}
                        {m.userId === currentUserId ? ' (You)' : ''}
                      </Text>
                      {newManagerId === m.userId && (
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
              </View>

              <View style={[styles.modalActions, { marginTop: 16 }]}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSaveBtn} onPress={onSave} disabled={isPending}>
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
