import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';
import { detailStyles as styles } from '../styles/group.styles';
import type { GroupMember } from '@workspace/api';

interface SettleUpModalProps {
  visible: boolean;
  onClose: () => void;
  settleMember: GroupMember | null;
  settleAmount: string;
  setSettleAmount: (amount: string) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export default function SettleUpModal({
  visible,
  onClose,
  settleMember,
  settleAmount,
  setSettleAmount,
  onSubmit,
  isPending,
}: SettleUpModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settle Up</Text>
              <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color={COLORS.outline} />
              </TouchableOpacity>
            </View>

            {settleMember && (
              <ScrollView
                style={{ flexShrink: 1 }}
                contentContainerStyle={styles.modalBody}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.modalSub}>
                  {settleMember.balance >= 0
                    ? `Record the amount ${settleMember.name} paid you:`
                    : `Record the amount you paid ${settleMember.name}:`}
                </Text>

                <View style={styles.amountInputContainer}>
                  <Text style={styles.amountCurrency}>{CURRENCY_SYMBOL}</Text>
                  <TextInput
                    style={styles.amountInput}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={COLORS.outline}
                    value={settleAmount}
                    onChangeText={(val) => {
                      if (/^\d{0,7}\.?\d{0,2}$/.test(val)) {
                        setSettleAmount(val);
                      }
                    }}
                    autoFocus={true}
                  />
                </View>

                <View style={{ marginBottom: 20, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: COLORS.outline, fontWeight: '600' }}>
                    Total Balance: {CURRENCY_SYMBOL}
                    {Math.abs(settleMember.balance).toFixed(2)}
                  </Text>
                  {(() => {
                    const inputVal = parseFloat(settleAmount) || 0;
                    const originalVal = Math.abs(settleMember.balance);
                    const remaining = Math.max(0, originalVal - inputVal);
                    return (
                      <Text
                        style={{
                          fontSize: 14,
                          color: COLORS.primary,
                          fontWeight: '700',
                          marginTop: 4,
                        }}
                      >
                        Remaining Balance: {CURRENCY_SYMBOL}
                        {remaining.toFixed(2)}
                      </Text>
                    );
                  })()}
                </View>

                <View style={styles.modalActionButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={onClose}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalConfirmBtn,
                      (isPending ||
                        !settleAmount ||
                        parseFloat(settleAmount) <= 0 ||
                        parseFloat(settleAmount) > Math.abs(settleMember.balance) + 0.005) &&
                        styles.confirmButtonDisabled,
                    ]}
                    disabled={
                      isPending ||
                      !settleAmount ||
                      parseFloat(settleAmount) <= 0 ||
                      parseFloat(settleAmount) > Math.abs(settleMember.balance) + 0.005
                    }
                    onPress={onSubmit}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalConfirmText}>
                      {isPending ? 'Saving...' : 'Confirm'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
