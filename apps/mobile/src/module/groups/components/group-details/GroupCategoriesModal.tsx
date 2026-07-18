import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useCategories, useDeleteCategory } from '@workspace/api';
import { COLORS } from '../../../../constants/theme';
import { BottomSheetModal } from '../../../../components/BottomSheetModal';
import { getCategoryVisuals } from '../../../../constants/categories';

interface GroupCategoriesModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
  isAdmin: boolean;
  onAddCategoryPress: () => void;
}

export function GroupCategoriesModal({
  visible,
  onClose,
  groupId,
  isAdmin,
  onAddCategoryPress,
}: GroupCategoriesModalProps) {
  const { data, isLoading } = useCategories(groupId);
  const deleteCategory = useDeleteCategory();

  const handleDelete = (id: string, catName: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${catName}"? Expenses in this group using this category will fall back to "Other".`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCategory.mutate(id, {
              onSuccess: () => {
                Alert.alert('Deleted', 'Category deleted successfully.');
              },
              onError: (err) => {
                Alert.alert('Error', err.message || 'Failed to delete category.');
              },
            });
          },
        },
      ]
    );
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose} title="Group Categories">
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Custom Group Categories */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Custom Group Categories</Text>
              {isAdmin && (
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => {
                    onClose();
                    onAddCategoryPress();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle" size={16} color="#ffffff" />
                  <Text style={styles.addBtnText}>Add New</Text>
                </TouchableOpacity>
              )}
            </View>

            {data?.custom && data.custom.length > 0 ? (
              <View style={styles.listContainer}>
                {data.custom.map((cat) => {
                  const visuals = getCategoryVisuals(cat.name, data.custom);
                  return (
                    <View key={cat.id} style={styles.categoryRow}>
                      <View style={styles.categoryInfo}>
                        <View style={[styles.iconBg, { backgroundColor: visuals.bg }]}>
                          {visuals.lib === 'Ionicons' ? (
                            <Ionicons
                              name={visuals.icon as never}
                              size={18}
                              color={visuals.color}
                            />
                          ) : (
                            <MaterialIcons
                              name={visuals.icon as never}
                              size={18}
                              color={visuals.color}
                            />
                          )}
                        </View>
                        <Text style={styles.categoryName}>{cat.name}</Text>
                      </View>
                      {isAdmin && (
                        <TouchableOpacity
                          onPress={() => handleDelete(cat.id, cat.name)}
                          style={styles.deleteBtn}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="grid-outline" size={32} color={COLORS.outlineVariant} />
                <Text style={styles.emptyStateText}>No custom categories yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  {isAdmin
                    ? 'Create group-wide categories to classify group expenses.'
                    : 'Group administrators can add custom categories here.'}
                </Text>
              </View>
            )}
          </View>

          {/* Standard Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Standard Categories</Text>
            <View style={styles.listContainer}>
              {data?.standard.map((name) => {
                const visuals = getCategoryVisuals(name);
                return (
                  <View key={name} style={styles.categoryRow}>
                    <View style={styles.categoryInfo}>
                      <View style={[styles.iconBg, { backgroundColor: visuals.bg }]}>
                        {visuals.lib === 'Ionicons' ? (
                          <Ionicons name={visuals.icon as never} size={18} color={visuals.color} />
                        ) : (
                          <MaterialIcons
                            name={visuals.icon as never}
                            size={18}
                            color={visuals.color}
                          />
                        )}
                      </View>
                      <Text style={styles.categoryName}>{name}</Text>
                    </View>
                    <Text style={styles.standardLabel}>Default</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.1,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  listContainer: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainer,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  deleteBtn: {
    padding: 6,
  },
  standardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.outlineVariant,
  },
  emptyState: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginTop: 4,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: COLORS.outline,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 16,
  },
});
