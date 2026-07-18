import { StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

/**
 * Shared feedback/notification styles for error, success, and warning states.
 * Used in forms, modals, and inline status messages.
 */
export const feedbackStyles = StyleSheet.create({
  // ─── Error State ─────────────────────────────────────────
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

  // ─── Success State ───────────────────────────────────────
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.15)',
  },
  successText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    flex: 1,
  },

  // ─── Warning State ───────────────────────────────────────
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef7e0',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(176, 96, 0, 0.1)',
  },
  warningText: {
    fontSize: 12,
    color: '#b06000',
    fontWeight: '600',
    flex: 1,
  },
});
