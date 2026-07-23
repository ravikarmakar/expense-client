import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardTypeOptions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  showCharCount?: boolean;
  autoFocus?: boolean;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  variant?: 'light' | 'dark';
  editable?: boolean;
}

export const FormInput = React.memo(function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  multiline = false,
  numberOfLines,
  maxLength,
  showCharCount = false,
  autoFocus = false,
  keyboardType = 'default',
  secureTextEntry = false,
  variant = 'light',
  editable = true,
}: FormInputProps) {
  const isDark = variant === 'dark';
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.inputLabel, isDark && { color: '#74817B' }]}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          multiline && styles.inputRowMultiline,
          isDark && {
            backgroundColor: isFocused ? '#131D1A' : '#101917',
            borderColor: isFocused ? '#10B981' : 'rgba(255, 255, 255, 0.12)',
            borderWidth: isFocused ? 1.5 : 1,
          },
        ]}
      >
        {icon && !multiline && (
          <Ionicons
            name={icon}
            size={18}
            color={isDark ? (isFocused ? '#ffffff' : 'rgba(255, 255, 255, 0.65)') : COLORS.outline}
            style={styles.inputIcon}
          />
        )}
        <TextInput
          style={[
            styles.textInput,
            multiline && styles.textInputMultiline,
            isDark && { color: '#FFFFFF' },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.55)' : COLORS.outlineVariant}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          autoFocus={autoFocus}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          editable={editable}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : undefined}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          selectionColor={isDark ? '#10B981' : COLORS.primary}
        />
        {showCharCount && maxLength !== undefined && (
          <Text
            style={[
              styles.charCount,
              isDark && { color: isFocused ? '#ffffff' : 'rgba(255, 255, 255, 0.6)' },
            ]}
          >
            {value.length}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  inputRowMultiline: {
    height: 80,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: COLORS.onSurface,
    fontSize: 15,
    fontWeight: '500',
    padding: 0,
  },
  textInputMultiline: {
    height: '100%',
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: COLORS.outline,
    marginLeft: 8,
  },
});
