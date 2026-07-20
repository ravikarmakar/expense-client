import React, { useRef, memo } from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Animated,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { hapticFeedback } from '../utils/haptics';

export type AuthProviderType = 'google' | 'apple' | 'email' | 'emerald' | 'custom';

export interface TactileButtonProps {
  title: string;
  onPress: () => void;
  provider?: AuthProviderType;
  icon?: keyof typeof Ionicons.glyphMap | React.ReactNode;
  iconColor?: string;
  iconBg?: string;
  iconSize?: number;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  height?: number;
  borderRadius?: number;
  accessibilityLabel?: string;
}

interface ProviderConfig {
  gradientColors: [string, string, ...string[]];
  borderColor: string;
  textColor: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  shadowColor: string;
}

const PROVIDER_CONFIGS: Record<AuthProviderType, ProviderConfig> = {
  google: {
    gradientColors: ['rgba(34, 48, 40, 0.92)', 'rgba(20, 30, 24, 0.98)'],
    borderColor: 'rgba(255, 255, 255, 0.12)',
    textColor: '#ffffff',
    iconName: 'logo-google',
    iconColor: '#ea4335',
    iconBg: 'transparent',
    shadowColor: '#000000',
  },
  apple: {
    gradientColors: ['rgba(42, 42, 44, 0.94)', 'rgba(20, 20, 22, 0.98)'],
    borderColor: 'rgba(255, 255, 255, 0.15)',
    textColor: '#ffffff',
    iconName: 'logo-apple',
    iconColor: '#ffffff',
    iconBg: 'transparent',
    shadowColor: '#000000',
  },
  email: {
    gradientColors: ['rgba(34, 48, 40, 0.92)', 'rgba(20, 30, 24, 0.98)'],
    borderColor: 'rgba(255, 255, 255, 0.12)',
    textColor: '#ffffff',
    iconName: 'mail',
    iconColor: '#60a5fa',
    iconBg: 'transparent',
    shadowColor: '#000000',
  },
  emerald: {
    gradientColors: ['#10b981', '#059669'],
    borderColor: 'rgba(255, 255, 255, 0.25)',
    textColor: '#ffffff',
    iconColor: '#ffffff',
    iconBg: 'transparent',
    shadowColor: '#10b981',
  },
  custom: {
    gradientColors: ['rgba(34, 48, 40, 0.92)', 'rgba(20, 30, 24, 0.98)'],
    borderColor: 'rgba(255, 255, 255, 0.12)',
    textColor: '#ffffff',
    iconColor: '#ffffff',
    iconBg: 'transparent',
    shadowColor: '#000000',
  },
};

/**
 * Premium Chess.com-inspired Auth Button Component.
 * Memoized with React.memo to prevent transition flickering.
 * Always renders 100% full vibrant emerald green gradient without flash/disabled artifacts.
 */
const TactileButtonComponent: React.FC<TactileButtonProps & { variant?: AuthProviderType }> = ({
  title,
  onPress,
  provider,
  variant,
  icon,
  iconColor,
  iconBg,
  iconSize = 26,
  loading = false,
  disabled = false,
  style,
  textStyle,
  height = 62,
  borderRadius = 18,
  accessibilityLabel,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const isDisabled = disabled || loading;
  const activeProvider = provider || variant || 'custom';
  const config = PROVIDER_CONFIGS[activeProvider] || PROVIDER_CONFIGS.custom;

  const handlePressIn = () => {
    if (isDisabled) return;
    hapticFeedback.lightImpact();
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: 70,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (isDisabled) return;
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 25,
        bounciness: 4,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderIconBadge = () => {
    const finalIcon = icon ?? config.iconName;
    const finalIconColor = iconColor ?? config.iconColor;
    const finalIconBg = iconBg ?? config.iconBg;

    if (!finalIcon) return null;

    return (
      <View
        style={[
          styles.iconContainer,
          finalIconBg && finalIconBg !== 'transparent'
            ? { backgroundColor: finalIconBg, padding: 6, borderRadius: 10 }
            : null,
        ]}
      >
        {typeof finalIcon === 'string' ? (
          <Ionicons
            name={finalIcon as keyof typeof Ionicons.glyphMap}
            size={iconSize}
            color={finalIconColor}
          />
        ) : (
          finalIcon
        )}
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.outerShadowWrapper,
        {
          borderRadius,
          shadowColor: config.shadowColor,
        },
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        android_ripple={{
          color: 'rgba(255, 255, 255, 0.12)',
          borderless: false,
        }}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        style={[styles.pressable, { height, borderRadius }]}
      >
        <LinearGradient
          colors={config.gradientColors}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[
            styles.gradientContainer,
            {
              borderRadius,
              borderColor: config.borderColor,
            },
          ]}
        >
          {/* Subtle inner top highlight line for glassmorphism inset effect */}
          <View
            style={[
              styles.innerTopHighlight,
              { borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius },
            ]}
          />

          {loading ? (
            <ActivityIndicator color={config.textColor} size="small" />
          ) : (
            <View style={styles.contentRow}>
              {renderIconBadge()}

              <Text style={[styles.buttonText, { color: config.textColor }, textStyle]}>
                {title}
              </Text>
            </View>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

export const TactileButton = memo(TactileButtonComponent);

const styles = StyleSheet.create({
  outerShadowWrapper: {
    width: '100%',
    marginVertical: 6,
    ...(Platform.OS === 'ios'
      ? {
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
        }
      : {}),
  },
  pressable: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
  },
  gradientContainer: {
    width: '100%',
    height: '100%',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 20,
    ...(Platform.OS === 'android'
      ? {
          elevation: 3,
        }
      : {}),
  },
  innerTopHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconContainer: {
    position: 'absolute',
    left: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.25,
    textAlign: 'center',
  },
});
