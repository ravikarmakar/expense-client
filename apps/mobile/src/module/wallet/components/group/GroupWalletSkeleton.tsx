import React from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../../../constants/theme';
import { SkeletonLoader } from '../../../../components/SkeletonLoader';
import { walletStyles as styles } from '../../../groups/styles/group.styles';

export function GroupWalletSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Wallet</Text>
        <SkeletonLoader width={22} height={22} borderRadius={11} style={{ opacity: 0.2 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Balance Card Skeleton ── */}
        <View style={[styles.balanceCard, { opacity: 0.85 }]}>
          <View style={[styles.abstractCircle, styles.circleTopRight]} />
          <View style={[styles.abstractCircle, styles.circleBottomLeft]} />
          <SkeletonLoader
            width={100}
            height={12}
            borderRadius={4}
            style={{ marginBottom: 12, backgroundColor: '#fff', opacity: 0.3 }}
          />
          <SkeletonLoader
            width={180}
            height={38}
            borderRadius={8}
            style={{ marginBottom: 16, backgroundColor: '#fff', opacity: 0.3 }}
          />
          <View style={styles.balanceRow}>
            <Ionicons name="person" size={14} color="rgba(255,255,255,0.6)" />
            <SkeletonLoader
              width={130}
              height={14}
              borderRadius={4}
              style={{ backgroundColor: '#fff', opacity: 0.3 }}
            />
          </View>
        </View>

        {/* ── Your Contribution Quick Action Skeleton ── */}
        <View style={styles.yourContribCard}>
          <View style={styles.yourContribInfo}>
            <SkeletonLoader width={110} height={11} borderRadius={4} style={{ marginBottom: 8 }} />
            <SkeletonLoader width={130} height={20} borderRadius={6} style={{ marginBottom: 6 }} />
            <SkeletonLoader width={90} height={12} borderRadius={4} />
          </View>
          <SkeletonLoader width={96} height={36} borderRadius={10} />
        </View>

        {/* ── All Members Contributions Skeleton ── */}
        <SkeletonLoader
          width={220}
          height={14}
          borderRadius={4}
          style={{ marginBottom: 12, marginHorizontal: 16 }}
        />
        <View style={styles.membersListContainer}>
          {[1, 2, 3].map((key, index) => (
            <React.Fragment key={key}>
              <View style={styles.memberItem}>
                <View style={styles.memberLeft}>
                  <View style={styles.memberNameRow}>
                    <SkeletonLoader width={90} height={15} borderRadius={4} />
                    {key === 1 && <SkeletonLoader width={55} height={14} borderRadius={4} />}
                  </View>
                  <SkeletonLoader
                    width={70}
                    height={13}
                    borderRadius={4}
                    style={{ marginTop: 6 }}
                  />
                </View>
                <SkeletonLoader width={60} height={16} borderRadius={4} />
              </View>
              {index < 2 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── Transaction History Skeleton ── */}
        <SkeletonLoader
          width={140}
          height={14}
          borderRadius={4}
          style={{ marginTop: 28, marginBottom: 12, marginHorizontal: 16 }}
        />
        <View style={styles.historyListContainer}>
          {[1, 2].map((key, index) => (
            <React.Fragment key={key}>
              <View style={styles.txItem}>
                <SkeletonLoader
                  width={34}
                  height={34}
                  borderRadius={17}
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <SkeletonLoader
                    width="85%"
                    height={14}
                    borderRadius={4}
                    style={{ marginBottom: 6 }}
                  />
                  <SkeletonLoader width={80} height={12} borderRadius={4} />
                </View>
                <SkeletonLoader width={50} height={15} borderRadius={4} />
              </View>
              {index < 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
