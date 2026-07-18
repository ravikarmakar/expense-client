import { StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

/**
 * Shared button styles used across the app.
 * Provides consistent button variants for forms, modals, and actions.
 */
export const buttonStyles = StyleSheet.create({
  // ─── Primary Button (green, filled) ──────────────────────
  primary: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    width: '100%',
    marginTop: 8,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  // ─── Destructive Button (red) ────────────────────────────
  destructive: {
    backgroundColor: COLORS.error,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    width: '100%',
    marginTop: 8,
  },
  destructiveText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  // ─── Outline Button (bordered, no fill) ──────────────────
  outline: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    width: '100%',
    marginTop: 8,
  },
  outlineText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 16,
    fontWeight: '700',
  },

  // ─── States ──────────────────────────────────────────────
  disabled: {
    opacity: 0.7,
  },

  // ─── Animated Gradient Wrapper ───────────────────────────
  gradientWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  gradientInner: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
