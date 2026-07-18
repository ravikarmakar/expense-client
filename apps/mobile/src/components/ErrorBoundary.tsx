import React, { Component, ErrorInfo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Optional fallback component to render instead of the default error UI */
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * App-wide error boundary that catches render crashes and shows a recovery UI.
 * Prevents the entire app from going blank on unhandled JS errors.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console in development; in production you'd send to a crash reporter
    console.error('[ErrorBoundary] Caught error:', error, errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.iconBg}>
            <Ionicons name="warning-outline" size={40} color={COLORS.error} />
          </View>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.description}>An unexpected error occurred. Please try again.</Text>
          {__DEV__ && this.state.error && (
            <View style={styles.errorDetail}>
              <Text style={styles.errorText} numberOfLines={4}>
                {this.state.error.message}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.retryButton}
            onPress={this.handleReset}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={18} color="#ffffff" style={styles.retryIcon} />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: COLORS.background,
  },
  iconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: COLORS.outline,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  errorDetail: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  errorText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: COLORS.error,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  retryIcon: {
    marginRight: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
