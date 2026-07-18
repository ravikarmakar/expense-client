import { StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

export const globalStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 100, // padding to prevent overlapping bottom navigation tab bars
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  sectionTitleLarge: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
    textTransform: 'none',
    letterSpacing: 0,
    marginBottom: 0,
    marginLeft: 0,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
  },
});
