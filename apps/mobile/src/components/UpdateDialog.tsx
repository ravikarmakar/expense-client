import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUpdateCheck } from '@workspace/api';
import { env } from '../env';

export function UpdateDialog() {
  const [isVisible, setIsVisible] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  // Hook to check for updates using the client's current version and build number.
  // Only runs in non-development modes to prevent local testing interference.
  const { data, isLoading, error } = useUpdateCheck(
    env.APP_VERSION,
    env.BUILD_NUMBER,
    env.NODE_ENV !== 'development'
  );

  if (isLoading || error || !data || !data.updateAvailable || !isVisible) {
    return null;
  }

  const { latestVersion, latestBuildNumber, forceUpdate, releaseNotes, apkSizeBytes, apkUrl } =
    data;

  const handleUpdate = async () => {
    try {
      setIsDownloading(true);

      // Open the /download/latest redirect endpoint which logs download analytics
      const supported = await Linking.canOpenURL(apkUrl);
      if (supported) {
        await Linking.openURL(apkUrl);
      } else {
        Alert.alert('Error', `Cannot initiate download. Please visit the web portal to download.`);
      }
    } catch (err) {
      console.warn('Update trigger failed:', err);
      Alert.alert(
        'Error',
        'Failed to launch download. Please check your internet connection and try again.'
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleLater = () => {
    if (forceUpdate) {
      Alert.alert(
        'Required Update',
        'This update is critical for application compatibility and cannot be skipped.'
      );
      return;
    }
    setIsVisible(false);
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={true}
      onRequestClose={handleLater}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header Icon */}
          <View style={[styles.iconContainer, forceUpdate ? styles.forceBg : styles.normalBg]}>
            <Ionicons
              name={forceUpdate ? 'alert-circle' : 'cloud-download'}
              size={36}
              color="#ffffff"
            />
          </View>

          {/* Title & Version Info */}
          <Text style={styles.title}>Update Available</Text>
          <Text style={styles.versionInfo}>
            v{latestVersion} ({latestBuildNumber})
            {apkSizeBytes > 0 && ` • ${formatSize(apkSizeBytes)}`}
          </Text>

          {/* Prompt */}
          <Text style={styles.promptText}>
            {forceUpdate
              ? 'A critical update is required to continue using the application. Please update now.'
              : 'A new version of SplitShare is available. Update now to receive the latest features and bug fixes.'}
          </Text>

          {/* Release Notes */}
          {releaseNotes && releaseNotes.length > 0 && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesTitle}>{"What's New:"}</Text>
              <ScrollView style={styles.notesScroll} nestedScrollEnabled={true}>
                {releaseNotes.map((note, index) => (
                  <View key={index} style={styles.noteItem}>
                    <Text style={styles.noteBullet}>•</Text>
                    <Text style={styles.noteText}>{note}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            {!forceUpdate && (
              <TouchableOpacity
                style={[styles.btn, styles.secondaryBtn]}
                onPress={handleLater}
                disabled={isDownloading}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryBtnText}>Later</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.btn, styles.primaryBtn, forceUpdate ? { flex: 1 } : {}]}
              onPress={handleUpdate}
              disabled={isDownloading}
              activeOpacity={0.8}
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="download" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.primaryBtnText}>Update Now</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 9, 14, 0.85)', // Matched to app dark theme background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#191c1d', // COLORS.onSurface/dark theme container matching
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: '#3d4a42',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  forceBg: {
    backgroundColor: '#ba1a1a', // COLORS.error
  },
  normalBg: {
    backgroundColor: '#006948', // COLORS.primary
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8f9fa',
    marginBottom: 6,
    textAlign: 'center',
  },
  versionInfo: {
    fontSize: 13,
    fontWeight: '600',
    color: '#bccac0', // COLORS.outlineVariant
    marginBottom: 16,
    textAlign: 'center',
  },
  promptText: {
    fontSize: 13,
    color: '#bccac0',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  notesContainer: {
    width: '100%',
    backgroundColor: '#202425',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3d4a42',
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f8f9fa',
    marginBottom: 6,
  },
  notesScroll: {
    maxHeight: 100,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  noteBullet: {
    color: '#006948',
    fontSize: 12,
    marginRight: 6,
    marginTop: 2,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#bccac0',
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  primaryBtn: {
    backgroundColor: '#006948', // COLORS.primary
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#3d4a42',
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryBtnText: {
    color: '#bccac0',
    fontSize: 14,
    fontWeight: '700',
  },
});
