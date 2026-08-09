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

import { useTheme } from '../context/ThemeContext';
import { AppBackground } from '../components/AppBackground';

const getNotificationTypeConfig = (
  type: string,
  isDark = false
): {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  bg: string;
} => {
  switch (type) {
    case 'GROUP_INVITATION':
      return {
        icon: 'people-sharp',
        color: isDark ? '#60A5FA' : '#1a73e8',
        bg: isDark ? 'rgba(96, 165, 250, 0.15)' : '#e8f0fe',
      };
    case 'EXPENSE_CREATED':
      return {
        icon: 'receipt-sharp',
        color: isDark ? '#34D399' : '#137333',
        bg: isDark ? 'rgba(52, 211, 153, 0.15)' : '#e6f4ea',
      };
    case 'SETTLEMENT_COMPLETED':
      return {
        icon: 'checkmark-circle-sharp',
        color: isDark ? '#10B981' : '#0f9d58',
        bg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#e8f5e9',
      };
    case 'REMINDER':
      return {
        icon: 'alarm-sharp',
        color: isDark ? '#FBBF24' : '#b06000',
        bg: isDark ? 'rgba(251, 191, 36, 0.15)' : '#fef7e0',
      };
    default:
      return {
        icon: 'notifications-sharp',
        color: isDark ? '#A78BFA' : '#7b1fa2',
        bg: isDark ? 'rgba(167, 139, 250, 0.15)' : '#f3e5f5',
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

function NotificationSkeleton({ isDark = false }: { isDark?: boolean }) {
  return (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={[
            styles.skeletonCard,
            isDark && {
              backgroundColor: '#101917',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            },
          ]}
        >
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

type NotificationFilter = 'all' | 'unread' | 'invitations' | 'activity';

const NOTIFICATION_FILTERS: { id: NotificationFilter; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: 'layers-outline' },
  { id: 'unread', label: 'Unread', icon: 'mail-unread-outline' },
  { id: 'invitations', label: 'Invites', icon: 'person-add-outline' },
  { id: 'activity', label: 'Activity', icon: 'receipt-outline' },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const { data, isLoading, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useNotifications(15);

  const notifications = useMemo(() => {
    return data?.pages.flatMap((page) => page.notifications) ?? [];
  }, [data]);

  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'unread') {
      return notifications.filter((n) => !n.read);
    }
    if (activeFilter === 'invitations') {
      return notifications.filter((n) => n.type === 'GROUP_INVITATION');
    }
    if (activeFilter === 'activity') {
      return notifications.filter((n) => n.type !== 'GROUP_INVITATION');
    }
    return notifications;
  }, [notifications, activeFilter]);

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

  const getEmptyStateMessage = () => {
    switch (activeFilter) {
      case 'unread':
        return {
          title: 'No Unread Notifications',
          subtitle: 'You have read all your recent notifications.',
        };
      case 'invitations':
        return {
          title: 'No Pending Invitations',
          subtitle: 'You do not have any pending group invitations.',
        };
      case 'activity':
        return {
          title: 'No Recent Activity',
          subtitle: 'New expense, wallet, or settlement notifications will appear here.',
        };
      case 'all':
      default:
        return {
          title: 'All caught up!',
          subtitle:
            "We'll notify you when you have new group splits, wallet transactions, or settle-up activity.",
        };
    }
  };

  const handleMarkAllRead = () => {
    readNotifications.mutate(undefined, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  return (
    <AppBackground style={[styles.container, isDark && { backgroundColor: '#070E0C' }]}>
      <TopAppBar
        title="Notifications"
        showBack={true}
        onBack={() => router.back()}
        rightActionIcon="checkmark-done-outline"
        onRightActionPress={handleMarkAllRead}
        variant={isDark ? 'dark' : 'light'}
      />

      {/* Filter Horizontal Pills */}
      <View style={styles.filterBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {NOTIFICATION_FILTERS.map((filter) => {
            const isSelected = activeFilter === filter.id;
            const count =
              filter.id === 'unread'
                ? notifications.filter((n) => !n.read).length
                : filter.id === 'invitations'
                  ? notifications.filter((n) => n.type === 'GROUP_INVITATION').length
                  : filter.id === 'activity'
                    ? notifications.filter((n) => n.type !== 'GROUP_INVITATION').length
                    : notifications.length;

            return (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterPill,
                  isDark && styles.filterPillDark,
                  isSelected &&
                    (isDark ? styles.filterPillActiveDark : styles.filterPillActiveLight),
                ]}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(filter.id)}
              >
                <Ionicons
                  name={filter.icon as never}
                  size={15}
                  color={
                    isSelected
                      ? isDark
                        ? '#34D399'
                        : '#006948'
                      : isDark
                        ? '#9CA3AF'
                        : COLORS.outline
                  }
                />
                <Text
                  style={[
                    styles.filterPillText,
                    isDark && { color: '#9CA3AF' },
                    isSelected &&
                      (isDark
                        ? { color: '#34D399', fontWeight: '800' }
                        : { color: '#006948', fontWeight: '800' }),
                  ]}
                >
                  {filter.label}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.filterBadge,
                      isDark && styles.filterBadgeDark,
                      isSelected &&
                        (isDark ? styles.filterBadgeActiveDark : styles.filterBadgeActiveLight),
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterBadgeText,
                        isDark && { color: '#9CA3AF' },
                        isSelected && (isDark ? { color: '#34D399' } : { color: '#006948' }),
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <NotificationSkeleton isDark={isDark} />
      ) : filteredNotifications.length > 0 ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 20 + insets.bottom }]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={isDark ? '#10B981' : COLORS.primary}
              colors={[isDark ? '#10B981' : COLORS.primary]}
            />
          }
        >
          {filteredNotifications.map((item) => {
            const isInvitation = item.type === 'GROUP_INVITATION';
            const config = getNotificationTypeConfig(item.type, isDark);
            const timeAgo = formatNotificationTime(item.createdAt);

            return (
              <View
                key={item.id}
                style={[
                  styles.notificationCard,
                  isDark && {
                    backgroundColor: '#101917',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                  },
                  !item.read &&
                    (isDark
                      ? {
                          backgroundColor: 'rgba(96, 165, 250, 0.08)',
                          borderColor: 'rgba(96, 165, 250, 0.25)',
                        }
                      : styles.unreadCard),
                ]}
              >
                <View style={[styles.iconBadge, { backgroundColor: config.bg }]}>
                  <Ionicons name={config.icon} size={20} color={config.color} />
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.cardHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                      <Text
                        style={[styles.cardTitle, isDark && { color: '#F9FAFB' }]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      {!item.read && (
                        <View
                          style={[styles.unreadDot, isDark && { backgroundColor: '#60A5FA' }]}
                        />
                      )}
                    </View>
                    {timeAgo ? (
                      <Text style={[styles.cardTime, isDark && { color: '#74817B' }]}>
                        {timeAgo}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={[styles.cardBody, isDark && { color: '#9CA3AF' }]}>
                    {item.message}
                  </Text>

                  {isInvitation && item.invitationId && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          styles.acceptBtn,
                          isDark && { backgroundColor: '#10B981' },
                        ]}
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
                        style={[
                          styles.actionBtn,
                          styles.declineBtn,
                          isDark && {
                            backgroundColor: 'transparent',
                            borderColor: 'rgba(239, 68, 68, 0.4)',
                          },
                        ]}
                        onPress={() => handleDecline(item.invitationId!)}
                        disabled={acceptInvitation.isPending || declineInvitation.isPending}
                        activeOpacity={0.8}
                      >
                        {declineInvitation.isPending ? (
                          <ActivityIndicator size="small" color={isDark ? '#F87171' : '#c5221f'} />
                        ) : (
                          <>
                            <Ionicons
                              name="close"
                              size={14}
                              color={isDark ? '#F87171' : '#c5221f'}
                              style={{ marginRight: 4 }}
                            />
                            <Text style={[styles.declineBtnText, isDark && { color: '#F87171' }]}>
                              Decline
                            </Text>
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
              style={[
                styles.loadMoreBtn,
                isDark && {
                  backgroundColor: '#101917',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                },
              ]}
              onPress={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              activeOpacity={0.8}
            >
              {isFetchingNextPage ? (
                <ActivityIndicator size="small" color={isDark ? '#10B981' : COLORS.primary} />
              ) : (
                <Text style={[styles.loadMoreText, isDark && { color: '#10B981' }]}>Load More</Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.emptyContainer, { paddingBottom: 60 + insets.bottom }]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={isDark ? '#10B981' : COLORS.primary}
              colors={[isDark ? '#10B981' : COLORS.primary]}
            />
          }
        >
          <View style={styles.bellBadgeContainer}>
            <View
              style={[
                styles.bellOuterCircle,
                isDark && {
                  backgroundColor: '#101917',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                },
              ]}
            >
              <View style={[styles.bellInnerCircle, isDark && { backgroundColor: '#14231E' }]}>
                <Ionicons
                  name="notifications-off"
                  size={40}
                  color={isDark ? '#74817B' : COLORS.outline}
                />
              </View>
            </View>
          </View>
          <Text style={[styles.emptyTitle, isDark && { color: '#F9FAFB' }]}>
            {getEmptyStateMessage().title}
          </Text>
          <Text style={[styles.emptySubtitle, isDark && { color: '#9CA3AF' }]}>
            {getEmptyStateMessage().subtitle}
          </Text>
        </ScrollView>
      )}
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterBarContainer: {
    paddingVertical: 12,
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  filterPillDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterPillActiveLight: {
    backgroundColor: '#E6F4EA',
    borderColor: '#006948',
  },
  filterPillActiveDark: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderColor: '#34D399',
  },
  filterPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  filterBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceContainer,
  },
  filterBadgeDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterBadgeActiveLight: {
    backgroundColor: '#006948' + '20',
  },
  filterBadgeActiveDark: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
  },
  filterBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.outline,
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
