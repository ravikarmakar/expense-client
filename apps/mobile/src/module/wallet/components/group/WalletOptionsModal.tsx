import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/theme';
import { walletStyles as styles } from '../../../groups/styles/group.styles';

interface WalletOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onTransferManager: () => void;
  onSetTarget: () => void;
  onShowRules: () => void;
}

export function WalletOptionsModal({
  visible,
  onClose,
  onTransferManager,
  onSetTarget,
  onShowRules,
}: WalletOptionsModalProps) {
  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent}>
          <Text style={styles.modalTitle}>Wallet Options</Text>

          <TouchableOpacity style={localStyles.menuItemRow} onPress={onTransferManager}>
            <Ionicons name="people-outline" size={20} color={COLORS.primary} />
            <Text style={localStyles.menuItemText}>Transfer Manager Role</Text>
          </TouchableOpacity>

          <TouchableOpacity style={localStyles.menuItemRow} onPress={onSetTarget}>
            <Ionicons name="flag-outline" size={20} color={COLORS.primary} />
            <Text style={localStyles.menuItemText}>Set Target Contribution</Text>
          </TouchableOpacity>

          <TouchableOpacity style={localStyles.menuItemRow} onPress={onShowRules}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
            <Text style={localStyles.menuItemText}>Wallet Rules</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.modalCancelBtn, { marginTop: 12 }]} onPress={onClose}>
            <Text style={styles.modalCancelText}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLow,
    marginBottom: 12,
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
});
