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
import { COLORS, PREDEFINED_AVATARS } from '../../constants/theme';
import { globalStyles } from '../../styles/globalStyles';
import {
  useMe,
  useLogout,
  useVerifyPassword,
  useChangePassword,
  useUpdateProfile,
  clientVerifyPasswordSchema,
  clientChangePasswordSchema,
  getErrorMessage,
} from '@workspace/api';

export default function SettingsTabScreen() {
  const { data: user } = useMe();
  const logoutMutation = useLogout();

  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState<'VERIFY' | 'CHANGE'>('VERIFY');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [profileErrorMessage, setProfileErrorMessage] = useState('');

  const verifyPasswordMutation = useVerifyPassword();
  const changePasswordMutation = useChangePassword();
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

  const handleVerifyPassword = () => {
    setErrorMessage('');
    const validation = clientVerifyPasswordSchema.safeParse({ password: currentPassword });
    if (!validation.success) {
      setErrorMessage(validation.error.issues[0].message);
      return;
    }

    verifyPasswordMutation.mutate(
      { password: currentPassword },
      {
        onSuccess: () => {
          setStep('CHANGE');
          setErrorMessage('');
        },
        onError: (err) => {
          setErrorMessage(getErrorMessage(err, 'Incorrect password. Please try again.'));
        },
      }
    );
  };

  const handleChangePassword = () => {
    setErrorMessage('');
    const validation = clientChangePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    if (!validation.success) {
      setErrorMessage(validation.error.issues[0].message);
      return;
    }

    changePasswordMutation.mutate(
      {
        currentPassword,
        newPassword,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Your password has been changed successfully.');
          setModalVisible(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setStep('VERIFY');
        },
        onError: (err) => {
          setErrorMessage(getErrorMessage(err, 'Failed to change password.'));
        },
      }
    );
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={globalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image
            source={{ uri: user?.image || PREDEFINED_AVATARS[0] }}
            style={styles.profileAvatar}
          />
          <Text style={styles.profileName}>{user?.name || 'Alexander Wright'}</Text>
          <Text style={styles.profileEmail}>
            {user?.email || 'alexander.wright@splitshare.com'}
          </Text>
          <TouchableOpacity
            style={styles.editProfileButton}
            activeOpacity={0.7}
            onPress={() => {
              setEditName(user?.name ?? '');
              setSelectedAvatar(user?.image ?? PREDEFINED_AVATARS[0]);
              setProfileErrorMessage('');
              setProfileModalVisible(true);
            }}
          >
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Options */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsGroupTitle}>Account Settings</Text>

          <TouchableOpacity
            style={styles.settingsItem}
            activeOpacity={0.7}
            onPress={() => {
              setEditName(user?.name ?? '');
              setSelectedAvatar(user?.image ?? PREDEFINED_AVATARS[0]);
              setProfileErrorMessage('');
              setProfileModalVisible(true);
            }}
          >
            <View style={styles.settingsItemLeft}>
              <Ionicons name="person-outline" size={22} color={COLORS.outline} />
              <Text style={styles.settingsItemLabel}>Personal Info</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.outlineVariant} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem} activeOpacity={0.7}>
            <View style={styles.settingsItemLeft}>
              <Ionicons name="card-outline" size={22} color={COLORS.outline} />
              <Text style={styles.settingsItemLabel}>Payment Methods</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.outlineVariant} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem} activeOpacity={0.7}>
            <View style={styles.settingsItemLeft}>
              <Ionicons name="notifications-outline" size={22} color={COLORS.outline} />
              <Text style={styles.settingsItemLabel}>Notification Preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.outlineVariant} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.settingsGroupTitle}>Preferences & Safety</Text>

          <TouchableOpacity style={styles.settingsItem} activeOpacity={0.7}>
            <View style={styles.settingsItemLeft}>
              <Ionicons name="shield-checkmark-outline" size={22} color={COLORS.outline} />
              <Text style={styles.settingsItemLabel}>Security & PIN</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.outlineVariant} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsItem}
            activeOpacity={0.7}
            onPress={() => {
              setModalVisible(true);
              setStep('VERIFY');
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setErrorMessage('');
              setIsCurrentPasswordVisible(false);
              setIsNewPasswordVisible(false);
              setIsConfirmPasswordVisible(false);
            }}
          >
            <View style={styles.settingsItemLeft}>
              <Ionicons name="key-outline" size={22} color={COLORS.outline} />
              <Text style={styles.settingsItemLabel}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.outlineVariant} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem} activeOpacity={0.7}>
            <View style={styles.settingsItemLeft}>
              <Ionicons name="globe-outline" size={22} color={COLORS.outline} />
              <Text style={styles.settingsItemLabel}>App Language</Text>
            </View>
            <Text style={styles.settingsItemSubValue}>English</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSection}>
          <TouchableOpacity
            style={[styles.logoutButton, logoutMutation.isPending && { opacity: 0.5 }]}
            activeOpacity={0.7}
            onPress={() =>
              logoutMutation.mutate(undefined, {
                onSettled: () => {
                  router.replace('/(auth)/login');
                },
              })
            }
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? (
              <ActivityIndicator size="small" color={COLORS.error} />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
                <Text style={styles.logoutButtonText}>Log Out</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {step === 'VERIFY' ? 'Verify Identity' : 'Set New Password'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
                activeOpacity={0.7}
                disabled={verifyPasswordMutation.isPending || changePasswordMutation.isPending}
              >
                <Ionicons name="close" size={24} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>

            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {step === 'VERIFY' ? (
              <View style={styles.modalForm}>
                <Text style={styles.modalDescription}>
                  Please enter your current password to continue.
                </Text>

                <Text style={styles.inputLabel}>Current Password</Text>
                <View
                  style={[
                    styles.inputContainer,
                    verifyPasswordMutation.isPending && { opacity: 0.6 },
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={COLORS.outline}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter current password"
                    placeholderTextColor={COLORS.outlineVariant}
                    secureTextEntry={!isCurrentPasswordVisible}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.textInput}
                    editable={!verifyPasswordMutation.isPending}
                  />
                  <TouchableOpacity
                    onPress={() => setIsCurrentPasswordVisible(!isCurrentPasswordVisible)}
                    activeOpacity={0.7}
                    disabled={verifyPasswordMutation.isPending}
                  >
                    <Ionicons
                      name={isCurrentPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={COLORS.outline}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={handleVerifyPassword}
                  style={[
                    styles.primaryButton,
                    (!currentPassword.trim() || verifyPasswordMutation.isPending) &&
                      styles.disabledButton,
                  ]}
                  activeOpacity={0.8}
                  disabled={!currentPassword.trim() || verifyPasswordMutation.isPending}
                >
                  {verifyPasswordMutation.isPending ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Verify Current Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.modalForm}>
                <Text style={styles.modalDescription}>
                  Create a new secure password. It must meet complexity requirements.
                </Text>

                <Text style={styles.inputLabel}>New Password</Text>
                <View
                  style={[
                    styles.inputContainer,
                    changePasswordMutation.isPending && { opacity: 0.6 },
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={COLORS.outline}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    placeholderTextColor={COLORS.outlineVariant}
                    secureTextEntry={!isNewPasswordVisible}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.textInput}
                    editable={!changePasswordMutation.isPending}
                  />
                  <TouchableOpacity
                    onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                    activeOpacity={0.7}
                    disabled={changePasswordMutation.isPending}
                  >
                    <Ionicons
                      name={isNewPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={COLORS.outline}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <View
                  style={[
                    styles.inputContainer,
                    changePasswordMutation.isPending && { opacity: 0.6 },
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={COLORS.outline}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor={COLORS.outlineVariant}
                    secureTextEntry={!isConfirmPasswordVisible}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.textInput}
                    editable={!changePasswordMutation.isPending}
                  />
                  <TouchableOpacity
                    onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                    activeOpacity={0.7}
                    disabled={changePasswordMutation.isPending}
                  >
                    <Ionicons
                      name={isConfirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={COLORS.outline}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={handleChangePassword}
                  style={[
                    styles.primaryButton,
                    (!newPassword.trim() ||
                      !confirmPassword.trim() ||
                      changePasswordMutation.isPending) &&
                      styles.disabledButton,
                  ]}
                  activeOpacity={0.8}
                  disabled={
                    !newPassword.trim() ||
                    !confirmPassword.trim() ||
                    changePasswordMutation.isPending
                  }
                >
                  {changePasswordMutation.isPending ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Update Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

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

                {/* Avatar Grid Selection */}
                <Text style={styles.inputLabel}>Choose Avatar</Text>
                <View style={styles.avatarGrid}>
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
  profileSection: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    marginBottom: 24,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
    color: COLORS.outline,
    marginBottom: 16,
  },
  editProfileButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  editProfileButtonText: {
    fontSize: 12,
    fontWeight: '600',
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
    fontWeight: '600',
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsItemLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurface,
  },
  settingsItemSubValue: {
    fontSize: 13,
    color: COLORS.outline,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.error,
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
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 4,
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
