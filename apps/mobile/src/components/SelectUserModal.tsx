import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useSearchUsers, type UserSearchResult } from '@workspace/api';
import { BottomSheetModal } from './BottomSheetModal';

interface SelectUserModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectUser: (user: UserSearchResult) => void;
  variant?: 'light' | 'dark';
  isDark?: boolean;
}

export function SelectUserModal({
  visible,
  onClose,
  onSelectUser,
  variant,
  isDark: isDarkProp,
}: SelectUserModalProps) {
  const isDark = isDarkProp ?? variant === 'dark';
  const modalVariant = isDark ? 'dark' : 'light';
  const [searchQuery, setSearchQuery] = useState('');

  const { data: searchResults, isLoading } = useSearchUsers(searchQuery);

  const handleSelect = (user: UserSearchResult) => {
    onSelectUser(user);
    setSearchQuery('');
    onClose();
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={() => {
        setSearchQuery('');
        onClose();
      }}
      title="Select App User"
      subtitle="Link record for automatic reciprocal view"
      variant={modalVariant}
    >
      <View style={styles.container}>
        {/* Search Input Bar */}
        <View style={[styles.searchBar, isDark && styles.searchBarDark]}>
          <Ionicons
            name="search"
            size={18}
            color={isDark ? '#818CF8' : '#6366F1'}
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={[styles.searchInput, isDark && { color: '#F9FAFB' }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Type name or email to search..."
            placeholderTextColor={isDark ? '#4B5563' : COLORS.outlineVariant}
            autoFocus
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color={isDark ? '#9CA3AF' : COLORS.outline} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Results List or States */}
        {isLoading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="small" color="#6366F1" />
            <Text style={[styles.stateText, isDark && { color: '#9CA3AF' }]}>
              Searching registered app users...
            </Text>
          </View>
        ) : searchResults && searchResults.length > 0 ? (
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.sectionHeader, isDark && { color: '#9CA3AF' }]}>
              Matching App Users ({searchResults.length})
            </Text>

            {searchResults.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={[styles.userCard, isDark && styles.userCardDark]}
                onPress={() => handleSelect(user)}
                activeOpacity={0.8}
              >
                <Image
                  source={{
                    uri:
                      user.image ||
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuD5T5AJUovvhA_WnRPgEHHUebHGXF5_1EiHG95y-QfKq2nOO07Mu6O3nzSp4AjHOG8hjAGd0Le9T3VMsQ554EcRvn-FBqlSpjy3oLYsJUgXfzsRNskrMk9B58aBpvnyrr9dunlwrQ3t-uLtHtQ5AeVKOCn-64fTFblLeVHlXrsHWRLrpvOIYhhnMeriv4c4aLSPUpLcih10KZ6yXzN32ixRZd3TUiAozHsESLzxhXawBgffwZTpUF4UXguT6m8ijF1N9kQL0fwVx9xM',
                  }}
                  style={styles.userAvatar}
                />

                <View style={styles.userInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.userName, isDark && { color: '#F9FAFB' }]}>
                      {user.name}
                    </Text>
                    <View style={styles.appUserTag}>
                      <Ionicons name="checkmark-circle" size={10} color="#6366F1" />
                      <Text style={styles.appUserTagText}>App User</Text>
                    </View>
                  </View>
                  <Text style={[styles.userEmail, isDark && { color: '#9CA3AF' }]}>
                    {user.email}
                  </Text>
                </View>

                <View style={styles.selectBadge}>
                  <Ionicons name="link" size={12} color="#ffffff" style={{ marginRight: 4 }} />
                  <Text style={styles.selectBadgeText}>Link</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : searchQuery.trim().length >= 2 ? (
          <View style={styles.stateContainer}>
            <View style={[styles.emptyIconBg, isDark && styles.emptyIconBgDark]}>
              <Ionicons
                name="person-remove-outline"
                size={28}
                color={isDark ? '#818CF8' : '#6366F1'}
              />
            </View>
            <Text style={[styles.emptyTitle, isDark && { color: '#F9FAFB' }]}>
              No Registered App User Found
            </Text>
            <Text style={[styles.emptySub, isDark && { color: '#9CA3AF' }]}>
              No registered user matches &quot;{searchQuery}&quot;. You can still enter their name
              manually on the record.
            </Text>
          </View>
        ) : (
          <View style={styles.stateContainer}>
            <View style={[styles.emptyIconBg, isDark && styles.emptyIconBgDark]}>
              <Ionicons name="people-outline" size={30} color={isDark ? '#818CF8' : '#6366F1'} />
            </View>
            <Text style={[styles.emptyTitle, isDark && { color: '#F9FAFB' }]}>
              Find Registered App Users
            </Text>
            <Text style={[styles.emptySub, isDark && { color: '#9CA3AF' }]}>
              Search by name or email to auto-link dual records in both accounts.
            </Text>
          </View>
        )}
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    minHeight: 320,
    maxHeight: 480,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    marginBottom: 16,
  },
  searchBarDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(129, 140, 248, 0.3)',
  },
  searchInput: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  listContent: {
    gap: 10,
    paddingBottom: 16,
  },
  sectionHeader: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    gap: 12,
  },
  userCardDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  userEmail: {
    fontSize: 11.5,
    color: COLORS.outline,
  },
  appUserTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  appUserTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6366F1',
  },
  selectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  selectBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 16,
    gap: 8,
  },
  stateText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.outline,
  },
  emptyIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyIconBgDark: {
    backgroundColor: 'rgba(129, 140, 248, 0.18)',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.outline,
    textAlign: 'center',
    lineHeight: 17,
  },
});
