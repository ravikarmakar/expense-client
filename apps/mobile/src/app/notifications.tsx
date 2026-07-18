import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { TopAppBar } from '../components/TopAppBar';
import { COLORS } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useNotifications,
  useAcceptInvitation,
  useDeclineInvitation,
  useReadNotifications,
} from '@workspace/api';
import { SkeletonLoader } from '../components/SkeletonLoader';

const getNotificationTypeConfig = (
  type: string
): {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  bg: string;
} => {
  switch (type) {
    case 'GROUP_INVITATION':
      return {
        icon: 'people-sharp',
        color: '#1a73e8',
        bg: '#e8f0fe',
      };
    case 'EXPENSE_CREATED':
      return {
        icon: 'receipt-sharp',
        color: '#137333',
        bg: '#e6f4ea',
      };
    case 'SETTLEMENT_COMPLETED':
      return {
        icon: 'checkmark-circle-sharp',
        color: '#0f9d58',
        bg: '#e8f5e9',
      };
    case 'REMINDER':
      return {
        icon: 'alarm-sharp',
        color: '#b06000',
        bg: '#fef7e0',
      };
    default:
      return {
        icon: 'notifications-sharp',
        color: '#7b1fa2',
        bg: '#f3e5f5',
      };
  }
};

const formatNotificationTime = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

function NotificationSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <SkeletonLoader width={40} height={40} borderRadius={14} />
          <View style={{ flex: 1, gap: 8 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <SkeletonLoader width={120} height={14} borderRadius={4} />
              <SkeletonLoader width={40} height={10} borderRadius={3} />
            </View>
            <SkeletonLoader width="90%" height={12} borderRadius={4} />
            <SkeletonLoader width="60%" height={12} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data, isLoading, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useNotifications(15);

  const notifications = useMemo(() => {
    return data?.pages.flatMap((page) => page.notifications) ?? [];
  }, [data]);
  const acceptInvitation = useAcceptInvitation();
  const declineInvitation = useDeclineInvitation();
  const readNotifications = useReadNotifications();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refetch and mark notifications as read whenever the screen is navigated to/focused
  useFocusEffect(
    useCallback(() => {
      refetch();
      readNotifications.mutate(undefined, {
        onError: (err) => console.warn('Failed to mark notifications as read:', err),
      });
    }, [refetch])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleAccept = (invitationId: string) => {
    acceptInvitation.mutate(invitationId, {
      onSuccess: () => {
        Alert.alert('Success', 'You have joined the group!');
      },
      onError: () => {
        Alert.alert('Error', 'Failed to accept invitation. Please try again.');
      },
    });
  };

  const handleDecline = (invitationId: string) => {
    declineInvitation.mutate(invitationId, {
      onSuccess: () => {
        Alert.alert('Declined', 'Declined invitation.');
      },
      onError: () => {
        Alert.alert('Error', 'Failed to decline invitation.');
      },
    });
  };

  return (
    <View style={styles.container}>
      <TopAppBar title="Notifications" showBack={true} onBack={() => router.back()} />

      {isLoading ? (
        <NotificationSkeleton />
      ) : notifications.length > 0 ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 20 + insets.bottom }]}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        >
          {notifications.map((item) => {
            const isInvitation = item.type === 'GROUP_INVITATION';
            const config = getNotificationTypeConfig(item.type);
            const timeAgo = formatNotificationTime(item.createdAt);

            return (
              <View
                key={item.id}
                style={[styles.notificationCard, !item.read && styles.unreadCard]}
              >
                <View style={[styles.iconBadge, { backgroundColor: config.bg }]}>
                  <Ionicons name={config.icon} size={20} color={config.color} />
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.cardHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      {!item.read && <View style={styles.unreadDot} />}
                    </View>
                    {timeAgo ? <Text style={styles.cardTime}>{timeAgo}</Text> : null}
                  </View>
                  <Text style={styles.cardBody}>{item.message}</Text>

                  {isInvitation && item.invitationId && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.acceptBtn]}
                        onPress={() => handleAccept(item.invitationId!)}
                        disabled={acceptInvitation.isPending || declineInvitation.isPending}
                        activeOpacity={0.8}
                      >
                        {acceptInvitation.isPending ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <>
                            <Ionicons
                              name="checkmark-circle"
                              size={14}
                              color="#ffffff"
                              style={{ marginRight: 4 }}
                            />
                            <Text style={styles.acceptBtnText}>Accept</Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionBtn, styles.declineBtn]}
                        onPress={() => handleDecline(item.invitationId!)}
                        disabled={acceptInvitation.isPending || declineInvitation.isPending}
                        activeOpacity={0.8}
                      >
                        {declineInvitation.isPending ? (
                          <ActivityIndicator size="small" color="#c5221f" />
                        ) : (
                          <>
                            <Ionicons
                              name="close"
                              size={14}
                              color="#c5221f"
                              style={{ marginRight: 4 }}
                            />
                            <Text style={styles.declineBtnText}>Decline</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
          {hasNextPage && (
            <TouchableOpacity
              style={styles.loadMoreBtn}
              onPress={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              activeOpacity={0.8}
            >
              {isFetchingNextPage ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={styles.loadMoreText}>Load More</Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.emptyContainer, { paddingBottom: 60 + insets.bottom }]}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        >
          <View style={styles.bellBadgeContainer}>
            <View style={styles.bellOuterCircle}>
              <View style={styles.bellInnerCircle}>
                <Ionicons name="notifications-off" size={40} color={COLORS.outline} />
              </View>
            </View>
          </View>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySubtitle}>
            {
              "We'll notify you when you have new group splits, wallet transactions, or settle-up activity."
            }
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.outline,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1a73e8',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  acceptBtn: {
    backgroundColor: '#137333',
  },
  declineBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#f9c2bd',
  },
  acceptBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  declineBtnText: {
    color: '#c5221f',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    gap: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    gap: 14,
    alignItems: 'flex-start',
  },
  unreadCard: {
    backgroundColor: '#f6f9fc',
    borderColor: '#e8f0fe',
  },
  skeletonContainer: {
    padding: 20,
    gap: 12,
  },
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    gap: 14,
    alignItems: 'flex-start',
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 13,
    color: COLORS.outline,
    lineHeight: 18,
    marginBottom: 6,
  },
  cardTime: {
    fontSize: 11,
    color: COLORS.outlineVariant,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  bellBadgeContainer: {
    marginBottom: 24,
  },
  bellOuterCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  bellInnerCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.onSurface,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.outline,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  backHomeBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  backHomeBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  loadMoreBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    borderRadius: 14,
  },
  loadMoreText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
