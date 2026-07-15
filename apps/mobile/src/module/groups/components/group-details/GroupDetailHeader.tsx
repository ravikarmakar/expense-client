import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../../../../constants/theme';
import { detailStyles as styles } from '../../styles/group.styles';
import { useGroupDetail } from '../../contexts/GroupDetailContext';

export function GroupDetailHeader() {
  const { id, group, routeEmoji, routeName, insets, setMenuVisible } = useGroupDetail();

  const displayEmoji = group?.emoji ?? routeEmoji ?? '👥';
  const displayName = group?.name ?? routeName ?? 'Group Detail';

  return (
    <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {displayEmoji} {displayName}
      </Text>
      <TouchableOpacity
        onPress={() => router.push(`/groups/${id}/wallet`)}
        style={styles.walletBtn}
      >
        <Ionicons name="wallet" size={28} color={COLORS.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.moreBtn}>
        <Ionicons name="ellipsis-vertical" size={25} color={COLORS.onSurface} />
      </TouchableOpacity>
    </View>
  );
}
