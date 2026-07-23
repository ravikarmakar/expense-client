import React, { useRef } from 'react';
import { Pressable, Animated, StyleProp, ViewStyle } from 'react-native';
import { hapticFeedback } from '../utils/haptics';

interface ScalePressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  activeScale?: number;
  hapticType?: 'light' | 'medium' | 'success' | 'selection' | 'none';
}

/**
 * A reusable, premium micro-interaction wrapper.
 * Animates scale on press-in/press-out using high-fidelity spring animations.
 */
export function ScalePressable({
  children,
  onPress,
  style,
  disabled = false,
  activeScale = 0.97,
  hapticType = 'light',
}: ScalePressableProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.timing(scaleAnim, {
      toValue: activeScale,
      duration: 60,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (disabled || !onPress) return;
    onPress();
    if (hapticType && hapticType !== 'none') {
      requestAnimationFrame(() => {
        if (hapticType === 'light') hapticFeedback.lightImpact();
        else if (hapticType === 'medium') hapticFeedback.mediumImpact();
        else if (hapticType === 'selection') hapticFeedback.selection();
        else if (hapticType === 'success') hapticFeedback.success();
      });
    }
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
