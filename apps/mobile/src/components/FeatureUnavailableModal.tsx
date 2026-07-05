import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface FeatureUnavailableModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function FeatureUnavailableModal({
  visible,
  onClose,
  title = 'Feature Under Construction',
  description = 'We are currently building this feature for you. It will be available in a future app update. Stay tuned!',
}: FeatureUnavailableModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Abstract background circles matching premium wallet UI */}
          <View style={[styles.abstractCircle, styles.circleTopRight]} />
          <View style={[styles.abstractCircle, styles.circleBottomLeft]} />

          {/* Header Icon Container */}
          <View style={styles.iconWrapper}>
            <View style={styles.iconContainer}>
              <Ionicons name="construct-outline" size={32} color={COLORS.secondary} />
            </View>
          </View>

          {/* Texts */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          {/* Action Button */}
          <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={onClose}>
            <Ionicons name="arrow-back" size={18} color="#ffffff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(25, 28, 29, 0.65)', // Semi-transparent overlay matching Stitch dark accents
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainerHigh,
  },
  abstractCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(75, 65, 225, 0.04)', // COLORS.secondary with low opacity
  },
  circleTopRight: {
    width: 120,
    height: 120,
    top: -40,
    right: -30,
  },
  circleBottomLeft: {
    width: 90,
    height: 90,
    bottom: -30,
    left: -20,
  },
  iconWrapper: {
    marginBottom: 20,
    elevation: 4,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.secondaryFixed,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 13,
    color: COLORS.outline,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 26,
    paddingHorizontal: 8,
    fontWeight: '500',
  },
  button: {
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 28,
    width: '100%',
    elevation: 4,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
