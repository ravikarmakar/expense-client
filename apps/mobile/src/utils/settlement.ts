import type { ActivityItem } from '@workspace/api';

/**
 * Returns a Set of settled expense IDs and a Set of settled member split keys.
 * A split is settled if the running balance between the payer and debtor reached 0
 * after the expense was created.
 */
export function computeSettledTransactions(activityItems: ActivityItem[]) {
  const settledExpenseIds = new Set<string>();
  const settledSplitKeys = new Set<string>(); // "expenseId-userId"

  if (!activityItems || activityItems.length === 0) {
    return { settledExpenseIds, settledSplitKeys };
  }

  // Sort chronological (oldest first)
  const sortedHistory = [...activityItems].reverse();
  const runningBalances = new Map<string, number>();
  const lastZeroBalanceTimestamps = new Map<string, number>();

  for (const item of sortedHistory) {
    if (item.type === 'expense') {
      const e = item.data;
      const payerId = e.paidBy.userId;
      for (const s of e.splits) {
        if (s.userId === payerId) continue;
        const key = [payerId, s.userId].sort().join('-');
        const current = runningBalances.get(key) ?? 0;
        if (key.startsWith(payerId)) {
          runningBalances.set(key, current + s.amount);
        } else {
          runningBalances.set(key, current - s.amount);
        }
      }
    } else if (item.type === 'settlement') {
      const s = item.data;
      if (s.fromId && s.toId) {
        const key = [s.fromId, s.toId].sort().join('-');
        const current = runningBalances.get(key) ?? 0;
        if (key.startsWith(s.toId)) {
          runningBalances.set(key, current - s.amount);
        } else {
          runningBalances.set(key, current + s.amount);
        }
        const newVal = runningBalances.get(key) ?? 0;
        if (Math.abs(newVal) < 0.01) {
          lastZeroBalanceTimestamps.set(key, new Date(s.createdAt).getTime());
        }
      }
    }
  }

  for (const item of activityItems) {
    if (item.type === 'expense') {
      const e = item.data;
      const payerId = e.paidBy.userId;
      let allSplitsSettled = true;

      for (const s of e.splits) {
        if (s.userId === payerId || Math.abs(s.amount) < 0.01) {
          // Payer's own split or zero-debt split is always settled
          settledSplitKeys.add(`${e.id}-${s.userId}`);
          continue;
        }
        const key = [payerId, s.userId].sort().join('-');
        const zeroTs = lastZeroBalanceTimestamps.get(key);
        const expenseTs = new Date(e.createdAt).getTime();

        if (zeroTs && expenseTs <= zeroTs) {
          settledSplitKeys.add(`${e.id}-${s.userId}`);
        } else {
          allSplitsSettled = false;
        }
      }

      if (allSplitsSettled && e.splits.length > 1) {
        settledExpenseIds.add(e.id);
      }
    }
  }

  return { settledExpenseIds, settledSplitKeys };
}
