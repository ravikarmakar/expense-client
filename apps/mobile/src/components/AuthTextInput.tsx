import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface AuthTextInputProps extends TextInputProps {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  loading?: boolean;
  rightIcon?: React.ComponentProps<typeof Ionicons>['name'];
  onRightIconPress?: () => void;
}

export const AuthTextInput = React.forwardRef<TextInput, AuthTextInputProps>(
  (
    { label, icon, loading, rightIcon, onRightIconPress, style, onFocus, onBlur, ...props },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = useCallback<NonNullable<TextInputProps['onFocus']>>(
      (e) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = useCallback<NonNullable<TextInputProps['onBlur']>>(
      (e) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur]
    );

    return (
      <View style={styles.container}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View
          style={[
            styles.inputContainer,
            loading && { opacity: 0.6 },
            isFocused && styles.focusedInputContainer,
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? COLORS.primary : COLORS.outline}
            style={styles.inputIcon}
          />
          <TextInput
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor={COLORS.outlineVariant}
            style={[styles.textInput, style]}
            editable={!loading}
            importantForAutofill="no"
            autoCorrect={false}
            {...props}
          />
          {rightIcon && (
            <TouchableOpacity
              onPress={onRightIconPress}
              activeOpacity={0.7}
              disabled={loading}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.rightIconTouch}
            >
              <Ionicons
                name={rightIcon}
                size={20}
                color={isFocused ? COLORS.primary : COLORS.outline}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
);

AuthTextInput.displayName = 'AuthTextInput';

const styles = StyleSheet.create({
  container: {
    width: '100%',
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    marginBottom: 16,
  },
  focusedInputContainer: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    backgroundColor: COLORS.surface,
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: COLORS.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        }
      : {}),
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: COLORS.onSurface,
    fontSize: 15,
    fontWeight: '500',
    height: '100%',
    paddingVertical: 0,
  },
  rightIconTouch: {
    padding: 4,
  },
});
