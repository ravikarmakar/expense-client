import React from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../../../constants/theme';
import { SkeletonLoader } from '../../../../components/SkeletonLoader';
import { walletStyles as styles } from '../../../groups/styles/group.styles';
import { useTheme } from '../../../../context/ThemeContext';
import { AppBackground } from '../../../../components/AppBackground';

export function GroupWalletSkeleton() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  return (
    <AppBackground style={[styles.container, isDark && { backgroundColor: '#070E0C' }]}>
      {/* ── Header ── */}
      <View
        style={[
          styles.header,
          isDark && { backgroundColor: '#0D1714', borderBottomColor: 'rgba(255, 255, 255, 0.08)' },
          { paddingTop: insets.top, height: 56 + insets.top },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#F9FAFB' : COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && { color: '#F9FAFB' }]}>Group Wallet</Text>
        <SkeletonLoader width={22} height={22} borderRadius={11} style={{ opacity: 0.2 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Balance Card Skeleton ── */}
        <View
          style={[
            styles.balanceCard,
            isDark && {
              backgroundColor: '#101917',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.08)',
            },
          ]}
        >
          <View style={[styles.abstractCircle, styles.circleTopRight]} />
          <View style={[styles.abstractCircle, styles.circleBottomLeft]} />
          <SkeletonLoader width={100} height={12} borderRadius={4} style={{ marginBottom: 12 }} />
          <SkeletonLoader width={180} height={38} borderRadius={8} style={{ marginBottom: 16 }} />
          <View style={styles.balanceRow}>
            <Ionicons
              name="person"
              size={14}
              color={isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.6)'}
            />
            <SkeletonLoader width={130} height={14} borderRadius={4} />
          </View>
        </View>

        {/* ── Your Contribution Quick Action Skeleton ── */}
        <View
          style={[
            styles.yourContribCard,
            isDark && {
              backgroundColor: '#101917',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            },
          ]}
        >
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
        <View
          style={[
            styles.membersListContainer,
            isDark && {
              backgroundColor: '#101917',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            },
          ]}
        >
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
              {index < 2 && (
                <View
                  style={[
                    styles.divider,
                    isDark && { backgroundColor: 'rgba(255, 255, 255, 0.06)' },
                  ]}
                />
              )}
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
        <View
          style={[
            styles.historyListContainer,
            isDark && {
              backgroundColor: '#101917',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            },
          ]}
        >
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
              {index < 1 && (
                <View
                  style={[
                    styles.divider,
                    isDark && { backgroundColor: 'rgba(255, 255, 255, 0.06)' },
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </AppBackground>
  );
}
