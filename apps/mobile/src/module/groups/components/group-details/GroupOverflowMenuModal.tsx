import React from 'react';
import { Modal, View, Text, Pressable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../../../../constants/theme';
import { detailStyles as styles } from '../../styles/group.styles';
import { useGroupDetail } from '../../contexts/GroupDetailContext';

export function GroupOverflowMenuModal() {
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
        <View style={[styles.menuContainer, { top: insets.top + 50 }]}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              handleClose();
              router.push(`/groups/${groupId}/analytics`);
            }}
          >
            <Ionicons name="bar-chart-outline" size={20} color={COLORS.onSurface} />
            <Text style={styles.menuItemText}>Analytics</Text>
          </TouchableOpacity>

          {isAdmin && (
            <>
              {group?.isActive !== false ? (
                <>
                  <TouchableOpacity
                    style={[styles.menuItem, styles.menuItemBorder]}
                    onPress={() => {
                      handleClose();
                      setEditGroupVisible(true);
                    }}
                  >
                    <Ionicons name="pencil-outline" size={20} color={COLORS.onSurface} />
                    <Text style={styles.menuItemText}>Edit Group</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.menuItem, styles.menuItemBorder]}
                    onPress={() => {
                      handleClose();
                      confirmDeactivateGroup();
                    }}
                  >
                    <Ionicons
                      name="power-outline"
                      size={20}
                      color={isFullySettled ? COLORS.error : COLORS.outline}
                    />
                    <Text
                      style={[
                        styles.menuItemText,
                        { color: isFullySettled ? COLORS.error : COLORS.outline },
                      ]}
                    >
                      Deactivate Group
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.menuItem, styles.menuItemBorder]}
                  onPress={() => {
                    handleClose();
                    confirmActivateGroup();
                  }}
                >
                  <Ionicons name="power-outline" size={20} color={COLORS.primary} />
                  <Text style={[styles.menuItemText, { color: COLORS.primary }]}>
                    Activate Group
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() => {
              handleClose();
              confirmLeaveGroup();
            }}
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
            <Text style={[styles.menuItemText, { color: COLORS.error }]}>Leave Group</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}
