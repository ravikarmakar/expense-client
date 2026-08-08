import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { ExportResult } from '../services/export/types';

interface ExportProgressAndSuccessModalProps {
  isGenerating: boolean;
  progressMessage: string;
  successVisible: boolean;
  onCloseSuccess: () => void;
  exportResult: ExportResult | null;
  onOpenFile: () => void;
  onShareFile: () => void;
  onSaveAgain: () => void;
}

export const ExportProgressAndSuccessModal: React.FC<ExportProgressAndSuccessModalProps> = ({
  isGenerating,
  progressMessage,
  successVisible,
  onCloseSuccess,
  exportResult,
  onOpenFile,
  onShareFile,
  onSaveAgain,
}) => {
  return (
    <>
      {/* 1. Generation Progress Modal */}
      <Modal visible={isGenerating} transparent animationType="fade">
        <View style={styles.modalOverlayCenter}>
          <View style={styles.progressCard}>
            <ActivityIndicator size="large" color={COLORS.secondary} />
            <Text style={styles.progressTitle}>Generating Export</Text>
            <Text style={styles.progressSub}>{progressMessage}</Text>
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
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={onCloseSuccess}
          />
          <View style={styles.successSheet}>
            <View style={styles.modalHandle} />

            <View style={styles.successHeader}>
              <View style={styles.checkBadge}>
                <Ionicons name="checkmark-circle" size={48} color={COLORS.secondary} />
              </View>
              <Text style={styles.successTitle}>Export Saved Successfully!</Text>
              <Text style={styles.successSub}>
                Your expense statement file is ready and saved on your device.
              </Text>
            </View>

            {/* Exact Location Box */}
            <View style={styles.pathBox}>
              <Ionicons name="folder-open-outline" size={20} color={COLORS.secondary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.pathBoxLabel}>Saved Location</Text>
                <Text style={styles.pathBoxValue} numberOfLines={2}>
                  {exportResult?.displayPath || exportResult?.fileName || 'Downloads/'}
                </Text>
              </View>
            </View>

            {/* Actions: Open File, Share File, Save Again */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionBtnPrimary}
                activeOpacity={0.85}
                onPress={onOpenFile}
              >
                <Ionicons name="open-outline" size={18} color="#ffffff" />
                <Text style={styles.actionBtnPrimaryText}>Open File</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtnSecondary}
                activeOpacity={0.85}
                onPress={onShareFile}
              >
                <Ionicons name="share-social-outline" size={18} color={COLORS.secondary} />
                <Text style={styles.actionBtnSecondaryText}>Share File</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtnOutline}
                activeOpacity={0.85}
                onPress={onSaveAgain}
              >
                <Ionicons name="save-outline" size={18} color={COLORS.onSurfaceVariant} />
                <Text style={styles.actionBtnOutlineText}>Save Again</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.doneBtn} onPress={onCloseSuccess}>
              <Text style={styles.doneBtnText}>Done</Text>
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
    marginBottom: 20,
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
    fontSize: 12,
    color: COLORS.outline,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
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
    fontSize: 11,
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
