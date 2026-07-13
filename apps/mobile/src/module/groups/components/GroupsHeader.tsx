import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
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

  return (
    <LinearGradient
      colors={['rgba(75, 65, 225, 0.08)', 'rgba(75, 65, 225, 0.02)', 'transparent']}
      style={[styles.headerContainer, { paddingTop: insets.top + 12, paddingBottom: 16 }]}
    >
      <View style={styles.tabHeaderRow}>
        <View
          style={[
            styles.searchInner,
            {
              flex: 1,
              marginRight: 12,
              height: 48,
              elevation: 0,
              shadowOpacity: 0,
              borderWidth: 1,
              borderColor: '#e8ece9',
              borderRadius: 14,
              backgroundColor: '#ffffff',
            },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={COLORS.outline}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search groups..."
            placeholderTextColor={COLORS.outline}
            style={[styles.searchInput, { fontSize: 15 }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.trim() !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={16} color={COLORS.outline} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.createGroupButton, { width: 48, height: 48, borderRadius: 14 }]}
          activeOpacity={0.8}
          onPress={onCreateGroupPress}
        >
          <Ionicons name="add" size={26} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
