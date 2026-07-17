import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../../constants/theme';
import { useRouteParams, idParamSchema } from '../../../hooks/useRouteParams';
import { useGroupAddMemberController } from '@workspace/api';
import { addMemberStyles as styles } from '../styles/group.styles';

export default function AddMemberScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useRouteParams(idParamSchema);

  // Business logic controller
  const {
    group,
    searchQuery,
    setSearchQuery,
    isSubmitting,
    submittingEmail,
    addedEmails,
    searchResults,
    isSearching,
    handleAddMember,
  } = useGroupAddMemberController({
    groupId: id,
    onAddMemberSuccess: () => {
      // Success is handled inline (green tick); no alert needed
    },
    onAddMemberError: (err) => {
      Alert.alert('Failed to Add', err);
    },
  });

  const isEmail = (str: string) => {
    return /\S+@\S+\.\S+/.test(str);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
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
                          Add &quot;{searchQuery.trim()}&quot; directly
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const emailLower = item.email.toLowerCase();
            const isAlreadyMember = group?.members.some(
              (m) => m.email.toLowerCase() === emailLower
            );
            const isAlreadyInvited = group?.invitedEmails?.some(
              (email) => email.toLowerCase() === emailLower
            );
            const isThisRowLoading = submittingEmail?.toLowerCase() === emailLower;
            const isJustAdded = addedEmails.has(emailLower);
            const isDisabled = isSubmitting || isAlreadyMember || isAlreadyInvited || isJustAdded;

            return (
              <TouchableOpacity
                style={[
                  styles.memberItem,
                  (isAlreadyMember || isAlreadyInvited) && { opacity: 0.6 },
                ]}
                onPress={() => handleAddMember(item.email)}
                activeOpacity={0.7}
                disabled={isDisabled}
              >
                <View style={styles.avatar}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                  )}
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.email}>{item.email}</Text>
                </View>

                {/* Right-side state indicator */}
                {isAlreadyMember ? (
                  <View style={[styles.statusBadge, { backgroundColor: '#e6f4ea' }]}>
                    <Text style={[styles.statusText, { color: '#137333' }]}>Member</Text>
                  </View>
                ) : isAlreadyInvited ? (
                  <View style={[styles.statusBadge, { backgroundColor: '#feefe3' }]}>
                    <Text style={[styles.statusText, { color: '#b06000' }]}>Invited</Text>
                  </View>
                ) : isThisRowLoading ? (
                  /* Loading spinner for this specific row */
                  <View style={styles.addIconBtn}>
                    <ActivityIndicator size="small" color={COLORS.secondary} />
                  </View>
                ) : isJustAdded ? (
                  /* Green success tick after add completes */
                  <View style={[styles.addIconBtn, { backgroundColor: '#e6f4ea' }]}>
                    <Ionicons name="checkmark" size={18} color="#137333" />
                  </View>
                ) : (
                  /* Default plus icon */
                  <View style={styles.addIconBtn}>
                    <Ionicons name="person-add" size={18} color={COLORS.secondary} />
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
