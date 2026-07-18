import { StyleSheet, Platform } from 'react-native';
import { COLORS } from '../constants/theme';

/**
 * Shared modal styles used across the app.
 * Two modal patterns exist:
 *  1. Center modal (dialog-like): uses `overlay`, `container`, `content`
 *  2. Bottom sheet modal: uses `bottomOverlay`, `bottomContent`
 */
export const modalStyles = StyleSheet.create({
  // ─── Center Dialog Modal ─────────────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 340,
  },
  content: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },

  // ─── Bottom Sheet Modal ──────────────────────────────────
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomKeyboardView: {
    width: '100%',
  },
  bottomContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    maxHeight: '90%',
  },
  bottomScrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },

  // ─── Shared Modal Header ─────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  closeBtn: {
    padding: 4,
  },

  // ─── Shared Modal Body ───────────────────────────────────
  body: {
    gap: 16,
  },
  description: {
    fontSize: 13,
    color: COLORS.outline,
    lineHeight: 18,
    marginBottom: 20,
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
  },

  // ─── Modal Action Buttons ────────────────────────────────
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  confirmBtnDisabled: {
    backgroundColor: COLORS.outlineVariant,
  },
});
