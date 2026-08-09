import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/theme';
import { walletStyles as styles } from '../../../groups/styles/group.styles';
import { useTheme } from '../../../../context/ThemeContext';

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
  const { isDark } = useTheme();

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[
            styles.modalContent,
            isDark && {
              backgroundColor: '#101917',
              borderColor: '#1E2F2B',
            },
          ]}
        >
          <Text style={[styles.modalTitle, isDark && { color: '#F9FAFB' }]}>Wallet Options</Text>

          <TouchableOpacity
            style={[
              localStyles.menuItemRow,
              isDark && {
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              },
            ]}
            onPress={onTransferManager}
          >
            <Ionicons name="people-outline" size={20} color={isDark ? '#34D399' : COLORS.primary} />
            <Text style={[localStyles.menuItemText, isDark && { color: '#F9FAFB' }]}>
              Transfer Manager Role
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              localStyles.menuItemRow,
              isDark && {
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              },
            ]}
            onPress={onSetTarget}
          >
            <Ionicons name="flag-outline" size={20} color={isDark ? '#34D399' : COLORS.primary} />
            <Text style={[localStyles.menuItemText, isDark && { color: '#F9FAFB' }]}>
              Set Target Contribution
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              localStyles.menuItemRow,
              isDark && {
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              },
            ]}
            onPress={onShowRules}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={isDark ? '#34D399' : COLORS.primary}
            />
            <Text style={[localStyles.menuItemText, isDark && { color: '#F9FAFB' }]}>
              Wallet Rules
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modalCancelBtn,
              { marginTop: 12 },
              isDark && {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderColor: 'rgba(255, 255, 255, 0.12)',
              },
            ]}
            onPress={onClose}
          >
            <Text style={[styles.modalCancelText, isDark && { color: '#9CA3AF' }]}>Close</Text>
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
