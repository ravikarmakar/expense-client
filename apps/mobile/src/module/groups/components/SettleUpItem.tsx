import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL, resolveAvatar } from '../../../constants/theme';
import { useSendReminder } from '@workspace/api';

export interface SettleUpItemProps {
  userId: string;
  name: string;
  email: string;
  image: string | null;
  groupId: string;
  groupName: string;
  groupEmoji: string;
  balance: number;
  activeTab: 'owed' | 'owe';
  onSettlePress: (
    groupId: string,
    withUserId: string,
    withUserName: string,
    groupName: string,
    groupEmoji: string,
    balance: number,
    direction: 'owed' | 'owe'
  ) => void;
  isCooldown: boolean;
  onReminderSent: () => void;
}

export function SettleUpItem({
  userId,
  name,
  email,
  image,
  groupId,
  groupName,
  groupEmoji,
  balance,
  activeTab,
  onSettlePress,
  isCooldown,
  onReminderSent,
}: SettleUpItemProps) {
  const sendReminder = useSendReminder(groupId);

  const handleRemindPress = () => {
    sendReminder.mutate(userId, {
      onSuccess: () => {
        Alert.alert(
          'Reminder Sent! 🔔',
          `We've sent a settle up reminder notification to ${name}.`
        );
        onReminderSent();
      },
      onError: (err) => {
        Alert.alert('Failed to send reminder', err.message || 'Something went wrong.');
        if (
          err.message?.includes('429') ||
          err.message?.toLowerCase().includes('cooldown') ||
          err.message?.toLowerCase().includes('one reminder per day')
        ) {
          onReminderSent();
        }
      },
    });
  };

  const displayBalance = Math.abs(balance);

  return (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Image source={{ uri: resolveAvatar(image) }} style={styles.avatarImage} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{name}</Text>
            <Text style={styles.userEmail}>{email}</Text>
            <View style={styles.groupMeta}>
              <Text style={styles.groupEmoji}>{groupEmoji}</Text>
              <Text style={styles.groupName} numberOfLines={1}>
                {groupName}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.userBalance}>
          <Text
            style={[
              styles.balanceText,
              { color: activeTab === 'owed' ? COLORS.primaryContainer : COLORS.error },
            ]}
          >
            {activeTab === 'owed' ? '+' : '-'}
            {CURRENCY_SYMBOL}
            {displayBalance.toFixed(2)}
          </Text>

          {activeTab === 'owed' ? (
            <TouchableOpacity
              style={[
                styles.inlineButton,
                styles.remindButton,
                isCooldown && styles.disabledButton,
              ]}
              onPress={handleRemindPress}
              disabled={sendReminder.isPending || isCooldown}
              activeOpacity={0.7}
            >
              {sendReminder.isPending ? (
                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginRight: 3 }} />
              ) : (
                <Ionicons
                  name={isCooldown ? 'notifications' : 'notifications-outline'}
                  size={12}
                  color={isCooldown ? COLORS.outline : COLORS.primary}
                  style={{ marginRight: 3 }}
                />
              )}
              <Text
                style={[
                  styles.inlineButtonText,
                  { color: isCooldown ? COLORS.outline : COLORS.primary },
                ]}
              >
                {isCooldown ? 'Reminded' : 'Remind'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.inlineButton, styles.settleButton]}
              onPress={() =>
                onSettlePress(groupId, userId, name, groupName, groupEmoji, balance, activeTab)
              }
              activeOpacity={0.8}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={12}
                color="#ffffff"
                style={{ marginRight: 3 }}
              />
              <Text style={[styles.inlineButtonText, { color: '#ffffff' }]}>Settle</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userCard: {
    backgroundColor: COLORS.surface || '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: COLORS.onSurface || '#191c1d',
    fontSize: 15,
    fontWeight: '700',
  },
  userEmail: {
    color: COLORS.onSurfaceVariant || '#3d4a42',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 4,
  },
  userBalance: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
  },
  balanceText: {
    fontSize: 16,
    fontWeight: '800',
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  groupEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  groupName: {
    color: COLORS.onSurface || '#191c1d',
    fontSize: 11,
    fontWeight: '600',
  },
  inlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  remindButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary || '#006948',
  },
  settleButton: {
    backgroundColor: COLORS.primary || '#006948',
  },
  inlineButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },
  disabledButton: {
    borderColor: COLORS.outlineVariant || '#e0e0e0',
  },
});
