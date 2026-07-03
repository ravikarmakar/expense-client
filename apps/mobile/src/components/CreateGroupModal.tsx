import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import {
  useCreateGroup,
  useSearchUsers,
  clientCreateGroupSchema,
  getErrorMessage,
  MAX_GROUP_MEMBERS,
  GROUP_TYPES,
  type UserSearchResult,
  type GroupType,
} from '@workspace/api';
import { BottomSheetModal } from './BottomSheetModal';
import { FormInput } from './FormInput';
import { DropdownSelector } from './DropdownSelector';

export const TYPE_EMOJIS: Record<GroupType, string> = {
  Roommates: '🏠',
  Travel: '✈️',
  Friends: '👥',
  Family: '🏠',
  Office: '💼',
  Event: '🎉',
  Couple: '👥',
  Study: '📚',
  'Food / Mess': '🍽️',
  Gaming: '🎮',
  Other: '👥',
};

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (groupId: string) => void;
}

type Step = 'INFO' | 'MEMBERS' | 'REVIEW';

const StepInfo = React.memo(function StepInfo({
  name,
  onChangeName,
  description,
  onChangeDescription,
  type,
  onChangeType,
  isTypeDropdownOpen,
  onToggleTypeDropdown,
  onNext,
}: {
  name: string;
  onChangeName: (t: string) => void;
  description: string;
  onChangeDescription: (t: string) => void;
  type: GroupType;
  onChangeType: (type: GroupType) => void;
  isTypeDropdownOpen: boolean;
  onToggleTypeDropdown: () => void;
  onNext: () => void;
}) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.stepContent}
    >
      <FormInput
        label="Group Name *"
        value={name}
        onChangeText={onChangeName}
        placeholder="e.g. Europe Trip 2024"
        icon="people-outline"
        maxLength={50}
        showCharCount
        autoFocus
      />

      <FormInput
        label="Description (optional)"
        value={description}
        onChangeText={onChangeDescription}
        placeholder="What is this group for?"
        multiline
        numberOfLines={3}
        maxLength={200}
      />

      <DropdownSelector
        label="Group Type"
        isOpen={isTypeDropdownOpen}
        onToggle={onToggleTypeDropdown}
        selectedItem={type}
        placeholder="Select Type"
        options={GROUP_TYPES as any}
        getOptionKey={(item) => item}
        onSelect={onChangeType}
        renderHeaderContent={(item) => (
          <Text style={styles.dropdownHeaderText}>
            {TYPE_EMOJIS[item]} {item}
          </Text>
        )}
        renderOptionContent={(item) => (
          <Text style={styles.dropdownItemLabel}>
            {TYPE_EMOJIS[item]} {item}
          </Text>
        )}
      />

      <TouchableOpacity
        style={[styles.primaryBtn, name.trim().length < 3 && styles.primaryBtnDisabled]}
        onPress={onNext}
        disabled={name.trim().length < 3}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryBtnText}>Next: Add Members →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
});

const StepMembers = React.memo(function StepMembers({
  searchResults,
  isSearching,
  searchQuery,
  onChangeSearchQuery,
  selectedMembers,
  onToggleMember,
  onNext,
  onBack,
}: {
  searchResults: UserSearchResult[];
  isSearching: boolean;
  searchQuery: string;
  onChangeSearchQuery: (t: string) => void;
  selectedMembers: UserSearchResult[];
  onToggleMember: (user: UserSearchResult) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <View style={styles.membersStep}>
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        style={styles.searchList}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            {/* Member count badge */}
            <View style={styles.memberCountRow}>
              <Text style={styles.memberCountLabel}>
                Members added ({selectedMembers.length}/{MAX_GROUP_MEMBERS - 1})
              </Text>
              {selectedMembers.length > 0 && (
                <View style={styles.memberAvatarRow}>
                  {selectedMembers.slice(0, 4).map((m, i) => (
                    <View key={m.id} style={[styles.memberAvatar, { marginLeft: i > 0 ? -8 : 0 }]}>
                      <Text style={styles.memberAvatarText}>{m.name.charAt(0).toUpperCase()}</Text>
                    </View>
                  ))}
                  {selectedMembers.length > 4 && (
                    <View style={[styles.memberAvatar, { marginLeft: -8 }]}>
                      <Text style={styles.memberAvatarText}>+{selectedMembers.length - 4}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Search input */}
            <View style={styles.searchRow}>
              <Ionicons name="search" size={18} color={COLORS.outline} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={searchQuery}
                onChangeText={onChangeSearchQuery}
                placeholder="Search by name or email…"
                placeholderTextColor={COLORS.outlineVariant}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {isSearching && <ActivityIndicator size="small" color={COLORS.secondary} />}
            </View>
          </View>
        }
        ListFooterComponent={
          /* Actions */
          <View style={styles.membersActions}>
            <TouchableOpacity onPress={onNext} style={styles.primaryBtn} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>
                {selectedMembers.length === 0
                  ? 'Skip & Review →'
                  : `Review Group (${selectedMembers.length + 1} members) →`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          searchQuery.length >= 2 && !isSearching ? (
            <Text style={styles.emptySearchText}>No users found</Text>
          ) : searchQuery.length < 2 ? (
            <Text style={styles.emptySearchText}>Type at least 2 characters to search</Text>
          ) : null
        }
        renderItem={({ item }) => {
          const isAdded = selectedMembers.some((m) => m.id === item.id);
          return (
            <TouchableOpacity
              style={styles.searchResultItem}
              onPress={() => onToggleMember(item)}
              activeOpacity={0.7}
            >
              <View style={styles.searchResultAvatar}>
                <Text style={styles.searchResultAvatarText}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.searchResultInfo}>
                <Text style={styles.searchResultName}>{item.name}</Text>
                <Text style={styles.searchResultEmail}>{item.email}</Text>
              </View>
              <View style={[styles.toggleBtn, isAdded && styles.toggleBtnAdded]}>
                <Ionicons
                  name={isAdded ? 'checkmark' : 'add'}
                  size={18}
                  color={isAdded ? '#fff' : COLORS.secondary}
                />
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
});

const StepReview = React.memo(function StepReview({
  name,
  description,
  type,
  selectedMembers,
  onToggleMember,
  onSubmit,
  onBack,
  isPending,
}: {
  name: string;
  description: string;
  type: GroupType;
  selectedMembers: UserSearchResult[];
  onToggleMember: (user: UserSearchResult) => void;
  onSubmit: () => void;
  onBack: () => void;
  isPending: boolean;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.stepContent}>
      {/* Group preview card */}
      <View style={styles.reviewCard}>
        <Text style={styles.reviewEmoji}>{TYPE_EMOJIS[type]}</Text>
        <Text style={styles.reviewName}>{name}</Text>
        {description ? <Text style={styles.reviewDescription}>{description}</Text> : null}
        <View style={styles.reviewMeta}>
          <Ionicons name="people" size={14} color={COLORS.outline} />
          <Text style={styles.reviewMetaText}>
            {selectedMembers.length + 1} member{selectedMembers.length !== 0 ? 's' : ''}
            {selectedMembers.length === 0 ? ' (just you)' : ''}
          </Text>
        </View>
      </View>

      {/* Member list */}
      {selectedMembers.length > 0 && (
        <View style={styles.reviewMemberList}>
          <Text style={styles.inputLabel}>Members</Text>
          {selectedMembers.map((m) => (
            <View key={m.id} style={styles.reviewMemberItem}>
              <View style={styles.reviewMemberAvatar}>
                <Text style={styles.reviewMemberAvatarText}>{m.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewMemberName}>{m.name}</Text>
                <Text style={styles.reviewMemberEmail}>{m.email}</Text>
              </View>
              <TouchableOpacity onPress={() => onToggleMember(m)}>
                <Ionicons name="close-circle" size={20} color={COLORS.outline} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[styles.primaryBtn, isPending && styles.primaryBtnDisabled]}
        onPress={onSubmit}
        disabled={isPending}
        activeOpacity={0.85}
      >
        {isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={[styles.primaryBtnText, { marginLeft: 8 }]}>Create Group</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
});

export function CreateGroupModal({ visible, onClose, onSuccess }: CreateGroupModalProps) {
  const [step, setStep] = useState<Step>('INFO');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<GroupType>('Other');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<UserSearchResult[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const createGroup = useCreateGroup();
  const { data: searchResults, isLoading: isSearching } = useSearchUsers(searchQuery);

  const resetForm = React.useCallback(() => {
    setStep('INFO');
    setName('');
    setDescription('');
    setType('Other');
    setIsTypeDropdownOpen(false);
    setSearchQuery('');
    setSelectedMembers([]);
    setErrorMessage('');
  }, []);

  const handleClose = React.useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleInfoNext = React.useCallback(() => {
    const validation = clientCreateGroupSchema.pick({ name: true }).safeParse({ name });
    if (!validation.success) {
      setErrorMessage(validation.error.issues[0].message);
      return;
    }
    setErrorMessage('');
    setStep('MEMBERS');
  }, [name]);

  const toggleMember = React.useCallback(
    (user: UserSearchResult) => {
      const alreadyAdded = selectedMembers.some((m) => m.id === user.id);
      if (alreadyAdded) {
        setSelectedMembers((prev) => prev.filter((m) => m.id !== user.id));
      } else {
        if (selectedMembers.length >= MAX_GROUP_MEMBERS - 1) {
          setErrorMessage(`You can add at most ${MAX_GROUP_MEMBERS - 1} members`);
          return;
        }
        setErrorMessage('');
        setSelectedMembers((prev) => [...prev, user]);
      }
    },
    [selectedMembers]
  );

  const handleSubmit = React.useCallback(() => {
    setErrorMessage('');
    const validation = clientCreateGroupSchema.safeParse({
      name,
      description: description.trim() || undefined,
      emoji: TYPE_EMOJIS[type] || '👥',
      type,
      memberEmails: selectedMembers.map((m) => m.email),
    });

    if (!validation.success) {
      setErrorMessage(validation.error.issues[0].message);
      return;
    }

    createGroup.mutate(validation.data, {
      onSuccess: (group) => {
        handleClose();
        onSuccess?.(group.id);
      },
      onError: (err) => {
        setErrorMessage(getErrorMessage(err, 'Failed to create group. Please try again.'));
      },
    });
  }, [name, description, type, selectedMembers, handleClose, onSuccess]);

  const handleChangeName = React.useCallback(
    (t: string) => {
      setName(t);
      if (errorMessage) setErrorMessage('');
    },
    [errorMessage]
  );

  const handleChangeDescription = React.useCallback((t: string) => {
    setDescription(t);
  }, []);

  const handleChangeType = React.useCallback((t: GroupType) => {
    setType(t);
    setIsTypeDropdownOpen(false);
  }, []);

  const handleToggleTypeDropdown = React.useCallback(() => {
    setIsTypeDropdownOpen((prev) => !prev);
  }, []);

  const handleChangeSearchQuery = React.useCallback((t: string) => {
    setSearchQuery(t);
  }, []);

  const handleGoToMembers = React.useCallback(() => {
    setStep('MEMBERS');
  }, []);

  const handleGoToReview = React.useCallback(() => {
    setStep('REVIEW');
  }, []);

  const handleGoToInfo = React.useCallback(() => {
    setStep('INFO');
  }, []);

  const progress = step === 'INFO' ? 1 : step === 'MEMBERS' ? 2 : 3;

  return (
    <BottomSheetModal visible={visible} onClose={handleClose} title="Create Group">
      {/* Progress */}
      <View style={styles.progressRow}>
        {[1, 2, 3].map((n) => (
          <View key={n} style={[styles.progressDot, n <= progress && styles.progressDotActive]} />
        ))}
      </View>

      {/* Error banner */}
      {errorMessage ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color={COLORS.error} />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {/* ── Step 1: Group Info ── */}
      {step === 'INFO' && (
        <StepInfo
          name={name}
          onChangeName={handleChangeName}
          description={description}
          onChangeDescription={handleChangeDescription}
          type={type}
          onChangeType={handleChangeType}
          isTypeDropdownOpen={isTypeDropdownOpen}
          onToggleTypeDropdown={handleToggleTypeDropdown}
          onNext={handleInfoNext}
        />
      )}

      {/* ── Step 2: Add Members ── */}
      {step === 'MEMBERS' && (
        <StepMembers
          searchResults={searchResults ?? []}
          isSearching={isSearching}
          searchQuery={searchQuery}
          onChangeSearchQuery={handleChangeSearchQuery}
          selectedMembers={selectedMembers}
          onToggleMember={toggleMember}
          onNext={handleGoToReview}
          onBack={handleGoToInfo}
        />
      )}

      {/* ── Step 3: Review ── */}
      {step === 'REVIEW' && (
        <StepReview
          name={name}
          description={description}
          type={type}
          selectedMembers={selectedMembers}
          onToggleMember={toggleMember}
          onSubmit={handleSubmit}
          onBack={handleGoToMembers}
          isPending={createGroup.isPending}
        />
      )}
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '92%',
    flexShrink: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.outlineVariant,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.surfaceContainer,
  },
  progressDotActive: {
    backgroundColor: COLORS.secondary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.errorContainer,
    marginHorizontal: 24,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '600',
  },
  stepContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  emojiRow: {
    paddingBottom: 16,
    gap: 8,
  },
  emojiBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiBtnSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondaryFixed,
  },
  emojiText: { fontSize: 22 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    marginBottom: 16,
  },
  inputRowMultiline: {
    height: 80,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    marginHorizontal: 24,
    marginBottom: 8,
  },
  inputIcon: { marginRight: 10 },
  textInput: {
    flex: 1,
    color: COLORS.onSurface,
    fontSize: 15,
    fontWeight: '500',
  },
  textInputMultiline: {
    height: '100%',
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: COLORS.outline,
  },
  dropdownWrapper: {
    marginBottom: 20,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceContainerLow,
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  dropdownHeaderText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.onSurface,
  },
  dropdownList: {
    marginTop: 6,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    padding: 6,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.surfaceContainer,
  },
  dropdownItemLabel: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
  dropdownItemLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 20,
    width: '100%',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  primaryBtnDisabled: { opacity: 0.5, elevation: 0 },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  backBtn: { marginTop: 14, alignItems: 'center' },
  backBtnText: { fontSize: 13, color: COLORS.outline, fontWeight: '600' },
  // Members step
  membersStep: { height: 500 },
  memberCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  memberCountLabel: {
    fontSize: 12,
    color: COLORS.outline,
    fontWeight: '600',
  },
  memberAvatarRow: { flexDirection: 'row' },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  memberAvatarText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  searchList: { flexGrow: 1, marginHorizontal: 0 },
  emptySearchText: {
    textAlign: 'center',
    color: COLORS.outline,
    fontSize: 13,
    paddingVertical: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  searchResultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  searchResultAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  searchResultInfo: { flex: 1 },
  searchResultName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  searchResultEmail: { fontSize: 12, color: COLORS.outline },
  toggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnAdded: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  membersActions: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  // Review step
  reviewCard: {
    alignItems: 'center',
    backgroundColor: COLORS.primaryFixed,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  reviewEmoji: { fontSize: 48, marginBottom: 12 },
  reviewName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  reviewDescription: {
    fontSize: 13,
    color: COLORS.outline,
    textAlign: 'center',
    marginBottom: 12,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  reviewMetaText: { fontSize: 12, color: COLORS.outline, fontWeight: '600' },
  reviewMemberList: { marginBottom: 20 },
  reviewMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
    gap: 12,
  },
  reviewMemberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewMemberAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  reviewMemberName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  reviewMemberEmail: { fontSize: 12, color: COLORS.outline },
});
