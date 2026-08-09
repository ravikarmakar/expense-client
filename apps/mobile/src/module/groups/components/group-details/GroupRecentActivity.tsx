import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../../../../constants/theme';
import { globalStyles } from '../../../../styles/globalStyles';
import { EmptyState } from '../../../../components/EmptyState';
import { ActivityFeedItem } from './ActivityFeedItem';
import { ExpenseItemSkeleton } from '../../../../components/ExpenseItemSkeleton';
import { getDateHeading } from '../../../../utils/date';
import { detailStyles as styles } from '../../styles/group.styles';
import { useGroupDetail } from '../../contexts/GroupDetailContext';
import { useTheme } from '../../../../context/ThemeContext';

export function GroupRecentActivity() {
  const { isDark } = useTheme();
  const {
    isLoading,
    isFetching,
    isRefreshing,
    group,
    isLoadingActivity,
    isFetchingActivity,
    recentActivity,
    user,
    id: groupId,
  } = useGroupDetail();

  const currentUserId = user?.id;
  const showSkeleton =
    isLoadingActivity ||
    isLoading ||
    (isFetching && !isRefreshing) ||
    (isFetchingActivity && !isRefreshing);

  return (
    <View style={globalStyles.sectionContainer}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          marginHorizontal: -20,
          paddingHorizontal: 20,
        }}
      >
        <Text
          style={[
            globalStyles.sectionTitle,
            {
              fontSize: 22,
              color: isDark ? '#F9FAFB' : COLORS.onSurface,
              textTransform: 'none',
              letterSpacing: 0,
              fontWeight: '800',
              marginBottom: 0,
            },
          ]}
        >
          Recent Activity
        </Text>
        {group && recentActivity.length > 0 && (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: `/groups/${groupId}/expenses`,
                params: { name: group?.name, type: 'activity' },
              })
            }
            style={{ flexDirection: 'row', alignItems: 'center' }}
            activeOpacity={0.7}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                color: isDark ? '#34D399' : COLORS.primary,
              }}
            >
              See All
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={isDark ? '#34D399' : COLORS.primary}
              style={{ marginLeft: 2 }}
            />
          </TouchableOpacity>
        )}
      </View>

      {showSkeleton || !group ? (
        <View style={{ marginHorizontal: -20 }}>
          <ExpenseItemSkeleton />
          <ExpenseItemSkeleton />
          <ExpenseItemSkeleton />
          <ExpenseItemSkeleton />
        </View>
      ) : recentActivity.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title="No activity yet"
          description="Add the first expense or settle up to start!"
          variant={isDark ? 'dark' : 'light'}
        />
      ) : (
        <View style={styles.expensesList}>
          {(() => {
            let lastDateHeading = '';
            return recentActivity.map((item) => {
              const itemDate =
                item.type === 'expense' ? item.data.date : item.data.createdAt.split('T')[0];
              const currentHeading = getDateHeading(itemDate);
              const showHeading = currentHeading !== lastDateHeading;
              lastDateHeading = currentHeading;

              return (
                <React.Fragment key={item.data.id}>
                  {showHeading && (
                    <View
                      style={[
                        styles.dateHeaderContainer,
                        isDark && styles.dateHeaderContainerDark,
                        { marginHorizontal: -20 },
                      ]}
                    >
                      <Text style={[styles.dateHeaderText, isDark && styles.dateHeaderTextDark]}>
                        {currentHeading}
                      </Text>
                    </View>
                  )}
                  <ActivityFeedItem
                    item={item}
                    currentUserId={currentUserId}
                    onPress={
                      item.type === 'expense'
                        ? () => router.push(`/expense/${item.data.id}`)
                        : undefined
                    }
                    isSettled={item.type === 'expense' ? item.data.isSettled : undefined}
                    fullBleed={true}
                    variant={isDark ? 'dark' : 'light'}
                  />
                </React.Fragment>
              );
            });
          })()}
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: `/groups/${groupId}/expenses`,
                params: { name: group?.name, type: 'activity' },
              })
            }
            style={[
              styles.viewHistoryBtn,
              {
                marginHorizontal: -20,
                borderRadius: 0,
                borderWidth: 0,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f3f4',
                backgroundColor: isDark ? '#101917' : COLORS.surface,
                marginTop: 0,
                paddingVertical: 18,
              },
            ]}
            activeOpacity={0.7}
          >
            <Text style={[styles.viewHistoryBtnText, isDark && { color: '#34D399' }]}>
              View Full Activity
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={isDark ? '#34D399' : COLORS.primary}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
