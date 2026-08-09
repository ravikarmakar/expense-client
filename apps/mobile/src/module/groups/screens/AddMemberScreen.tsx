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
import { useTheme } from '../../../context/ThemeContext';
import { AppBackground } from '../../../components/AppBackground';

export default function AddMemberScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useRouteParams(idParamSchema);
  const { isDark } = useTheme();

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
    <AppBackground style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { paddingTop: insets.top, height: 56 + insets.top },
            isDark && {
              backgroundColor: '#0D1714',
              borderBottomColor: 'rgba(255, 255, 255, 0.08)',
            },
          ]}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#F9FAFB' : COLORS.onSurface} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, isDark && { color: '#F9FAFB' }]}>Add Member</Text>
            {group && (
              <Text style={[styles.groupSubtitle, isDark && { color: '#9CA3AF' }]}>
                to {group.emoji} {group.name}
              </Text>
            )}
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Search Row */}
          <View
            style={[
              styles.searchRow,
              isDark && { backgroundColor: '#101917', borderColor: 'rgba(255, 255, 255, 0.08)' },
            ]}
          >
            <Ionicons
              name="search"
              size={18}
              color={isDark ? '#9CA3AF' : COLORS.outline}
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.textInput, isDark && { color: '#F9FAFB' }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name or email…"
              placeholderTextColor={isDark ? '#6B7280' : COLORS.outlineVariant}
              autoCapitalize="none"
              autoFocus
            />
            {isSearching && (
              <ActivityIndicator size="small" color={isDark ? '#34D399' : COLORS.secondary} />
            )}
            {searchQuery.length > 0 && !isSearching && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={isDark ? '#9CA3AF' : COLORS.outline}
                />
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
                  <Ionicons
                    name="people-outline"
                    size={48}
                    color={isDark ? 'rgba(255, 255, 255, 0.3)' : COLORS.outlineVariant}
                  />
                  <Text style={[styles.emptyText, isDark && { color: '#9CA3AF' }]}>
                    No users found for &quot;{searchQuery}&quot;
                  </Text>
                  {isEmail(searchQuery) && (
                    <TouchableOpacity
                      style={[styles.directAddBtn, isDark && { backgroundColor: '#34D399' }]}
                      onPress={() => handleAddMember(searchQuery.trim())}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <>
                          <Ionicons name="mail" size={18} color={isDark ? '#08110F' : '#fff'} />
                          <Text style={[styles.directAddBtnText, isDark && { color: '#08110F' }]}>
                            Add &quot;{searchQuery.trim()}&quot; directly
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              ) : searchQuery.trim().length < 2 ? (
                <View style={styles.infoContainer}>
                  <Ionicons
                    name="search"
                    size={48}
                    color={isDark ? 'rgba(255, 255, 255, 0.3)' : COLORS.outlineVariant}
                  />
                  <Text style={[styles.infoText, isDark && { color: '#9CA3AF' }]}>
                    Search for users by name or email
                  </Text>
                  {isEmail(searchQuery.trim()) && (
                    <TouchableOpacity
                      style={[styles.directAddBtn, isDark && { backgroundColor: '#34D399' }]}
                      onPress={() => handleAddMember(searchQuery.trim())}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <>
                          <Ionicons name="mail" size={18} color={isDark ? '#08110F' : '#fff'} />
                          <Text style={[styles.directAddBtnText, isDark && { color: '#08110F' }]}>
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
                    isDark && {
                      backgroundColor: '#101917',
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                    },
                    (isAlreadyMember || isAlreadyInvited) && { opacity: 0.6 },
                  ]}
                  onPress={() => handleAddMember(item.email)}
                  activeOpacity={0.7}
                  disabled={isDisabled}
                >
                  <View style={[styles.avatar, isDark && { backgroundColor: '#1E292B' }]}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.avatarImage} />
                    ) : (
                      <Text style={[styles.avatarText, isDark && { color: '#34D399' }]}>
                        {item.name.charAt(0).toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <View style={styles.info}>
                    <Text style={[styles.name, isDark && { color: '#F9FAFB' }]}>{item.name}</Text>
                    <Text style={[styles.email, isDark && { color: '#9CA3AF' }]}>{item.email}</Text>
                  </View>

                  {/* Right-side state indicator */}
                  {isAlreadyMember ? (
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.15)' : '#e6f4ea' },
                      ]}
                    >
                      <Text style={[styles.statusText, { color: isDark ? '#34D399' : '#137333' }]}>
                        Member
                      </Text>
                    </View>
                  ) : isAlreadyInvited ? (
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : '#feefe3' },
                      ]}
                    >
                      <Text style={[styles.statusText, { color: isDark ? '#FBBF24' : '#b06000' }]}>
                        Invited
                      </Text>
                    </View>
                  ) : isThisRowLoading ? (
                    /* Loading spinner for this specific row */
                    <View
                      style={[
                        styles.addIconBtn,
                        isDark && { backgroundColor: 'rgba(52, 211, 153, 0.15)' },
                      ]}
                    >
                      <ActivityIndicator
                        size="small"
                        color={isDark ? '#34D399' : COLORS.secondary}
                      />
                    </View>
                  ) : isJustAdded ? (
                    /* Green success tick after add completes */
                    <View
                      style={[
                        styles.addIconBtn,
                        { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.25)' : '#e6f4ea' },
                      ]}
                    >
                      <Ionicons name="checkmark" size={18} color={isDark ? '#34D399' : '#137333'} />
                    </View>
                  ) : (
                    /* Default plus icon */
                    <View
                      style={[
                        styles.addIconBtn,
                        isDark && { backgroundColor: 'rgba(52, 211, 153, 0.15)' },
                      ]}
                    >
                      <Ionicons
                        name="person-add"
                        size={18}
                        color={isDark ? '#34D399' : COLORS.secondary}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </AppBackground>
  );
}
