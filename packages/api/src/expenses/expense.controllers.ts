import { useState, useEffect, useMemo, useCallback } from 'react';
import { useExpenses, useExpensesSummary } from './expense.hooks';
import { useMe } from '../auth/auth.hooks';
import { type Expense, type ExpenseCategory } from './expense.types';

export const PERSONAL_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills',
  'Travel',
  'Health',
  'Other',
] as const;

export function useActivityController() {
  const { data: user } = useMe();
  const [addExpenseVisible, setAddExpenseVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ExpenseCategory | 'All'>('All');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [dateRange, setDateRange] = useState<string>('this-month');
  const [isDateRangeDropdownOpen, setIsDateRangeDropdownOpen] = useState(false);
  const [paidByMe, setPaidByMe] = useState(false);
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-asc' | 'amount-desc'>(
    'date-desc'
  );
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [useWalletOnly, setUseWalletOnly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const dateFilter = useMemo(() => {
    if (dateRange === 'all-time') return {};
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (dateRange === 'this-month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (dateRange === 'last-month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else if (dateRange === 'last-7-days') {
      start.setDate(now.getDate() - 7);
    } else if (dateRange === 'last-30-days') {
      start.setDate(now.getDate() - 30);
    } else if (dateRange.startsWith('month-')) {
      const parts = dateRange.replace('month-', '').split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      if (!isNaN(year) && !isNaN(month)) {
        start = new Date(year, month, 1, 0, 0, 0, 0);
        end = new Date(year, month + 1, 0, 23, 59, 59, 999);
      }
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [dateRange]);

  const {
    data: expensesData,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useExpenses({
    ...(activeFilter !== 'All' && { category: activeFilter }),
    ...(paidByMe && { paidByMe: true }),
    ...(useWalletOnly && { useWallet: true }),
    ...(debouncedSearchQuery.trim() !== '' && { search: debouncedSearchQuery.trim() }),
    ...dateFilter,
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const expenses = useMemo(() => {
    return expensesData?.pages.flatMap((page) => page.expenses) ?? [];
  }, [expensesData]);

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => {
      if (sortBy === 'date-desc') {
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'date-asc') {
        const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return new Date(a.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'amount-asc') {
        return a.amount - b.amount;
      }
      if (sortBy === 'amount-desc') {
        return b.amount - a.amount;
      }
      return 0;
    });
  }, [expenses, sortBy]);

  const handleResetAll = useCallback(() => {
    setActiveFilter('All');
    setDateRange('this-month');
    setPaidByMe(false);
    setUseWalletOnly(false);
    setSortBy('date-desc');
    setIsCategoryDropdownOpen(false);
    setIsDateRangeDropdownOpen(false);
    setIsSortDropdownOpen(false);
    setFilterModalVisible(false);
  }, []);

  return {
    user,
    addExpenseVisible,
    setAddExpenseVisible,
    filterModalVisible,
    setFilterModalVisible,
    activeFilter,
    setActiveFilter,
    isCategoryDropdownOpen,
    setIsCategoryDropdownOpen,
    dateRange,
    setDateRange,
    isDateRangeDropdownOpen,
    setIsDateRangeDropdownOpen,
    paidByMe,
    setPaidByMe,
    sortBy,
    setSortBy,
    isSortDropdownOpen,
    setIsSortDropdownOpen,
    useWalletOnly,
    setUseWalletOnly,
    isRefreshing,
    searchVisible,
    setSearchVisible,
    searchQuery,
    setSearchQuery,
    sortedExpenses,
    isLoading,
    isError,
    refetch,
    handleRefresh,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    handleResetAll,
  };
}

export function usePersonalController() {
  const { data: user } = useMe();
  const { data: summary } = useExpensesSummary();
  const [addExpenseVisible, setAddExpenseVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: expensesData,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useExpenses({
    personal: true,
    limit: 100,
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const allExpenses = useMemo(() => {
    const list = expensesData?.pages.flatMap((page) => page.expenses) ?? [];
    return [...list].sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [expensesData]);

  const expensesList = useMemo(() => {
    if (!selectedCategoryFilter) return allExpenses;
    return allExpenses.filter((e: Expense) => e.category === selectedCategoryFilter);
  }, [allExpenses, selectedCategoryFilter]);

  // Compute total spent on personal expenses (overall from server aggregate)
  const totalSpent = useMemo(() => {
    if (summary?.totalPersonalSpent !== undefined) {
      return summary.totalPersonalSpent;
    }
    return allExpenses.reduce((sum: number, item: Expense) => sum + item.amount, 0);
  }, [summary, allExpenses]);

  // Compute total spent on personal expenses (this month)
  const totalThisMonth = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return allExpenses.reduce((sum: number, item: Expense) => {
      const expDate = new Date(item.date);
      if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
        return sum + item.amount;
      }
      return sum;
    }, 0);
  }, [allExpenses]);

  // Compute category breakdown totals
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    PERSONAL_CATEGORIES.forEach((cat) => {
      totals[cat] = 0;
    });

    allExpenses.forEach((exp: Expense) => {
      const cat = exp.category;
      if (cat in totals) {
        totals[cat] += exp.amount;
      } else {
        totals['Other'] = (totals['Other'] ?? 0) + exp.amount;
      }
    });

    return PERSONAL_CATEGORIES.map((cat) => ({
      name: cat,
      amount: totals[cat] ?? 0,
    }));
  }, [allExpenses]);

  return {
    user,
    addExpenseVisible,
    setAddExpenseVisible,
    menuVisible,
    setMenuVisible,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    isRefreshing,
    allExpenses,
    expensesList,
    totalSpent,
    totalThisMonth,
    categoryTotals,
    isLoading,
    isError,
    refetch,
    handleRefresh,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}
