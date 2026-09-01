export interface PaymentTransaction {
  id?: string;
  type: 'income' | 'expense' | 'group_expense';
  amount: number;
  ratio: number;
}

export interface RawTimelineItem {
  id?: string;
  type: 'income' | 'expense' | 'group_expense';
  amount: number;
  timestamp: number;
}

/**
 * Pure Bezier Math: Calculates Y position along the 3-segment SVG Bezier line path.
 */
export const getCurveY = (ratio: number): number => {
  const clampedR = Math.max(0, Math.min(1, ratio));
  if (clampedR <= 0.5) {
    const t = clampedR / 0.5;
    return (1 - t) * (1 - t) * 32 + 2 * (1 - t) * t * 18 + t * t * 25;
  } else if (clampedR <= 0.75) {
    const t = (clampedR - 0.5) / 0.25;
    return (1 - t) * (1 - t) * 25 + 2 * (1 - t) * t * 32 + t * t * 14;
  } else {
    const t = (clampedR - 0.75) / 0.25;
    return (1 - t) * (1 - t) * 14 + 2 * (1 - t) * t * -4 + t * t * 10;
  }
};

export interface TransactionInputItem {
  id?: string;
  amount?: number | string;
  date?: string | Date;
  createdAt?: string | Date;
  groupId?: string | null;
  group?: unknown;
  isGroup?: boolean;
}

/**
 * Filters raw incomes & expenses for current month and prepares sorted transactions with X-ratios.
 */
export const prepareSparklineTimeline = (
  incomes: TransactionInputItem[] = [],
  expenses: TransactionInputItem[] = []
): PaymentTransaction[] => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const parseTimestamp = (item: TransactionInputItem): number => {
    let t = 0;
    if (item.createdAt) {
      const parsed = new Date(String(item.createdAt)).getTime();
      if (!isNaN(parsed) && parsed > 0) t = parsed;
    }
    if (!t && item.date) {
      const parsed = new Date(String(item.date)).getTime();
      if (!isNaN(parsed) && parsed > 0) t = parsed;
    }
    return t > 0 ? t : Date.now();
  };

  const isCurrentOrRecentMonth = (item: TransactionInputItem): boolean => {
    const dStr = item.date || item.createdAt;
    if (!dStr) return true;
    const d = new Date(String(dStr));
    if (isNaN(d.getTime())) return true;
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  };

  const filteredIncomes = incomes.filter(isCurrentOrRecentMonth);
  const filteredExpenses = expenses.filter(isCurrentOrRecentMonth);

  const incomeItems: RawTimelineItem[] = filteredIncomes.map((inc) => ({
    id: inc.id,
    type: 'income' as const,
    amount: typeof inc.amount === 'number' ? inc.amount : parseFloat(String(inc.amount)) || 0,
    timestamp: parseTimestamp(inc),
  }));

  const expenseItems: RawTimelineItem[] = filteredExpenses.map((e) => {
    const amt = typeof e.amount === 'number' ? e.amount : parseFloat(String(e.amount)) || 0;
    const isGroup = Boolean(e.groupId || e.group || e.isGroup);
    return {
      id: e.id,
      type: isGroup ? ('group_expense' as const) : ('expense' as const),
      amount: amt,
      timestamp: parseTimestamp(e),
    };
  });

  const combinedTimeline = [...incomeItems, ...expenseItems].sort(
    (a, b) => a.timestamp - b.timestamp
  );

  return combinedTimeline.map((item, idx) => ({
    id: item.id,
    type: item.type,
    amount: item.amount,
    ratio: combinedTimeline.length === 1 ? 0.5 : 0.05 + (idx * 0.9) / (combinedTimeline.length - 1),
  }));
};
