import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

interface AppBackgroundProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Reusable SplitShare App Background Utility Component.
 * Light Mode: Subtle vertical gradient starting almost white (#FAFBFC),
 * fading through soft #F0F3F7 to a cool grounded gray-blue (#E8ECF1) at the bottom.
 * Dark Mode: Deep dark matte gradient (#142A21 to #08110F) with faint edge vignette.
 */
export const AppBackground: React.FC<AppBackgroundProps> = ({ children, style }) => {
  const { isDark } = useTheme();

  return (
    <View style={[styles.container, !isDark && { backgroundColor: '#E8ECF1' }, style]}>
      {/* Primary Vertical Gradient */}
      <LinearGradient
        colors={
          isDark
            ? ['rgba(20, 42, 33, 0.45)', 'rgba(12, 26, 20, 0.2)', '#08110F']
            : ['#FAFBFC', '#F0F3F7', '#E8ECF1']
        }
        locations={[0, 0.45, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Dark Mode Edge Vignette */}
      {isDark && (
        <LinearGradient
          colors={['rgba(4, 9, 8, 0.25)', 'transparent', 'rgba(4, 9, 8, 0.5)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
      )}

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08110F',
  },
});
