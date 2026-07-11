import { StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../../constants/theme';

export const authStyles = StyleSheet.create({
  // Screen Headers
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 20,
  },

  // Status Notifications
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
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.15)',
  },
  successText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '600',
    flex: 1,
  },

  // Interactive Buttons
  buttonWrapper: {
    marginTop: 8,
    width: '100%',
  },
  primaryButtonAnimated: {
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  gradientButton: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryButton: {
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
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Password Recovery Helpers
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Screen Footers
  footerContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 14,
    color: COLORS.outline,
    fontWeight: '500',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // OTP Grid Inputs
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 24,
  },
  otpBoxContainer: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  otpInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
  },

  // OTP Resend Cooldown
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 13,
    color: COLORS.outline,
    fontWeight: '500',
  },
  resendLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  disabledLink: {
    color: COLORS.outline,
    opacity: 0.6,
  },

  // Modal Custom Overlays
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  formContainer: {
    width: '100%',
  },
  modalDescription: {
    fontSize: 13,
    color: COLORS.outline,
    marginBottom: 20,
    lineHeight: 18,
  },

  // Forgot Password Steps Layout
  stepContainer: {
    flex: 1,
  },
  headerSection: {
    marginTop: 10,
    marginBottom: 30,
  },
  backButtonRow: {
    marginBottom: 20,
    marginLeft: -4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.outline,
    marginTop: 6,
    lineHeight: 20,
    fontWeight: '500',
  },
  formSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  emailHighlight: {
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  successNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.15)',
  },
  successNotificationText: {
    fontSize: 12,
    color: COLORS.secondary,
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
});
