import { StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabSelectorContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 20,
    padding: 4,
    gap: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  tabBtnActive: {
    backgroundColor: COLORS.surface,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.outline,
    letterSpacing: 0.5,
  },
  tabBtnTextActive: {
    color: COLORS.primary,
  },
  filterSelectorContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    padding: 4,
    gap: 4,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  filterBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.outline,
    letterSpacing: 0.5,
  },
  filterBtnTextActive: {
    color: '#ffffff',
  },
  periodLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 20,
  },
});
