import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, PREDEFINED_AVATARS, resolveAvatar } from '../../constants/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useMe, useLogout, useUpdateProfile, getErrorMessage } from '@workspace/api';
import { ChangePasswordModal } from '../../module/auth/components/ChangePasswordModal';

export default function SettingsTabScreen() {
  const { data: user } = useMe();
  const logoutMutation = useLogout();

  const [modalVisible, setModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [profileErrorMessage, setProfileErrorMessage] = useState('');

  const updateProfileMutation = useUpdateProfile();

  const handleSaveProfile = () => {
    setProfileErrorMessage('');
    if (!editName.trim()) {
      setProfileErrorMessage('Name cannot be empty.');
      return;
    }

    updateProfileMutation.mutate(
      {
        name: editName.trim(),
        image: selectedAvatar,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Profile updated successfully.');
          setProfileModalVisible(false);
        },
        onError: (err) => {
          setProfileErrorMessage(getErrorMessage(err, 'Failed to update profile.'));
        },
      }
    );
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Fixed Header with Bottom Divider Line */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 16 }]}>
        <View style={styles.tabHeaderRow}>
          <View>
            <Text style={styles.tabTitle}>Settings</Text>
            <Text style={styles.tabSubtitle}>Preferences & Profile</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsWalletBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/personal-wallet')}
          >
            <Ionicons name="wallet-sharp" size={30} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={globalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarOutlineContainer}>
            <Image source={{ uri: resolveAvatar(user?.image) }} style={styles.profileAvatar} />
            <TouchableOpacity
              style={styles.avatarEditOverlay}
              activeOpacity={0.85}
              onPress={() => {
                setEditName(user?.name ?? '');
                setSelectedAvatar(resolveAvatar(user?.image));
                setProfileErrorMessage('');
                setProfileModalVisible(true);
              }}
            >
              <Ionicons name="camera" size={14} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfoColumn}>
            <Text style={styles.profileName}>{user?.name || 'Alexander Wright'}</Text>
            <Text style={styles.profileEmail}>
              {user?.email || 'alexander.wright@splitshare.com'}
            </Text>
            <TouchableOpacity
              style={styles.editProfileButton}
              activeOpacity={0.7}
              onPress={() => {
                setEditName(user?.name ?? '');
                setSelectedAvatar(resolveAvatar(user?.image));
                setProfileErrorMessage('');
                setProfileModalVisible(true);
              }}
            >
              <Ionicons
                name="pencil"
                size={11}
                color={COLORS.onSurfaceVariant}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.editProfileButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Options */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsGroupTitle}>Account Settings</Text>

          <TouchableOpacity
            style={styles.settingsItem}
            activeOpacity={0.7}
            onPress={() => {
              setEditName(user?.name ?? '');
              setSelectedAvatar(resolveAvatar(user?.image));
              setProfileErrorMessage('');
              setProfileModalVisible(true);
            }}
          >
            <View style={styles.settingsItemLeft}>
              <View style={[styles.iconBadge, { backgroundColor: '#e8f0fe' }]}>
                <Ionicons name="person" size={18} color="#1a73e8" />
              </View>
              <Text style={styles.settingsItemLabel}>Personal Info</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.outlineVariant} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem} activeOpacity={0.7}>
            <View style={styles.settingsItemLeft}>
              <View style={[styles.iconBadge, { backgroundColor: '#e6f4ea' }]}>
                <Ionicons name="card" size={18} color="#137333" />
              </View>
              <Text style={styles.settingsItemLabel}>Payment Methods</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.outlineVariant} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem} activeOpacity={0.7}>
            <View style={styles.settingsItemLeft}>
              <View style={[styles.iconBadge, { backgroundColor: '#fef7e0' }]}>
                <Ionicons name="notifications" size={18} color="#b06000" />
              </View>
              <Text style={styles.settingsItemLabel}>Notification Preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.outlineVariant} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.settingsGroupTitle}>Preferences & Safety</Text>

          <TouchableOpacity style={styles.settingsItem} activeOpacity={0.7}>
            <View style={styles.settingsItemLeft}>
              <View style={[styles.iconBadge, { backgroundColor: '#e6f4ea' }]}>
                <Ionicons name="shield-checkmark" size={18} color="#137333" />
              </View>
              <Text style={styles.settingsItemLabel}>Security & PIN</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.outlineVariant} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsItem}
            activeOpacity={0.7}
            onPress={() => {
              setModalVisible(true);
            }}
          >
            <View style={styles.settingsItemLeft}>
              <View style={[styles.iconBadge, { backgroundColor: '#fce8e6' }]}>
                <Ionicons name="key" size={18} color="#c5221f" />
              </View>
              <Text style={styles.settingsItemLabel}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.outlineVariant} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem} activeOpacity={0.7}>
            <View style={styles.settingsItemLeft}>
              <View style={[styles.iconBadge, { backgroundColor: '#f3e5f5' }]}>
                <Ionicons name="globe" size={18} color="#7b1fa2" />
              </View>
              <Text style={styles.settingsItemLabel}>App Language</Text>
            </View>
            <Text style={styles.settingsItemSubValue}>English</Text>
          </TouchableOpacity>
        </View>

        {/* About & Legal Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsGroupTitle}>About & Legal</Text>

          <TouchableOpacity style={styles.settingsItem} activeOpacity={0.7}>
            <View style={styles.settingsItemLeft}>
              <View style={[styles.iconBadge, { backgroundColor: '#e2f2ff' }]}>
                <Ionicons name="document-text" size={18} color="#0066cc" />
              </View>
              <Text style={styles.settingsItemLabel}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.outlineVariant} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem} activeOpacity={0.7}>
            <View style={styles.settingsItemLeft}>
              <View style={[styles.iconBadge, { backgroundColor: '#e2f2ff' }]}>
                <Ionicons name="lock-closed" size={18} color="#0066cc" />
              </View>
              <Text style={styles.settingsItemLabel}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.outlineVariant} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem} activeOpacity={0.7}>
            <View style={styles.settingsItemLeft}>
              <View style={[styles.iconBadge, { backgroundColor: '#e2f2ff' }]}>
                <Ionicons name="information-circle" size={18} color="#0066cc" />
              </View>
              <Text style={styles.settingsItemLabel}>Open Source Licenses</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.outlineVariant} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, logoutMutation.isPending && { opacity: 0.5 }]}
          activeOpacity={0.85}
          onPress={() => logoutMutation.mutate(undefined)}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? (
            <ActivityIndicator size="small" color={COLORS.error} />
          ) : (
            <>
              <Ionicons name="log-out" size={20} color={COLORS.error} style={{ marginRight: 2 }} />
              <Text style={styles.logoutButtonText}>Log Out of Account</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Application Version Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerBrand}>SplitShare</Text>
          <Text style={styles.footerVersion}>v1.0.0 (Build 42)</Text>
          <Text style={styles.footerCopyright}>© 2026 SplitShare Inc. All rights reserved.</Text>
        </View>
      </ScrollView>

      <ChangePasswordModal visible={modalVisible} onClose={() => setModalVisible(false)} />

      {/* ── Modal: Edit Profile ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={profileModalVisible}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity
                onPress={() => setProfileModalVisible(false)}
                style={styles.closeButton}
                activeOpacity={0.7}
                disabled={updateProfileMutation.isPending}
              >
                <Ionicons name="close" size={24} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>

            {profileErrorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                <Text style={styles.errorText}>{profileErrorMessage}</Text>
              </View>
            ) : null}

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.modalForm}>
                {/* Current Avatar Preview */}
                <View style={styles.avatarPreviewContainer}>
                  <Image source={{ uri: selectedAvatar }} style={styles.largeAvatarPreview} />
                  <Text style={styles.avatarPreviewLabel}>Selected Avatar</Text>
                </View>

                {/* Name Input */}
                <Text style={styles.inputLabel}>Full Name</Text>
                <View
                  style={[
                    styles.inputContainer,
                    updateProfileMutation.isPending && { opacity: 0.6 },
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={COLORS.outline}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Enter your name"
                    placeholderTextColor={COLORS.outlineVariant}
                    style={styles.textInput}
                    editable={!updateProfileMutation.isPending}
                    maxLength={40}
                  />
                </View>

                {/* Avatar Grid Selection inside a Scrollable Box */}
                <Text style={styles.inputLabel}>Choose Avatar</Text>
                <View style={styles.avatarScrollContainer}>
                  <ScrollView
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={styles.avatarGrid}
                  >
                    {PREDEFINED_AVATARS.map((avatarUrl, idx) => {
                      const isSelected = selectedAvatar === avatarUrl;
                      return (
                        <TouchableOpacity
                          key={idx}
                          style={[styles.avatarGridItem, isSelected && styles.avatarGridItemActive]}
                          onPress={() => setSelectedAvatar(avatarUrl)}
                          activeOpacity={0.7}
                          disabled={updateProfileMutation.isPending}
                        >
                          <Image source={{ uri: avatarUrl }} style={styles.gridAvatarImage} />
                          {isSelected && (
                            <View style={styles.checkBadge}>
                              <Ionicons name="checkmark" size={10} color="#fff" />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                <TouchableOpacity
                  onPress={handleSaveProfile}
                  style={[
                    styles.primaryButton,
                    (!editName.trim() || updateProfileMutation.isPending) && styles.disabledButton,
                  ]}
                  activeOpacity={0.8}
                  disabled={!editName.trim() || updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  tabHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsWalletBtn: {
    paddingVertical: 4,
  },
  tabTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  tabSubtitle: {
    fontSize: 12,
    color: COLORS.outline,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    marginBottom: 24,
    gap: 20,
  },
  avatarOutlineContainer: {
    position: 'relative',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#e8eaf6',
  },
  avatarEditOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  profileInfoColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  profileEmail: {
    fontSize: 13,
    color: COLORS.outline,
    fontWeight: '500',
    marginBottom: 12,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
  },
  editProfileButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },
  settingsSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    padding: 16,
    marginBottom: 16,
  },
  settingsGroupTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    paddingLeft: 4,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  settingsItemSubValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.outline,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#fdf2f2',
    borderColor: '#fde2e2',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 32,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.error,
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
  footerCopyright: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.outlineVariant,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  closeButton: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 13,
    color: COLORS.outline,
    marginBottom: 20,
    lineHeight: 18,
  },
  modalForm: {
    width: '100%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.errorContainer,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(186, 26, 26, 0.1)',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '600',
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    paddingLeft: 4,
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
  primaryButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  // Profile edit
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
});
