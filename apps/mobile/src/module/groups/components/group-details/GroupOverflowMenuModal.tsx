import React from 'react';
import { Modal, View, Text, Pressable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../../../../constants/theme';
import { detailStyles as styles } from '../../styles/group.styles';
import { useGroupDetail } from '../../contexts/GroupDetailContext';
import { useTheme } from '../../../../context/ThemeContext';

interface GroupOverflowMenuModalProps {
  onAddCategoryPress: () => void;
}

export function GroupOverflowMenuModal({ onAddCategoryPress }: GroupOverflowMenuModalProps) {
  const { isDark } = useTheme();
  const {
    menuVisible,
    setMenuVisible,
    isAdmin,
    isFullySettled,
    id: groupId,
    insets,
    setEditGroupVisible,
    confirmDeactivateGroup,
    confirmLeaveGroup,
    confirmActivateGroup,
    group,
  } = useGroupDetail();

  const handleClose = () => setMenuVisible(false);

  return (
    <Modal
      visible={menuVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.menuOverlay} onPress={handleClose}>
        <View
          style={[
            styles.menuContainer,
            { top: insets.top + 50 },
            isDark && {
              backgroundColor: '#101917',
              borderColor: '#1E2F2B',
            },
          ]}
        >
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              handleClose();
              router.push(`/groups/${groupId}/analytics`);
            }}
          >
            <Ionicons
              name="bar-chart-outline"
              size={20}
              color={isDark ? '#F9FAFB' : COLORS.onSurface}
            />
            <Text style={[styles.menuItemText, isDark && { color: '#F9FAFB' }]}>Analytics</Text>
          </TouchableOpacity>

          {isAdmin && (
            <TouchableOpacity
              style={[
                styles.menuItem,
                styles.menuItemBorder,
                isDark && { borderTopColor: 'rgba(255, 255, 255, 0.08)' },
              ]}
              onPress={() => {
                handleClose();
                onAddCategoryPress();
              }}
            >
              <Ionicons
                name="grid-outline"
                size={20}
                color={isDark ? '#F9FAFB' : COLORS.onSurface}
              />
              <Text style={[styles.menuItemText, isDark && { color: '#F9FAFB' }]}>
                Add Category
              </Text>
            </TouchableOpacity>
          )}

          {isAdmin && (
            <>
              {group?.isActive !== false ? (
                <>
                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      styles.menuItemBorder,
                      isDark && { borderTopColor: 'rgba(255, 255, 255, 0.08)' },
                    ]}
                    onPress={() => {
                      handleClose();
                      setEditGroupVisible(true);
                    }}
                  >
                    <Ionicons
                      name="pencil-outline"
                      size={20}
                      color={isDark ? '#F9FAFB' : COLORS.onSurface}
                    />
                    <Text style={[styles.menuItemText, isDark && { color: '#F9FAFB' }]}>
                      Edit Group
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      styles.menuItemBorder,
                      isDark && { borderTopColor: 'rgba(255, 255, 255, 0.08)' },
                    ]}
                    onPress={() => {
                      handleClose();
                      confirmDeactivateGroup();
                    }}
                  >
                    <Ionicons
                      name="power-outline"
                      size={20}
                      color={
                        isFullySettled
                          ? isDark
                            ? '#F87171'
                            : COLORS.error
                          : isDark
                            ? '#6B7280'
                            : COLORS.outline
                      }
                    />
                    <Text
                      style={[
                        styles.menuItemText,
                        {
                          color: isFullySettled
                            ? isDark
                              ? '#F87171'
                              : COLORS.error
                            : isDark
                              ? '#6B7280'
                              : COLORS.outline,
                        },
                      ]}
                    >
                      Deactivate Group
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.menuItem,
                    styles.menuItemBorder,
                    isDark && { borderTopColor: 'rgba(255, 255, 255, 0.08)' },
                  ]}
                  onPress={() => {
                    handleClose();
                    confirmActivateGroup();
                  }}
                >
                  <Ionicons
                    name="power-outline"
                    size={20}
                    color={isDark ? '#34D399' : COLORS.primary}
                  />
                  <Text
                    style={[styles.menuItemText, { color: isDark ? '#34D399' : COLORS.primary }]}
                  >
                    Activate Group
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
          <TouchableOpacity
            style={[
              styles.menuItem,
              styles.menuItemBorder,
              isDark && { borderTopColor: 'rgba(255, 255, 255, 0.08)' },
            ]}
            onPress={() => {
              handleClose();
              confirmLeaveGroup();
            }}
          >
            <Ionicons name="log-out-outline" size={20} color={isDark ? '#F87171' : COLORS.error} />
            <Text style={[styles.menuItemText, { color: isDark ? '#F87171' : COLORS.error }]}>
              Leave Group
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}
