import React from 'react';
import { Modal, Pressable, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL } from '../../../../constants/theme';
import { walletStyles as styles } from '../../../groups/styles/group.styles';

interface TargetRulesModalProps {
  visible: boolean;
  onClose: () => void;
}

export function TargetRulesModal({ visible, onClose }: TargetRulesModalProps) {
  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent}>
          <View style={localStyles.infoModalHeader}>
            <Ionicons name="information-circle" size={28} color={COLORS.primary} />
            <Text style={localStyles.infoModalTitle}>Target Rules</Text>
          </View>

          <Text style={localStyles.infoModalDesc}>
            The contribution target is locked to prevent modifications during active collection.
          </Text>

          <View style={localStyles.rulesContainer}>
            <View style={localStyles.ruleItem}>
              <Ionicons
                name="people"
                size={18}
                color={COLORS.primary}
                style={localStyles.ruleIcon}
              />
              <Text style={localStyles.ruleText}>
                <Text style={{ fontWeight: '700' }}>Equal Share Met:</Text> Unlocks automatically
                once every member contributes their portion.
              </Text>
            </View>

            <View style={localStyles.ruleItem}>
              <Ionicons name="time" size={18} color={COLORS.primary} style={localStyles.ruleIcon} />
              <Text style={localStyles.ruleText}>
                <Text style={{ fontWeight: '700' }}>Time Expiry:</Text> Unlocks automatically when
                the selected target duration finishes.
              </Text>
            </View>

            <View style={localStyles.ruleItem}>
              <Ionicons name="cash" size={18} color={COLORS.primary} style={localStyles.ruleIcon} />
              <Text style={localStyles.ruleText}>
                <Text style={{ fontWeight: '700' }}>Depleted Balance:</Text> Unlocks if the wallet
                balance is fully spent to {CURRENCY_SYMBOL}0.00.
              </Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.modalSaveBtn, { marginTop: 24 }]} onPress={onClose}>
            <Text style={styles.modalSaveText}>Got it</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  infoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    justifyContent: 'center',
  },
  infoModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  infoModalDesc: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  rulesContainer: {
    gap: 16,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  ruleIcon: {
    marginTop: 2,
  },
  ruleText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.onSurface,
    lineHeight: 18,
  },
});
