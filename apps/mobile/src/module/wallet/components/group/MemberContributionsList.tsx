import React from 'react';
import { View, Text } from 'react-native';
import { CURRENCY_SYMBOL } from '../../../../constants/theme';
import { walletStyles as styles } from '../../../groups/styles/group.styles';

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
  return (
    <View>
      <Text style={styles.sectionTitle}>
        Member Contributions (Target: {CURRENCY_SYMBOL}
        {targetContribution} each)
      </Text>
      <View style={styles.membersListContainer}>
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
                    <Text style={styles.memberName}>
                      {member.name}
                      {isMe ? ' (You)' : ''}
                    </Text>
                    {walletManagerId === member.userId && (
                      <View style={styles.managerBadge}>
                        <Text style={styles.managerBadgeText}>Manager</Text>
                      </View>
                    )}
                  </View>
                  {pending > 0 ? (
                    <Text style={styles.owingText}>
                      Owes: {CURRENCY_SYMBOL}
                      {pending.toFixed(2)}
                    </Text>
                  ) : (
                    <Text style={styles.paidText}>Fully Paid ✓</Text>
                  )}
                </View>
                <Text style={styles.memberPaidAmount}>
                  {CURRENCY_SYMBOL}
                  {totalPaid.toFixed(2)}
                </Text>
              </View>
              {index < sortedMembers.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}
