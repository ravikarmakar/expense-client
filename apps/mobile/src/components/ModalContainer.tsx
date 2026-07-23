import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import { useHideTabBar } from '../hooks/useHideTabBar';

interface ModalContainerProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  /** Disable the close button while a mutation is in flight */
  loading?: boolean;
  /** Modal animation type */
  animationType?: 'slide' | 'fade' | 'none';
  children: React.ReactNode;
}

/**
 * Reusable bottom-sheet modal container.
 * Provides: overlay + keyboard avoidance + rounded content area + header with close button.
 * Wrap your form content as children.
 */
export function ModalContainer({
  visible,
  onClose,
  title,
  loading = false,
  animationType = 'slide',
  children,
}: ModalContainerProps) {
  const keyboardHeight = useKeyboardHeight();
  const insets = useSafeAreaInsets();
  useHideTabBar(visible);

  const renderContent = () => (
    <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeBtn}
          activeOpacity={0.7}
          disabled={loading}
        >
          <Ionicons name="close" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
      </View>

      {/* Scrollable body */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );

  return (
    <Modal
      animationType={animationType}
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View
        style={[
          styles.overlay,
          Platform.OS === 'android' && {
            paddingBottom: Math.max(0, keyboardHeight - insets.bottom),
          },
        ]}
      >
        {Platform.OS === 'ios' ? (
          <KeyboardAvoidingView behavior="padding" style={styles.keyboardView}>
            {renderContent()}
          </KeyboardAvoidingView>
        ) : (
          <View style={styles.keyboardView}>{renderContent()}</View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    elevation: 24,
    zIndex: 99,
  },
  keyboardView: {
    width: '100%',
  },
  content: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
