import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { ExportResult } from '../services/export/types';
import { useTheme } from '../context/ThemeContext';

interface ExportProgressAndSuccessModalProps {
  isGenerating: boolean;
  progressMessage: string;
  successVisible: boolean;
  onCloseSuccess: () => void;
  exportResult: ExportResult | null;
  onOpenFile: () => void;
  onShareFile: () => void;
  onSaveToDownloads?: () => void;
  variant?: 'light' | 'dark';
}

export const ExportProgressAndSuccessModal: React.FC<ExportProgressAndSuccessModalProps> = ({
  isGenerating,
  progressMessage,
  successVisible,
  onCloseSuccess,
  exportResult,
  onOpenFile,
  onShareFile,
  variant,
}) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = variant ? variant === 'dark' : themeIsDark;
  const accentColor = isDark ? '#34D399' : COLORS.secondary;

  return (
    <>
      {/* 1. Generation Progress Modal */}
      <Modal visible={isGenerating} transparent animationType="fade">
        <View style={styles.modalOverlayCenter}>
          <View style={[styles.progressCard, isDark && { backgroundColor: '#101917' }]}>
            <View
              style={[
                styles.progressIconRing,
                isDark && { backgroundColor: 'rgba(52, 211, 153, 0.15)' },
              ]}
            >
              <ActivityIndicator size="large" color={accentColor} />
            </View>
            <Text style={[styles.progressTitle, isDark && { color: '#F9FAFB' }]}>
              Generating Export
            </Text>
            <Text style={[styles.progressSub, isDark && { color: '#9CA3AF' }]}>
              {progressMessage}
            </Text>
          </View>
        </View>
      </Modal>

      {/* 2. Success Modal with Action Buttons */}
      <Modal
        visible={successVisible}
        transparent
        animationType="slide"
        onRequestClose={onCloseSuccess}
      >
        <View style={styles.modalOverlayBottom}>
          <TouchableOpacity
            style={[styles.modalBackdrop, isDark && { backgroundColor: 'rgba(0, 0, 0, 0.65)' }]}
            activeOpacity={1}
            onPress={onCloseSuccess}
          />
          <View style={[styles.successSheet, isDark && { backgroundColor: '#101917' }]}>
            <View
              style={[
                styles.modalHandle,
                isDark && { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
              ]}
            />

            <View style={styles.successHeader}>
              <View style={styles.checkBadge}>
                <Ionicons name="checkmark-circle" size={48} color={accentColor} />
              </View>
              <Text style={[styles.successTitle, isDark && { color: '#F9FAFB' }]}>
                Export Ready!
              </Text>
              <Text style={[styles.successSub, isDark && { color: '#9CA3AF' }]}>
                Your file has been saved to your device. Use the options below to open or share it.
              </Text>
            </View>

            {/* File Info Box */}
            <View
              style={[
                styles.pathBox,
                isDark && {
                  backgroundColor: '#1A2623',
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                },
              ]}
            >
              <Ionicons name="document-text-outline" size={22} color={accentColor} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.pathBoxLabel, isDark && { color: '#9CA3AF' }]}>File Name</Text>
                <Text
                  style={[styles.pathBoxValue, isDark && { color: '#34D399' }]}
                  numberOfLines={1}
                >
                  {exportResult?.fileName || 'Statement Export'}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              {/* Open File — primary action */}
              <TouchableOpacity
                style={[styles.actionBtnPrimary, isDark && { backgroundColor: '#10B981' }]}
                activeOpacity={0.85}
                onPress={onOpenFile}
              >
                <Ionicons name="open-outline" size={20} color="#ffffff" />
                <Text style={styles.actionBtnPrimaryText}>Open File</Text>
              </TouchableOpacity>

              {/* Share File — secondary action */}
              <TouchableOpacity
                style={[
                  styles.actionBtnSecondary,
                  isDark && {
                    backgroundColor: 'rgba(52, 211, 153, 0.15)',
                    borderColor: '#34D399',
                  },
                ]}
                activeOpacity={0.85}
                onPress={onShareFile}
              >
                <Ionicons name="share-social-outline" size={18} color={accentColor} />
                <Text style={[styles.actionBtnSecondaryText, isDark && { color: '#34D399' }]}>
                  Share File
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.doneBtn} onPress={onCloseSuccess}>
              <Text style={[styles.doneBtnText, isDark && { color: '#9CA3AF' }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalOverlayBottom: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  progressCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '85%',
    maxWidth: 320,
    elevation: 8,
  },
  progressIconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.secondaryFixed + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginTop: 4,
  },
  progressSub: {
    fontSize: 12,
    color: COLORS.outline,
    textAlign: 'center',
  },
  successSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.outlineVariant,
    alignSelf: 'center',
    marginBottom: 16,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  checkBadge: {
    marginBottom: 6,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  successSub: {
    fontSize: 12.5,
    color: COLORS.outline,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 12,
    lineHeight: 18,
  },
  pathBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    marginBottom: 20,
  },
  pathBoxLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
  },
  pathBoxValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.secondary,
    marginTop: 2,
  },
  actionsContainer: {
    gap: 10,
    marginBottom: 12,
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 14,
  },
  actionBtnPrimaryText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.secondaryFixed + '40',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  actionBtnSecondaryText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.surfaceContainerLow,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  actionBtnOutlineText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },
  doneBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.outline,
  },
});
