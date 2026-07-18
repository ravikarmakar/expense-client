import { useState, useEffect, useMemo, useCallback } from 'react';
import { useExpenses } from './expense.hooks';
import { useMe } from '../auth/auth.hooks';
import { type ExpenseCategory } from './expense.types';

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
  const [dateRange, setDateRange] = useState<
    'all-time' | 'this-month' | 'last-month' | 'last-7-days' | 'last-30-days'
  >('all-time');
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
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (dateRange === 'last-month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else if (dateRange === 'last-7-days') {
      start.setDate(now.getDate() - 7);
    } else if (dateRange === 'last-30-days') {
      start.setDate(now.getDate() - 30);
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
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
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
    setDateRange('all-time');
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
    ...(selectedCategoryFilter && { category: selectedCategoryFilter as ExpenseCategory }),
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const expensesList = useMemo(() => {
    return expensesData?.pages.flatMap((page) => page.expenses) ?? [];
  }, [expensesData]);

  // Compute total spent on personal expenses (overall)
  const totalSpent = useMemo(() => {
    return expensesList.reduce((sum, item) => sum + item.amount, 0);
  }, [expensesList]);

  // Compute category breakdown totals
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    PERSONAL_CATEGORIES.forEach((cat) => {
      totals[cat] = 0;
    });

    expensesList.forEach((exp) => {
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
  }, [expensesList]);

  return {
    user,
    addExpenseVisible,
    setAddExpenseVisible,
    menuVisible,
    setMenuVisible,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    isRefreshing,
    expensesList,
    totalSpent,
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
