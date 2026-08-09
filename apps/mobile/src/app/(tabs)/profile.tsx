import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, PREDEFINED_AVATARS, resolveAvatar } from '../../constants/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useSettingsController } from '@workspace/api';
import { hapticFeedback } from '../../utils/haptics';
import { useTheme } from '../../context/ThemeContext';

import { BottomSheetModal } from '../../components/BottomSheetModal';
import { TactileButton } from '../../components/TactileButton';
import { feedbackStyles } from '../../styles/feedbackStyles';

export default function ProfileTabScreen() {
  const {
    user,
    editName,
    setEditName,
    selectedAvatar,
    setSelectedAvatar,
    profileErrorMessage,
    profileModalVisible,
    setProfileModalVisible,
    handleOpenProfileModal,
    handleSaveProfile,
    isUpdatingProfile,
  } = useSettingsController({
    onSaveSuccess: () => {
      Alert.alert('Success', 'Profile updated successfully.');
    },
    onSaveError: (err) => {
      Alert.alert('Error', err);
    },
  });

  const insets = useSafeAreaInsets();
  const { isDark, setThemeMode } = useTheme();

  const handleShareProfile = async () => {
    hapticFeedback.selection();
    try {
      await Share.share({
        message: `Connect with ${user?.name || 'me'} on SplitShare to split bills effortlessly! Profile Code: ${user?.id?.slice(0, 8) || 'SPLIT123'}`,
      });
    } catch {
      // Ignored
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Fixed Top Bar */}
      <View
        style={[
          styles.headerContainer,
          isDark && styles.headerContainerDark,
          { paddingTop: insets.top + 16 },
        ]}
      >
        <View style={styles.tabHeaderRow}>
          <View>
            <Text style={[styles.tabTitle, isDark && styles.tabTitleDark]}>Profile</Text>
            <Text style={[styles.tabSubtitle, isDark && styles.tabSubtitleDark]}>
              Account & Ledger
            </Text>
          </View>
          <View style={styles.headerRightActions}>
            {/* Theme Toggle Button */}
            <TouchableOpacity
              style={[styles.headerActionBtn, isDark && styles.headerActionBtnDark]}
              activeOpacity={0.7}
              onPress={() => {
                hapticFeedback.selection();
                setThemeMode(isDark ? 'light' : 'dark');
              }}
            >
              <Ionicons
                name={isDark ? 'sunny' : 'moon-outline'}
                size={22}
                color={isDark ? '#FBBF24' : COLORS.onSurface}
              />
            </TouchableOpacity>

            {/* Dedicated Settings Button */}
            <TouchableOpacity
              style={[styles.headerActionBtn, isDark && styles.headerActionBtnDark]}
              activeOpacity={0.7}
              onPress={() => {
                hapticFeedback.selection();
                router.push('/settings');
              }}
            >
              <Ionicons
                name="settings-outline"
                size={22}
                color={isDark ? '#F3F4F6' : COLORS.onSurface}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={globalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Profile Card */}
        <View style={[styles.heroProfileCard, isDark && styles.heroProfileCardDark]}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: resolveAvatar(user?.image) }} style={styles.heroAvatar} />
            <TouchableOpacity
              style={[
                styles.avatarCameraBadge,
                isDark && { backgroundColor: '#34D399', borderColor: '#131D1A' },
              ]}
              activeOpacity={0.85}
              onPress={handleOpenProfileModal}
            >
              <Ionicons name="camera" size={14} color={isDark ? '#101917' : '#ffffff'} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.profileNameText, isDark && styles.profileNameTextDark]}>
            {user?.name || 'Alexander Wright'}
          </Text>

          <Text style={[styles.profileEmailText, isDark && styles.profileEmailTextDark]}>
            {user?.email || 'alexander.wright@splitshare.com'}
          </Text>

          {/* Verification Badge */}
          <View style={[styles.badgePill, isDark && styles.badgePillDark]}>
            <Ionicons
              name="shield-checkmark"
              size={13}
              color={isDark ? '#34D399' : COLORS.primary}
            />
            <Text style={[styles.badgePillText, isDark && styles.badgePillTextDark]}>
              Verified Member
            </Text>
          </View>

          {/* Edit Profile Action Button */}
          <TouchableOpacity
            style={[styles.editProfileBtn, isDark && styles.editProfileBtnDark]}
            activeOpacity={0.7}
            onPress={handleOpenProfileModal}
          >
            <Ionicons name="create-outline" size={15} color={isDark ? '#34D399' : COLORS.primary} />
            <Text style={[styles.editProfileBtnText, isDark && styles.editProfileBtnTextDark]}>
              Edit Profile Info
            </Text>
          </TouchableOpacity>
        </View>

        {/* Financial & Account Quick Hub Cards */}
        <Text style={[styles.sectionHeading, isDark && styles.sectionHeadingDark]}>
          Account Hub
        </Text>

        <View style={styles.hubGrid}>
          {/* Card 1: Personal Wallet */}
          <TouchableOpacity
            style={[styles.hubCard, isDark && styles.hubCardDark]}
            activeOpacity={0.75}
            onPress={() => router.push('/personal-wallet')}
          >
            <View
              style={[
                styles.hubIconBg,
                { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.15)' : '#e6f4ea' },
              ]}
            >
              <Ionicons name="wallet-outline" size={22} color={isDark ? '#34D399' : '#137333'} />
            </View>
            <Text style={[styles.hubCardTitle, isDark && styles.hubCardTitleDark]}>
              Personal Wallet
            </Text>
            <Text style={[styles.hubCardSub, isDark && styles.hubCardSubDark]}>Manage Balance</Text>
          </TouchableOpacity>

          {/* Card 2: Custom Categories */}
          <TouchableOpacity
            style={[styles.hubCard, isDark && styles.hubCardDark]}
            activeOpacity={0.75}
            onPress={() => router.push('/categories')}
          >
            <View
              style={[
                styles.hubIconBg,
                { backgroundColor: isDark ? 'rgba(96, 165, 250, 0.15)' : '#e2f2ff' },
              ]}
            >
              <Ionicons name="grid-outline" size={22} color={isDark ? '#60A5FA' : '#0066cc'} />
            </View>
            <Text style={[styles.hubCardTitle, isDark && styles.hubCardTitleDark]}>Categories</Text>
            <Text style={[styles.hubCardSub, isDark && styles.hubCardSubDark]}>Custom Icons</Text>
          </TouchableOpacity>

          {/* Card 3: Activity Logs */}
          <TouchableOpacity
            style={[styles.hubCard, isDark && styles.hubCardDark]}
            activeOpacity={0.75}
            onPress={() => router.push('/activity-logs')}
          >
            <View
              style={[
                styles.hubIconBg,
                { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : '#fef7e0' },
              ]}
            >
              <Ionicons name="list-outline" size={22} color={isDark ? '#FBBF24' : '#b06000'} />
            </View>
            <Text style={[styles.hubCardTitle, isDark && styles.hubCardTitleDark]}>
              Activity Logs
            </Text>
            <Text style={[styles.hubCardSub, isDark && styles.hubCardSubDark]}>Feed History</Text>
          </TouchableOpacity>

          {/* Card 4: Change Password */}
          <TouchableOpacity
            style={[styles.hubCard, isDark && styles.hubCardDark]}
            activeOpacity={0.75}
            onPress={() => router.push('/change-password')}
          >
            <View
              style={[
                styles.hubIconBg,
                { backgroundColor: isDark ? 'rgba(248, 113, 113, 0.15)' : '#fce8e6' },
              ]}
            >
              <Ionicons name="key-outline" size={22} color={isDark ? '#F87171' : '#c5221f'} />
            </View>
            <Text style={[styles.hubCardTitle, isDark && styles.hubCardTitleDark]}>Security</Text>
            <Text style={[styles.hubCardSub, isDark && styles.hubCardSubDark]}>Password</Text>
          </TouchableOpacity>
        </View>

        {/* Share Profile Banner */}
        <View style={[styles.shareBannerCard, isDark && styles.shareBannerCardDark]}>
          <View style={styles.shareLeftColumn}>
            <Text style={[styles.shareBannerTitle, isDark && styles.shareBannerTitleDark]}>
              Invite & Split Bills
            </Text>
            <Text style={[styles.shareBannerDesc, isDark && styles.shareBannerDescDark]}>
              Share your SplitShare link with friends to join groups quickly.
            </Text>
            <TouchableOpacity
              style={[styles.shareBtn, isDark && styles.shareBtnDark]}
              activeOpacity={0.8}
              onPress={handleShareProfile}
            >
              <Ionicons
                name="share-social-outline"
                size={15}
                color={isDark ? '#101917' : '#ffffff'}
              />
              <Text style={[styles.shareBtnText, isDark && styles.shareBtnTextDark]}>
                Share Profile
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.shareRightIcon}>
            <Ionicons
              name="qr-code-outline"
              size={54}
              color={isDark ? '#34D399' : COLORS.primary}
            />
          </View>
        </View>

        {/* App Settings Navigation Row */}
        <TouchableOpacity
          style={[styles.settingsNavCard, isDark && styles.settingsNavCardDark]}
          activeOpacity={0.8}
          onPress={() => router.push('/settings')}
        >
          <View style={styles.settingsNavLeft}>
            <View style={[styles.navIconBg, isDark && styles.navIconBgDark]}>
              <Ionicons
                name="options-outline"
                size={22}
                color={isDark ? '#34D399' : COLORS.primary}
              />
            </View>
            <View>
              <Text style={[styles.settingsNavTitle, isDark && styles.settingsNavTitleDark]}>
                App Settings & Preferences
              </Text>
              <Text style={[styles.settingsNavSub, isDark && styles.settingsNavSubDark]}>
                Theme, Notifications & Security
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? '#6B7280' : COLORS.outlineVariant}
          />
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Bottom Sheet Modal */}
      <BottomSheetModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        title="Edit Profile"
        variant={isDark ? 'dark' : 'light'}
      >
        <ScrollView
          style={{ width: '100%' }}
          contentContainerStyle={styles.modalForm}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          {profileErrorMessage ? (
            <View style={feedbackStyles.errorContainer}>
              <Ionicons name="alert-circle" size={18} color={COLORS.error} />
              <Text style={feedbackStyles.errorText}>{profileErrorMessage}</Text>
            </View>
          ) : null}

          {/* Current Avatar Preview */}
          <View style={styles.avatarPreviewContainer}>
            <Image
              source={{ uri: resolveAvatar(selectedAvatar) }}
              style={styles.largeAvatarPreview}
            />
            <Text style={[styles.avatarPreviewLabel, isDark && { color: '#9CA3AF' }]}>
              Selected Avatar
            </Text>
          </View>

          {/* Name Input */}
          <Text style={[styles.inputLabel, isDark && { color: '#FFFFFF' }]}>Full Name</Text>
          <View
            style={[
              styles.inputContainer,
              isDark && {
                backgroundColor: '#101917',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              },
              isUpdatingProfile && { opacity: 0.6 },
            ]}
          >
            <Ionicons
              name="person-outline"
              size={20}
              color={isDark ? '#10B981' : COLORS.primary}
              style={styles.inputIcon}
            />
            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter your name"
              placeholderTextColor={isDark ? '#74817B' : COLORS.outlineVariant}
              style={[styles.textInput, isDark && { color: '#FFFFFF' }]}
              editable={!isUpdatingProfile}
              maxLength={40}
            />
          </View>

          {/* Avatar Selection Grid */}
          <Text style={[styles.inputLabel, isDark && { color: '#FFFFFF' }]}>Choose Avatar</Text>
          <View
            style={[
              styles.avatarScrollContainer,
              isDark && {
                backgroundColor: '#101917',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              },
            ]}
          >
            <ScrollView
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.avatarGrid}
            >
              {PREDEFINED_AVATARS.map((avatarUrl, idx) => {
                const isSelected =
                  selectedAvatar === avatarUrl || resolveAvatar(selectedAvatar) === avatarUrl;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.avatarGridItem,
                      isSelected && styles.avatarGridItemActive,
                      isSelected && isDark && { borderColor: '#10B981' },
                    ]}
                    onPress={() => setSelectedAvatar(avatarUrl)}
                    activeOpacity={0.7}
                    disabled={isUpdatingProfile}
                  >
                    <Image source={{ uri: avatarUrl }} style={styles.gridAvatarImage} />
                    {isSelected && (
                      <View style={[styles.checkBadge, isDark && { backgroundColor: '#10B981' }]}>
                        <Ionicons name="checkmark" size={10} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <TactileButton
            title="Save Changes"
            icon="checkmark-circle"
            provider="emerald"
            onPress={handleSaveProfile}
            loading={isUpdatingProfile}
            disabled={!editName.trim()}
            style={styles.saveProfileBtn}
          />
        </ScrollView>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  containerDark: {
    backgroundColor: '#08110F',
  },
  headerContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  headerContainerDark: {
    backgroundColor: '#0D1714',
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  tabTitleDark: {
    color: '#F9FAFB',
  },
  tabSubtitle: {
    fontSize: 12,
    color: COLORS.outline,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tabSubtitleDark: {
    color: '#9CA3AF',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionBtnDark: {
    backgroundColor: '#131D1A',
  },
  // Hero Profile Card
  heroProfileCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    marginBottom: 20,
  },
  heroProfileCardDark: {
    backgroundColor: '#131D1A',
    borderColor: '#1E292B',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  heroAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileNameText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  profileNameTextDark: {
    color: '#F9FAFB',
  },
  profileEmailText: {
    fontSize: 13,
    color: COLORS.outline,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 10,
  },
  profileEmailTextDark: {
    color: '#9CA3AF',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 105, 72, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 14,
  },
  badgePillDark: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
  },
  badgePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  badgePillTextDark: {
    color: '#34D399',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  editProfileBtnDark: {
    backgroundColor: '#0D1714',
    borderColor: '#1E292B',
  },
  editProfileBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  editProfileBtnTextDark: {
    color: '#34D399',
  },
  // Section Headings
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    paddingLeft: 4,
  },
  sectionHeadingDark: {
    color: '#34D399',
  },
  // Hub Grid Cards
  hubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  hubCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  hubCardDark: {
    backgroundColor: '#131D1A',
    borderColor: '#1E292B',
  },
  hubIconBg: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  hubCardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  hubCardTitleDark: {
    color: '#F9FAFB',
  },
  hubCardSub: {
    fontSize: 11.5,
    color: COLORS.outline,
    fontWeight: '500',
    marginTop: 2,
  },
  hubCardSubDark: {
    color: '#9CA3AF',
  },
  // Share Banner Card
  shareBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#006948',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  shareBannerCardDark: {
    backgroundColor: '#0D2D24',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
  },
  shareLeftColumn: {
    flex: 1,
    marginRight: 12,
  },
  shareBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  shareBannerTitleDark: {
    color: '#F9FAFB',
  },
  shareBannerDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: 12,
  },
  shareBannerDescDark: {
    color: '#9CA3AF',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  shareBtnDark: {
    backgroundColor: '#34D399',
  },
  shareBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#006948',
  },
  shareBtnTextDark: {
    color: '#101917',
  },
  shareRightIcon: {
    opacity: 0.9,
  },
  // Settings Navigation Card
  settingsNavCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  settingsNavCardDark: {
    backgroundColor: '#131D1A',
  },
  settingsNavLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  navIconBg: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 105, 72, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconBgDark: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
  },
  settingsNavTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  settingsNavTitleDark: {
    color: '#F9FAFB',
  },
  settingsNavSub: {
    fontSize: 11.5,
    color: COLORS.outline,
    fontWeight: '500',
    marginTop: 2,
  },
  settingsNavSubDark: {
    color: '#9CA3AF',
  },
  // Modal Form & Controls
  modalForm: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  avatarPreviewContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  largeAvatarPreview: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: COLORS.secondary,
    marginBottom: 8,
  },
  avatarPreviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.outline,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginBottom: 8,
    paddingLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: COLORS.onSurface,
    fontSize: 15,
    fontWeight: '500',
    height: '100%',
  },
  avatarScrollContainer: {
    height: 180,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainer,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerLow,
    padding: 10,
    marginBottom: 24,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 12,
    paddingBottom: 10,
  },
  avatarGridItem: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
  },
  avatarGridItemActive: {
    borderColor: COLORS.secondary,
  },
  gridAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveProfileBtn: {
    height: 52,
  },
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 40,
    gap: 4,
  },
  footerBrand: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.outline,
    letterSpacing: 0.5,
  },
  footerVersion: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.outlineVariant,
  },
});
