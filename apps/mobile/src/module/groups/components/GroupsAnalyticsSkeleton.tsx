import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../../constants/theme';
import { SkeletonLoader } from '../../../components/SkeletonLoader';
import { globalStyles } from '../../../styles/globalStyles';

export function GroupsAnalyticsSkeleton() {
  return (
    <ScrollView
      contentContainerStyle={globalStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {[1, 2, 3].map((key) => (
        <View key={key} style={styles.card}>
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <SkeletonLoader
                width={38}
                height={38}
                borderRadius={19}
                style={{ marginRight: 12 }}
              />
              <View style={{ gap: 4 }}>
                <SkeletonLoader width={120} height={15} borderRadius={8} />
                <SkeletonLoader width={80} height={10} borderRadius={5} />
              </View>
            </View>
            <SkeletonLoader width={70} height={22} borderRadius={8} />
          </View>

          <View style={styles.metaGrid}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.metaCol}>
                <SkeletonLoader
                  width={60}
                  height={10}
                  borderRadius={5}
                  style={{ marginBottom: 4 }}
                />
                <SkeletonLoader width={50} height={13} borderRadius={6} />
              </View>
            ))}
          </View>

          <View style={styles.progressContainer}>
            <SkeletonLoader width="100%" height={8} borderRadius={4} style={{ marginBottom: 8 }} />
            <View style={styles.progressLabels}>
              <SkeletonLoader width={70} height={10} borderRadius={5} />
              <SkeletonLoader width={70} height={10} borderRadius={5} />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface || '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  metaCol: {
    flex: 1,
    alignItems: 'center',
  },
  progressContainer: {
    marginTop: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
