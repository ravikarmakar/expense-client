import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../../constants/theme';
import { styles } from '../styles/groups-tab.styles';

interface GroupsHeaderProps {
  searchQuery: string;
  setSearchQuery: (text: string) => void;
  onCreateGroupPress: () => void;
}

export function GroupsHeader({
  searchQuery,
  setSearchQuery,
  onCreateGroupPress,
}: GroupsHeaderProps) {
  const insets = useSafeAreaInsets();
  const [searchVisible, setSearchVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <LinearGradient
      colors={['rgba(75, 65, 225, 0.08)', 'rgba(75, 65, 225, 0.02)', 'transparent']}
      style={[styles.headerContainer, { paddingTop: insets.top + 12, paddingBottom: 16 }]}
    >
      <View style={styles.tabHeaderRow}>
        {searchVisible ? (
          /* Search Active: Search Input stretch with Cancel Back button */
          <View style={localStyles.searchBarContainer}>
            <TouchableOpacity
              style={localStyles.backButton}
              onPress={() => {
                setSearchVisible(false);
                setSearchQuery('');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>

            <View style={localStyles.searchInputInner}>
              <Ionicons
                name="search-outline"
                size={18}
                color={COLORS.outline}
                style={localStyles.searchIconInline}
              />
              <TextInput
                placeholder="Search groups..."
                placeholderTextColor={COLORS.outline}
                style={localStyles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
                autoFocus
              />
              {searchQuery.trim() !== '' && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={16} color={COLORS.outline} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          /* Search Inactive: Title "My Groups" & Action Buttons */
          <>
            <View>
              <Text style={styles.tabTitle}>My Groups</Text>
              <Text style={styles.tabSubtitle}>Shared Ledger</Text>
            </View>

            <View style={localStyles.headerRightActions}>
              <TouchableOpacity
                style={localStyles.iconButton}
                activeOpacity={0.7}
                onPress={() => setSearchVisible(true)}
              >
                <Ionicons name="search" size={22} color={COLORS.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={localStyles.iconButton}
                activeOpacity={0.7}
                onPress={() => setMenuVisible(true)}
              >
                <Ionicons name="ellipsis-vertical" size={22} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* 3-Dot Dropdown Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={localStyles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={[localStyles.dropdownMenu, { top: insets.top + 56 }]}>
            <TouchableOpacity
              style={localStyles.dropdownItem}
              activeOpacity={0.7}
              onPress={() => {
                setMenuVisible(false);
                onCreateGroupPress();
              }}
            >
              <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
              <Text style={localStyles.dropdownItemText}>New Group</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
}

const localStyles = StyleSheet.create({
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e8ece9',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
  },
  backButton: {
    marginRight: 10,
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e8ece9',
  },
  searchInputInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#e8ece9',
  },
  searchIconInline: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.onSurface,
    fontWeight: '500',
    height: '100%',
    paddingVertical: 0,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownMenu: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 6,
    minWidth: 145,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#e8ece9',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
    borderRadius: 8,
  },
  dropdownItemText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
});
