import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL } from '../../../../constants/theme';
import { walletStyles as styles } from '../../../groups/styles/group.styles';

interface YourContributionCardProps {
  myPaid: number;
  shareTarget: number;
  myPending: number;
  contributeAmount: string;
  setContributeAmount: (amount: string) => void;
  showContributeInput: boolean;
  setShowContributeInput: (show: boolean) => void;
  onContribute: () => void;
  isPending: boolean;
  contributeError: string;
}

export function YourContributionCard({
  myPaid,
  shareTarget,
  myPending,
  contributeAmount,
  setContributeAmount,
  showContributeInput,
  setShowContributeInput,
  onContribute,
  isPending,
  contributeError,
}: YourContributionCardProps) {
  return (
    <View style={styles.yourContribCard}>
      <View style={styles.yourContribInfo}>
        <Text style={styles.yourContribLabel}>Your Contribution</Text>
        <Text style={styles.yourContribAmount}>
          {CURRENCY_SYMBOL}
          {myPaid.toFixed(2)}{' '}
          <Text style={styles.yourContribTarget}>
            / {CURRENCY_SYMBOL}
            {shareTarget.toFixed(2)}
          </Text>
        </Text>
        {myPending > 0 && (
          <Text style={styles.yourContribPending}>
            Remaining: {CURRENCY_SYMBOL}
            {myPending.toFixed(2)}
          </Text>
        )}
      </View>

      {myPending > 0 ? (
        showContributeInput ? (
          <View style={{ alignItems: 'flex-end' }}>
            <View style={styles.contributeInputRow}>
              <TextInput
                style={[
                  styles.contributeInput,
                  contributeError ? { borderColor: COLORS.error } : null,
                ]}
                value={contributeAmount}
                onChangeText={setContributeAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={COLORS.outlineVariant}
                autoFocus
              />
              <TouchableOpacity
                onPress={onContribute}
                style={[
                  styles.contributeConfirmBtn,
                  contributeError ? { backgroundColor: COLORS.outlineVariant } : null,
                ]}
                disabled={isPending || !!contributeError}
              >
                {isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="checkmark" size={18} color="#fff" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowContributeInput(false);
                  setContributeAmount('');
                }}
                style={styles.contributeCancelBtn}
              >
                <Ionicons name="close" size={18} color={COLORS.outline} />
              </TouchableOpacity>
            </View>
            {contributeError ? (
              <Text
                style={{
                  fontSize: 10,
                  color: COLORS.error,
                  fontWeight: '600',
                  marginTop: 4,
                  textAlign: 'right',
                  maxWidth: 160,
                }}
              >
                {contributeError}
              </Text>
            ) : null}
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setShowContributeInput(true)}
            style={styles.contributeBtn}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.contributeBtnText}>Contribute</Text>
          </TouchableOpacity>
        )
      ) : (
        <View style={styles.fullyPaidBadge}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.secondary} />
          <Text style={styles.fullyPaidText}>Paid</Text>
        </View>
      )}
    </View>
  );
}
