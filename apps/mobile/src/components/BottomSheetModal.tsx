import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import { useHideTabBar } from '../hooks/useHideTabBar';

interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  behavior?: 'padding' | 'height' | 'position';
  keyboardVerticalOffset?: number;
}

export const BottomSheetModal = React.memo(function BottomSheetModal({
  visible,
  onClose,
  title,
  children,
  behavior = Platform.OS === 'ios' ? 'padding' : undefined,
  keyboardVerticalOffset = 0,
}: BottomSheetModalProps) {
  const keyboardHeight = useKeyboardHeight();
  const insets = useSafeAreaInsets();
  useHideTabBar(visible);

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      {/* Backdrop click to dismiss - remains absolute-positioned to cover full screen */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView
          behavior={behavior}
          keyboardVerticalOffset={keyboardVerticalOffset}
          style={styles.overlay}
          pointerEvents="box-none"
        >
          <View
            style={[
              styles.sheet,
              {
                paddingBottom: Math.max(insets.bottom, 24),
              },
            ]}
          >
            {/* Handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.sheetTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
                <Ionicons name="close" size={22} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>

            {children}
          </View>
        </KeyboardAvoidingView>
      ) : (
        <View
          style={[styles.overlay, { paddingBottom: Math.max(0, keyboardHeight - insets.bottom) }]}
          pointerEvents="box-none"
        >
          <View
            style={[
              styles.sheet,
              {
                paddingBottom: Math.max(insets.bottom, 24),
              },
            ]}
          >
            {/* Handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.sheetTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
                <Ionicons name="close" size={22} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>

            {children}
          </View>
        </View>
      )}
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    elevation: 24,
    zIndex: 99,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    flexShrink: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.outlineVariant,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerLow,
  },
});
