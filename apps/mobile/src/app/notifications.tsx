import React, { useState, useCallback } from 'react';
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
import {
  useNotifications,
  useAcceptInvitation,
  useDeclineInvitation,
  useReadNotifications,
} from '@workspace/api';

export default function NotificationsScreen() {
  const router = useRouter();

  const { data: notifications = [], isLoading, refetch } = useNotifications();
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : notifications.length > 0 ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        >
          {notifications.map((item) => {
            const isInvitation = item.type === 'GROUP_INVITATION';

            return (
              <View key={item.id} style={styles.notificationCard}>
                <View
                  style={[
                    styles.iconBadge,
                    {
                      backgroundColor: isInvitation ? '#e8f0fe' : '#e6f4ea',
                    },
                  ]}
                >
                  <Ionicons
                    name={isInvitation ? 'people' : 'information-circle'}
                    size={20}
                    color={isInvitation ? '#1a73e8' : '#137333'}
                  />
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    {!item.read && <View style={styles.unreadDot} />}
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
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
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
});
