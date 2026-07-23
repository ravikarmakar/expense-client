import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { SkeletonLoader } from '../../../components/SkeletonLoader';

interface GroupDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedGroupId: string | null;
  userGroups: { id: string; name: string }[];
  onSelect: (id: string) => void;
  selectedGroupName?: string;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  isLoading?: boolean;
  variant?: 'light' | 'dark';
}

const isCloseToBottom = (event: NativeScrollEvent) => {
  const { layoutMeasurement, contentOffset, contentSize } = event;
  const paddingToBottom = 20;
  return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
};

export const GroupDropdown = React.memo(function GroupDropdown({
  isOpen,
  onToggle,
  selectedGroupId,
  userGroups,
  onSelect,
  selectedGroupName,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  variant = 'light',
}: GroupDropdownProps) {
  const isDark = variant === 'dark';

  return (
    <>
      <Text style={[styles.inputLabel, isDark && { color: '#74817B' }]}>Group *</Text>
      <View
        style={[
          styles.dropdownWrapper,
          isDark && {
            backgroundColor: '#101917',
            borderColor: 'rgba(255, 255, 255, 0.12)',
            borderWidth: 1,
          },
        ]}
      >
        <TouchableOpacity style={styles.dropdownHeader} onPress={onToggle} activeOpacity={0.8}>
          <View style={styles.dropdownHeaderLeft}>
            {selectedGroupId ? (
              <>
                <View
                  style={[styles.dropdownHeaderIcon, { backgroundColor: COLORS.secondaryFixed }]}
                >
                  <Ionicons name="people" size={18} color={COLORS.secondary} />
                </View>
                <Text style={[styles.dropdownHeaderText, isDark && { color: '#FFFFFF' }]}>
                  {selectedGroupName ||
                    userGroups.find((g) => g.id === selectedGroupId)?.name ||
                    'Selected Group'}
                </Text>
              </>
            ) : (
              <>
                <View
                  style={[
                    styles.dropdownHeaderIcon,
                    { backgroundColor: isDark ? '#131D1A' : COLORS.surfaceContainerLow },
                  ]}
                >
                  <Ionicons
                    name="people-outline"
                    size={18}
                    color={isDark ? 'rgba(255, 255, 255, 0.65)' : COLORS.outline}
                  />
                </View>
                <Text
                  style={[
                    styles.dropdownHeaderText,
                    { color: isDark ? 'rgba(255, 255, 255, 0.55)' : COLORS.outlineVariant },
                  ]}
                >
                  Select Group
                </Text>
              </>
            )}
          </View>
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={isDark ? 'rgba(255, 255, 255, 0.65)' : COLORS.outline}
          />
        </TouchableOpacity>

        {isOpen && (
          <ScrollView
            style={[
              styles.dropdownList,
              styles.categoryScroll,
              isDark && {
                backgroundColor: '#101917',
                borderTopColor: 'rgba(255, 255, 255, 0.16)',
              },
            ]}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={400}
            onScroll={({ nativeEvent }) => {
              if (isCloseToBottom(nativeEvent)) {
                if (hasNextPage && !isFetchingNextPage && fetchNextPage) {
                  fetchNextPage();
                }
              }
            }}
          >
            {isLoading ? (
              <View style={{ gap: 4, paddingVertical: 8 }}>
                {[1, 2, 3].map((i) => (
                  <View key={i} style={[styles.dropdownItem, { borderBottomWidth: 0 }]}>
                    <View style={styles.dropdownItemLeft}>
                      <SkeletonLoader width={32} height={32} borderRadius={10} />
                      <SkeletonLoader width={120} height={16} borderRadius={4} />
                    </View>
                  </View>
                ))}
              </View>
            ) : userGroups.length === 0 ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Text
                  style={{
                    color: isDark ? 'rgba(255, 255, 255, 0.65)' : COLORS.outline,
                    fontSize: 13,
                    fontWeight: '500',
                  }}
                >
                  No groups found
                </Text>
              </View>
            ) : (
              userGroups.map((grp) => {
                const isSelected = selectedGroupId === grp.id;
                return (
                  <TouchableOpacity
                    key={grp.id}
                    style={[
                      styles.dropdownItem,
                      isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.04)' },
                      isSelected &&
                        (isDark
                          ? { backgroundColor: 'rgba(16, 185, 129, 0.15)' }
                          : styles.dropdownItemActive),
                    ]}
                    onPress={() => onSelect(grp.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.dropdownItemLeft}>
                      <View
                        style={[
                          styles.dropdownItemIcon,
                          { backgroundColor: COLORS.secondaryFixed },
                        ]}
                      >
                        <Ionicons name="people" size={16} color={COLORS.secondary} />
                      </View>
                      <Text
                        style={[
                          styles.dropdownItemLabel,
                          isDark && { color: '#ffffff' },
                          isSelected &&
                            (isDark
                              ? { color: '#10B981', fontWeight: '700' }
                              : styles.dropdownItemLabelActive),
                        ]}
                      >
                        {grp.name}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-sharp"
                        size={18}
                        color={isDark ? '#10B981' : COLORS.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
            {isFetchingNextPage && (
              <View style={{ paddingVertical: 12, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={isDark ? '#10B981' : COLORS.primary} />
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
});

const styles = StyleSheet.create({
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    marginLeft: 4,
  },
  dropdownWrapper: {
    marginBottom: 16,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    overflow: 'hidden',
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    paddingHorizontal: 14,
  },
  dropdownHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dropdownHeaderIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownHeaderText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  dropdownList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
    backgroundColor: COLORS.surface,
  },
  categoryScroll: {
    maxHeight: 280,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.primaryFixed,
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropdownItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownItemLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurface,
  },
  dropdownItemLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
