import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCategories, useDeleteCategory } from '@workspace/api';
import { COLORS } from '../constants/theme';
import { TopAppBar } from '../components/TopAppBar';
import { CreateCategoryModal } from '../components/CreateCategoryModal';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { getCategoryVisuals } from '../constants/categories';
import { useTheme } from '../context/ThemeContext';
import { AppBackground } from '../components/AppBackground';

export default function CategoriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const variant = isDark ? 'dark' : 'light';

  const { data, isLoading } = useCategories();
  const deleteCategory = useDeleteCategory();

  const [modalVisible, setModalVisible] = useState(false);

  const handleDelete = (id: string, catName: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${catName}"? Existing expenses using this category will fall back to "Other".`,
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
    <AppBackground style={styles.container}>
      <TopAppBar
        title="Manage Categories"
        showBack
        onBack={() => router.back()}
        variant={variant}
      />

      {isLoading ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContainer, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Custom Categories Skeleton */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <SkeletonLoader width={180} height={16} borderRadius={8} />
              <SkeletonLoader width={80} height={28} borderRadius={20} />
            </View>
            <View style={[styles.listContainer, isDark && styles.listContainerDark]}>
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.categoryRow,
                    isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.08)' },
                  ]}
                >
                  <View style={styles.categoryInfo}>
                    <SkeletonLoader width={36} height={36} borderRadius={12} />
                    <SkeletonLoader width={100} height={14} borderRadius={6} />
                  </View>
                  <SkeletonLoader width={24} height={24} borderRadius={12} />
                </View>
              ))}
            </View>
          </View>

          {/* Standard Categories Skeleton */}
          <View style={styles.section}>
            <SkeletonLoader width={150} height={16} borderRadius={8} />
            <View style={[styles.listContainer, isDark && styles.listContainerDark]}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.categoryRow,
                    isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.08)' },
                  ]}
                >
                  <View style={styles.categoryInfo}>
                    <SkeletonLoader width={36} height={36} borderRadius={12} />
                    <SkeletonLoader width={90 + (i % 3) * 20} height={14} borderRadius={6} />
                  </View>
                  <SkeletonLoader width={44} height={12} borderRadius={6} />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scrollContainer, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Custom Categories Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                Your Custom Categories
              </Text>
              <TouchableOpacity
                style={[styles.addBtn, isDark && styles.addBtnDark]}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle" size={16} color="#ffffff" />
                <Text style={styles.addBtnText}>Add New</Text>
              </TouchableOpacity>
            </View>

            {data?.custom && data.custom.length > 0 ? (
              <View style={[styles.listContainer, isDark && styles.listContainerDark]}>
                {data.custom.map((cat, idx) => {
                  const visuals = getCategoryVisuals(cat.name, data.custom);
                  const isLast = idx === data.custom.length - 1;
                  return (
                    <View
                      key={cat.id}
                      style={[
                        styles.categoryRow,
                        isLast && { borderBottomWidth: 0 },
                        isDark && !isLast && { borderBottomColor: 'rgba(255, 255, 255, 0.08)' },
                      ]}
                    >
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
                        <Text style={[styles.categoryName, isDark && styles.categoryNameDark]}>
                          {cat.name}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDelete(cat.id, cat.name)}
                        style={styles.deleteBtn}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={[styles.emptyState, isDark && styles.emptyStateDark]}>
                <Ionicons
                  name="grid-outline"
                  size={32}
                  color={isDark ? 'rgba(255, 255, 255, 0.4)' : COLORS.outlineVariant}
                />
                <Text style={[styles.emptyStateText, isDark && styles.emptyStateTextDark]}>
                  No custom categories yet
                </Text>
                <Text style={[styles.emptyStateSubtext, isDark && styles.emptyStateSubtextDark]}>
                  Create your own categories to classify expenses exactly how you want.
                </Text>
              </View>
            )}
          </View>

          {/* Standard Categories Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Standard Categories
            </Text>
            <View style={[styles.listContainer, isDark && styles.listContainerDark]}>
              {data?.standard.map((name, idx) => {
                const visuals = getCategoryVisuals(name);
                const isLast = idx === (data?.standard.length ?? 0) - 1;
                return (
                  <View
                    key={name}
                    style={[
                      styles.categoryRow,
                      isLast && { borderBottomWidth: 0 },
                      isDark && !isLast && { borderBottomColor: 'rgba(255, 255, 255, 0.08)' },
                    ]}
                  >
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
                      <Text style={[styles.categoryName, isDark && styles.categoryNameDark]}>
                        {name}
                      </Text>
                    </View>
                    <Text style={[styles.standardLabel, isDark && styles.standardLabelDark]}>
                      Default
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}

      {/* ── Modal: Create Category ── */}
      <CreateCategoryModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
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
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.1,
  },
  sectionTitleDark: {
    color: '#F9FAFB',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addBtnDark: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  listContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  listContainerDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  categoryNameDark: {
    color: '#F9FAFB',
  },
  deleteBtn: {
    padding: 6,
  },
  standardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.outlineVariant,
  },
  standardLabelDark: {
    color: '#9CA3AF',
  },
  emptyState: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyStateDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginTop: 4,
  },
  emptyStateTextDark: {
    color: '#F9FAFB',
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: COLORS.outline,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 16,
  },
  emptyStateSubtextDark: {
    color: '#9CA3AF',
  },
});
