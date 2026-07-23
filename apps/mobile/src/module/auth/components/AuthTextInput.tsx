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
import { hapticFeedback } from '../../../utils/haptics';
import { useTheme } from '../../../context/ThemeContext';

interface AuthTextInputProps extends TextInputProps {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  loading?: boolean;
  error?: string;
  rightIcon?: React.ComponentProps<typeof Ionicons>['name'];
  onRightIconPress?: () => void;
}

/**
 * Clean Dark Matte Auth Text Input component.
 * Features neutral dark container (#141d18), crisp white text, subtle border focus,
 * and instant inline error feedback.
 */
export const AuthTextInput = React.memo(
  React.forwardRef<TextInput, AuthTextInputProps>(
    (
      {
        label,
        icon,
        loading,
        error,
        rightIcon,
        onRightIconPress,
        style,
        onFocus,
        onBlur,
        ...props
      },
      ref
    ) => {
      const [isFocused, setIsFocused] = useState(false);
      const { isDark } = useTheme();

      const handleFocus = useCallback<NonNullable<TextInputProps['onFocus']>>(
        (e) => {
          setIsFocused(true);
          hapticFeedback.selection();
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

      const hasError = Boolean(error);

      return (
        <View style={styles.container}>
          <Text
            style={[
              styles.inputLabel,
              !isDark && { color: '#6d7a72' },
              isFocused && (isDark ? styles.focusedInputLabel : { color: '#006948' }),
              hasError && styles.errorInputLabel,
            ]}
          >
            {label}
          </Text>

          <View
            style={[
              styles.inputContainer,
              !isDark && { backgroundColor: '#ffffff', borderColor: '#e7e8e9' },
              loading && { opacity: 0.5 },
              isFocused &&
                (isDark
                  ? styles.focusedInputContainer
                  : { borderColor: '#006948', borderWidth: 1.5 }),
              hasError && styles.errorInputContainer,
            ]}
          >
            <Ionicons
              name={icon}
              size={20}
              color={
                hasError
                  ? '#fca5a5'
                  : isFocused
                    ? isDark
                      ? '#ffffff'
                      : '#006948'
                    : isDark
                      ? 'rgba(255, 255, 255, 0.4)'
                      : '#6d7a72'
              }
              style={styles.inputIcon}
            />
            <TextInput
              ref={ref}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.3)' : '#bccac0'}
              style={[styles.textInput, !isDark && { color: '#191c1d' }, style]}
              editable={!loading}
              autoCorrect={false}
              {...props}
            />
            {rightIcon ? (
              <TouchableOpacity
                onPress={onRightIconPress}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.rightIconTouch}
              >
                <Ionicons
                  name={rightIcon}
                  size={20}
                  color={isDark ? 'rgba(255, 255, 255, 0.4)' : '#6d7a72'}
                />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Real-time Inline Validation Error Row */}
          {hasError ? (
            <View style={styles.inlineErrorRow}>
              <Ionicons name="alert-circle" size={13} color="#fca5a5" />
              <Text style={styles.inlineErrorText}>{error}</Text>
            </View>
          ) : null}
        </View>
      );
    }
  )
);

AuthTextInput.displayName = 'AuthTextInput';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    paddingLeft: 4,
  },
  focusedInputLabel: {
    color: '#ffffff',
  },
  errorInputLabel: {
    color: '#fca5a5',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141d18',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  focusedInputContainer: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1.5,
    backgroundColor: '#1a2620',
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        }
      : {}),
  },
  errorInputContainer: {
    borderColor: 'rgba(248, 113, 113, 0.65)',
    borderWidth: 1.5,
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
    height: '100%',
    paddingVertical: 0,
  },
  rightIconTouch: {
    padding: 4,
  },
  inlineErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    paddingLeft: 4,
  },
  inlineErrorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fca5a5',
  },
});
