import React from 'react';
import { View, Text } from 'react-native';
import { CURRENCY_SYMBOL } from '../../../../constants/theme';
import { walletStyles as styles } from '../../../groups/styles/group.styles';
import { useTheme } from '../../../../context/ThemeContext';

interface MemberContributionsListProps {
  sortedMembers: Array<{
    userId: string;
    name: string;
    email: string;
  }>;
  contributions: Array<{
    userId: string;
    amount: number;
  }>;
  targetContribution: number;
  walletManagerId: string;
  currentUserId?: string;
}

export function MemberContributionsList({
  sortedMembers,
  contributions,
  targetContribution,
  walletManagerId,
  currentUserId,
}: MemberContributionsListProps) {
  const { isDark } = useTheme();

  return (
    <View>
      <Text style={[styles.sectionTitle, isDark && { color: '#F9FAFB' }]}>
        Member Contributions (Target: {CURRENCY_SYMBOL}
        {targetContribution} each)
      </Text>
      <View
        style={[
          styles.membersListContainer,
          isDark && {
            backgroundColor: '#101917',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          },
        ]}
      >
        {sortedMembers.map((member, index) => {
          const contrib = contributions.find((c) => c.userId === member.userId);
          const totalPaid = contrib?.amount ?? 0;
          const pending = Math.max(0, targetContribution - totalPaid);
          const isMe = member.userId === currentUserId;

          return (
            <React.Fragment key={member.userId}>
              <View style={styles.memberItem}>
                <View style={styles.memberLeft}>
                  <View style={styles.memberNameRow}>
                    <Text style={[styles.memberName, isDark && { color: '#F9FAFB' }]}>
                      {member.name}
                      {isMe ? ' (You)' : ''}
                    </Text>
                    {walletManagerId === member.userId && (
                      <View
                        style={[
                          styles.managerBadge,
                          isDark && {
                            backgroundColor: 'rgba(52, 211, 153, 0.18)',
                            borderColor: 'rgba(52, 211, 153, 0.3)',
                          },
                        ]}
                      >
                        <Text style={[styles.managerBadgeText, isDark && { color: '#34D399' }]}>
                          Manager
                        </Text>
                      </View>
                    )}
                  </View>
                  {pending > 0 ? (
                    <Text style={[styles.owingText, isDark && { color: '#F87171' }]}>
                      Owes: {CURRENCY_SYMBOL}
                      {pending.toFixed(2)}
                    </Text>
                  ) : (
                    <Text style={[styles.paidText, isDark && { color: '#34D399' }]}>
                      Fully Paid ✓
                    </Text>
                  )}
                </View>
                <Text style={[styles.memberPaidAmount, isDark && { color: '#F9FAFB' }]}>
                  {CURRENCY_SYMBOL}
                  {totalPaid.toFixed(2)}
                </Text>
              </View>
              {index < sortedMembers.length - 1 && (
                <View
                  style={[
                    styles.divider,
                    isDark && { backgroundColor: 'rgba(255, 255, 255, 0.06)' },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}
