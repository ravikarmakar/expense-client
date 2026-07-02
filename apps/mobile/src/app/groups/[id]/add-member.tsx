import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { useGroup, useAddMember, useSearchUsers, getErrorMessage } from '@workspace/api';

export default function AddMemberScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: group } = useGroup(id);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: searchResults, isLoading: isSearching } = useSearchUsers(searchQuery);
  const addMember = useAddMember(id);

  const handleAddMember = (email: string) => {
    // Check if user is already a member
    const isAlreadyMember = group?.members.some(
      (m) => m.email.toLowerCase() === email.toLowerCase()
    );
    if (isAlreadyMember) {
      Alert.alert('Already Member', 'This user is already a member of the group.');
      return;
    }

    Alert.alert('Add Member', `Are you sure you want to add ${email} to the group?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Add',
        style: 'default',
        onPress: () => {
          setIsSubmitting(true);
          addMember.mutate(
            { email },
            {
              onSuccess: () => {
                setIsSubmitting(false);
                Alert.alert('Success! 🎉', `${email} has been added to the group.`, [
                  { text: 'OK', onPress: () => router.back() },
                ]);
              },
              onError: (err) => {
                setIsSubmitting(false);
                Alert.alert('Failed to Add', getErrorMessage(err, 'Failed to add member.'));
              },
            }
          );
        },
      },
    ]);
  };

  const isEmail = (str: string) => {
    return /\S+@\S+\.\S+/.test(str);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Add Member</Text>
          {group && (
            <Text style={styles.groupSubtitle}>
              to {group.emoji} {group.name}
            </Text>
          )}
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Search Row */}
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color={COLORS.outline} style={styles.searchIcon} />
          <TextInput
            style={styles.textInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name or email…"
            placeholderTextColor={COLORS.outlineVariant}
            autoCapitalize="none"
            autoFocus
          />
          {isSearching && <ActivityIndicator size="small" color={COLORS.secondary} />}
          {searchQuery.length > 0 && !isSearching && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.outline} />
            </TouchableOpacity>
          )}
        </View>

        {/* Results / Direct Action */}
        <FlatList
          data={searchResults ?? []}
          keyExtractor={(item) => item.id}
          style={styles.resultsList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            searchQuery.trim().length >= 2 && !isSearching ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={48} color={COLORS.outlineVariant} />
                <Text style={styles.emptyText}>No users found for &quot;{searchQuery}&quot;</Text>
                {isEmail(searchQuery) && (
                  <TouchableOpacity
                    style={styles.directAddBtn}
                    onPress={() => handleAddMember(searchQuery.trim())}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="mail" size={18} color="#fff" />
                        <Text style={styles.directAddBtnText}>
                          Add &quot;{searchQuery.trim()}&quot; directly
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ) : searchQuery.trim().length < 2 ? (
              <View style={styles.infoContainer}>
                <Ionicons name="search" size={48} color={COLORS.outlineVariant} />
                <Text style={styles.infoText}>Search for users by name or email</Text>
                {isEmail(searchQuery.trim()) && (
                  <TouchableOpacity
                    style={styles.directAddBtn}
                    onPress={() => handleAddMember(searchQuery.trim())}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="mail" size={18} color="#fff" />
                        <Text style={styles.directAddBtnText}>
                          Ad d &quot;{searchQuery.trim()}&quot; directly
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.memberItem}
              onPress={() => handleAddMember(item.email)}
              activeOpacity={0.7}
              disabled={isSubmitting}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
              </View>
              <View style={styles.addIconBtn}>
                <Ionicons name="person-add" size={18} color={COLORS.secondary} />
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainer,
  },
  backBtn: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  groupSubtitle: {
    fontSize: 12,
    color: COLORS.outline,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: COLORS.onSurface,
    fontSize: 15,
    fontWeight: '500',
  },
  resultsList: {
    flex: 1,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  email: {
    fontSize: 13,
    color: COLORS.outline,
  },
  addIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.outline,
    textAlign: 'center',
    fontWeight: '500',
  },
  infoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.outline,
    textAlign: 'center',
    fontWeight: '500',
  },
  directAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginTop: 12,
  },
  directAddBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
