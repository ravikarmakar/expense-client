import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TopAppBar } from '../components/TopAppBar';
import { COLORS } from '../constants/theme';
import { useSearchUsersPaginated } from '@workspace/api';
import { FeatureUnavailableModal } from '../components/FeatureUnavailableModal';

export default function AddFriendScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(true);

  // React query search hook - disabled for V1 by passing empty string
  const {
    data: paginatedData,
    isLoading: isSearching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearchUsersPaginated('');

  const searchResults = paginatedData ? paginatedData.pages.flatMap((page) => page.users) : [];

  // Simulated state for added/requested friend IDs
  const [addedFriendIds, setAddedFriendIds] = useState<string[]>([]);
  const [loadingFriendId, setLoadingFriendId] = useState<string | null>(null);

  // Mock suggested friends list for display when query is empty
  const mockSuggestions = [
    {
      id: 'sug-1',
      name: 'Aarav Mehta',
      email: 'aarav.mehta@gmail.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=Aarav&backgroundColor=c8edd8',
    },
    {
      id: 'sug-2',
      name: 'Isha Sharma',
      email: 'isha.sharma@yahoo.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=Isha&backgroundColor=ffd5dc',
    },
    {
      id: 'sug-3',
      name: 'Kabir Verma',
      email: 'kabir.v@outlook.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=Kabir&backgroundColor=d3e2fd',
    },
  ];

  const handleAddFriend = (id: string, name: string) => {
    setLoadingFriendId(id);
    setTimeout(() => {
      setAddedFriendIds((prev) => [...prev, id]);
      setLoadingFriendId(null);
      Alert.alert('Friend Request Sent', `Invited ${name} to connect on SplitShare!`);
    }, 800);
  };

  return (
    <View style={styles.container}>
      <TopAppBar title="Add Friends" showBack={true} onBack={() => router.back()} />

      <View style={styles.content}>
        {/* Search Container */}
        <View style={styles.searchRow}>
          <Ionicons name="search" size={20} color={COLORS.outline} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Adding friends is disabled for V1"
            placeholderTextColor={COLORS.outlineVariant}
            style={styles.searchInput}
            maxLength={50}
            editable={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color={COLORS.outline} />
            </TouchableOpacity>
          )}
        </View>

        {isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.secondary} />
            <Text style={styles.loadingText}>Searching users...</Text>
          </View>
        ) : searchQuery.length > 0 ? (
          <ScrollView
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.sectionHeader}>Search Results</Text>

            {searchResults && searchResults.length > 0 ? (
              <>
                {searchResults.map((user) => {
                  const isRequested = addedFriendIds.includes(user.id);
                  const isItemLoading = loadingFriendId === user.id;

                  return (
                    <View key={user.id} style={styles.resultCard}>
                      <View style={styles.userAvatarContainer}>
                        <Text style={styles.avatarLabel}>{user.name.charAt(0).toUpperCase()}</Text>
                      </View>
                      <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                      </View>

                      <TouchableOpacity
                        style={[styles.actionBtn, isRequested && styles.actionBtnRequested]}
                        onPress={() => !isRequested && handleAddFriend(user.id, user.name)}
                        disabled={isRequested || isItemLoading}
                        activeOpacity={0.7}
                      >
                        {isItemLoading ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : isRequested ? (
                          <>
                            <Ionicons
                              name="checkmark-circle"
                              size={16}
                              color="#137333"
                              style={{ marginRight: 4 }}
                            />
                            <Text style={styles.actionBtnTextRequested}>Requested</Text>
                          </>
                        ) : (
                          <>
                            <Ionicons
                              name="person-add"
                              size={14}
                              color="#ffffff"
                              style={{ marginRight: 4 }}
                            />
                            <Text style={styles.actionBtnText}>Add</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })}

                {hasNextPage && (
                  <TouchableOpacity
                    style={[styles.loadMoreBtn, isFetchingNextPage && { opacity: 0.7 }]}
                    onPress={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    activeOpacity={0.7}
                  >
                    {isFetchingNextPage ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                      <>
                        <Ionicons
                          name="chevron-down"
                          size={16}
                          color={COLORS.primary}
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.loadMoreBtnText}>Load More</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={48} color={COLORS.outlineVariant} />
                <Text style={styles.emptyTitle}>No users found</Text>
                <Text style={styles.emptyText}>
                  Check the spelling or try searching for another email.
                </Text>
              </View>
            )}
          </ScrollView>
        ) : (
          <ScrollView
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.sectionHeader}>Suggested Friends</Text>

            {mockSuggestions.map((user) => {
              const isRequested = addedFriendIds.includes(user.id);
              const isItemLoading = loadingFriendId === user.id;

              return (
                <View key={user.id} style={styles.resultCard}>
                  <View style={styles.userAvatarContainer}>
                    <Text style={styles.avatarLabel}>{user.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.actionBtn, isRequested && styles.actionBtnRequested]}
                    onPress={() => !isRequested && handleAddFriend(user.id, user.name)}
                    disabled={isRequested || isItemLoading}
                    activeOpacity={0.7}
                  >
                    {isItemLoading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : isRequested ? (
                      <>
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color="#137333"
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.actionBtnTextRequested}>Requested</Text>
                      </>
                    ) : (
                      <>
                        <Ionicons
                          name="person-add"
                          size={14}
                          color="#ffffff"
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.actionBtnText}>Add</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
      <FeatureUnavailableModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          router.back();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainer,
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  clearBtn: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.outline,
  },
  listContent: {
    gap: 12,
    paddingBottom: 20,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    paddingLeft: 4,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    alignItems: 'center',
    gap: 12,
  },
  userAvatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.outline,
  },
  actionBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 70,
  },
  actionBtnRequested: {
    backgroundColor: '#e6f4ea',
    borderWidth: 1,
    borderColor: '#c8edd8',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtnTextRequested: {
    color: '#137333',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.outline,
    textAlign: 'center',
    lineHeight: 18,
  },
  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderColor: COLORS.surfaceContainer,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 10,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
  },
  loadMoreBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
