import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../../constants/theme';
import { SkeletonLoader } from '../../../components/SkeletonLoader';
import { globalStyles } from '../../../styles/globalStyles';

export function SettleUpSkeleton() {
  return (
    <ScrollView
      contentContainerStyle={globalStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {[1, 2, 3, 4].map((key) => (
        <View key={key} style={styles.userCard}>
          <View style={styles.userHeader}>
            <View style={styles.userInfo}>
              <SkeletonLoader
                width={44}
                height={44}
                borderRadius={22}
                style={{ marginRight: 12 }}
              />
              <View style={{ gap: 4 }}>
                <SkeletonLoader width={120} height={15} borderRadius={8} />
                <SkeletonLoader width={160} height={12} borderRadius={6} />
              </View>
            </View>

            <View style={styles.userBalance}>
              <SkeletonLoader width={60} height={18} borderRadius={8} />
              <SkeletonLoader width={18} height={18} borderRadius={9} style={{ marginLeft: 4 }} />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  userCard: {
    backgroundColor: COLORS.surface || '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
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
  userBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
