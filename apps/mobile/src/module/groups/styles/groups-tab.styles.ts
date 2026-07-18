import { StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.03)',
  },
  tabHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  tabSubtitle: {
    fontSize: 12,
    color: COLORS.outline,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  createGroupButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },

  // Premium Search Bar Styling
  searchBarContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#e8ece9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.onSurface,
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },

  // Premium Pill Filters
  filterScrollView: {
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16, // aligned with screen border padding
    paddingVertical: 4,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#e8ece9',
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  filterPillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },

  // Premium Net Balance Card (with modern colored dashboard feel)
  netBalanceCard: {
    backgroundColor: '#eefcf5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#c6edd7',
    elevation: 2,
    shadowColor: '#006948',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  netBalanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dff6eb',
    marginBottom: 12,
  },
  netBalanceLabel: {
    fontSize: 12,
    color: COLORS.outline,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  netBalanceAmount: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  netBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  netBalanceCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  netBalanceColSeparator: {
    width: 1,
    height: 16,
    backgroundColor: '#dff6eb',
  },
  netBalanceTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  netBalanceDetailLabel: {
    fontSize: 12,
    color: COLORS.outline,
    fontWeight: '500',
  },
  netBalanceDetailValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  iconRoundBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Legacy/Compatibility styles for SummaryRow (optional but good to keep or style nicely)
  groupsSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  groupsSummaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryCardGreen: {
    backgroundColor: '#e6f4ea',
    borderColor: '#c2e7cd',
  },
  summaryCardRed: {
    backgroundColor: '#fce8e6',
    borderColor: '#f9c2bd',
  },
  summaryIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIconBgGreen: {
    backgroundColor: 'rgba(0, 105, 72, 0.1)',
  },
  summaryIconBgRed: {
    backgroundColor: 'rgba(186, 26, 26, 0.1)',
  },
  groupsSummaryLabel: {
    fontSize: 11,
    color: COLORS.outline,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  groupsSummaryValueGreen: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  groupsSummaryValueRed: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.error,
  },
  groupsList: {
    gap: 8,
    paddingBottom: 24,
  },
});
