import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

interface LoadingViewProps {
  size?: 'small' | 'large';
  color?: string;
}

export const LoadingView = React.memo(function LoadingView({
  size = 'large',
  color = COLORS.secondary,
}: LoadingViewProps) {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
});

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
