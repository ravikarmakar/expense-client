import { type CustomCategory } from '@workspace/api';
import { CATEGORY_ICONS } from './theme';

export const CATEGORY_CONFIG = CATEGORY_ICONS;

/**
 * Returns the config for a given category, falling back to "Other".
 */
export function getCategoryConfig(category: string) {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS.Other;
}

/**
 * Returns the config for a category, checking custom categories first and falling back to standard config.
 */
export function getCategoryVisuals(categoryName: string, customCategories: CustomCategory[] = []) {
  const match = customCategories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
  if (match) {
    return {
      icon: match.icon,
      lib: 'Ionicons' as const,
      bg: `${match.color}15`, // soft background hue
      color: match.color,
    };
  }
  const standard = CATEGORY_ICONS[categoryName] || CATEGORY_ICONS.Other;
  return {
    icon: standard.icon,
    lib: standard.lib,
    bg: standard.bg,
    color: standard.color,
  };
}
