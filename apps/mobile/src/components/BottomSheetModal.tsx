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
  variant?: 'light' | 'dark';
  headerRight?: React.ReactNode;
  closeButtonPosition?: 'left' | 'right';
}

export const BottomSheetModal = React.memo(function BottomSheetModal({
  visible,
  onClose,
  title,
  children,
  behavior = Platform.OS === 'ios' ? 'padding' : undefined,
  keyboardVerticalOffset = 0,
  variant = 'light',
  headerRight,
  closeButtonPosition = 'right',
}: BottomSheetModalProps) {
  const keyboardHeight = useKeyboardHeight();
  const insets = useSafeAreaInsets();
  useHideTabBar(visible);

  const isDark = variant === 'dark';
  const isCloseLeft = closeButtonPosition === 'left';

  const renderCloseButton = (marginStyle?: object) => (
    <TouchableOpacity
      onPress={onClose}
      style={[
        styles.closeBtn,
        {
          backgroundColor: isDark ? '#101917' : '#f3f4f5',
          borderWidth: 0,
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
        },
        marginStyle,
      ]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      activeOpacity={0.7}
    >
      <Ionicons
        name="close"
        size={20}
        color={isDark ? 'rgba(255, 255, 255, 0.65)' : COLORS.onSurface}
      />
    </TouchableOpacity>
  );

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
              isDark && {
                backgroundColor: '#08110F',
                borderTopWidth: 0,
                borderTopColor: 'transparent',
              },
            ]}
          >
            {/* Handle */}
            <View
              style={[
                styles.handle,
                isDark && {
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  width: 52,
                  height: 5,
                  borderRadius: 2.5,
                },
              ]}
            />

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                {isCloseLeft && renderCloseButton({ marginRight: 12 })}
                <Text style={[styles.sheetTitle, isDark && { color: '#FFFFFF' }]}>{title}</Text>
              </View>
              <View style={styles.headerRight}>
                {headerRight}
                {!isCloseLeft && renderCloseButton({ marginLeft: 8 })}
              </View>
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
              isDark && {
                backgroundColor: '#08110F',
                borderTopWidth: 0,
                borderTopColor: 'transparent',
              },
            ]}
          >
            {/* Handle */}
            <View
              style={[
                styles.handle,
                isDark && {
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  width: 52,
                  height: 5,
                  borderRadius: 2.5,
                },
              ]}
            />

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                {isCloseLeft && renderCloseButton({ marginRight: 12 })}
                <Text style={[styles.sheetTitle, isDark && { color: '#FFFFFF' }]}>{title}</Text>
              </View>
              <View style={styles.headerRight}>
                {headerRight}
                {!isCloseLeft && renderCloseButton({ marginLeft: 8 })}
              </View>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
