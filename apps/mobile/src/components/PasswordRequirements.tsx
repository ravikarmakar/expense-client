import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'One number (0-9)', met: /[0-9]/.test(password) },
    { label: 'One special character (e.g. !@#)', met: /[^a-zA-Z0-9]/.test(password) },
  ];

  const metCount = requirements.filter((req) => req.met).length;

  const getStrengthInfo = () => {
    if (metCount <= 2) {
      return { label: 'Weak', color: COLORS.error };
    }
    if (metCount === 3) {
      return { label: 'Fair', color: '#F59E0B' }; // Amber
    }
    if (metCount === 4) {
      return { label: 'Good', color: '#10B981' }; // Emerald
    }
    return { label: 'Strong', color: COLORS.primary }; // Primary Theme Green
  };

  const strength = getStrengthInfo();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Password Requirements:</Text>
        <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
      </View>

      <View style={styles.progressBarContainer}>
        {[1, 2, 3, 4, 5].map((level) => {
          const isFilled = level <= metCount;
          let barColor = COLORS.outlineVariant;
          if (isFilled) {
            barColor = strength.color;
          }
          return (
            <View key={level} style={[styles.progressSegment, { backgroundColor: barColor }]} />
          );
        })}
      </View>

      {requirements.map((req, index) => (
        <View key={index} style={styles.requirementRow}>
          <View style={styles.iconWrapper}>
            {req.met ? (
              <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
            ) : (
              <View style={styles.bullet} />
            )}
          </View>
          <Text style={[styles.text, req.met ? styles.textMet : styles.textUnmet]}>
            {req.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  header: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressBarContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconWrapper: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.outlineVariant,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  textMet: {
    color: COLORS.primary,
  },
  textUnmet: {
    color: COLORS.outline,
  },
});
