export type ExportDateRange =
  | 'this-month'
  | 'last-month'
  | 'last-7-days'
  | 'last-30-days'
  | 'last-3-months'
  | 'custom';
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json';
export type ExportContext = 'personal' | 'income' | 'group' | 'activity';

export interface ExpenseExportItem {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod?: string | null;
  notes?: string | null;
  expenseType?: string | null;
  [key: string]: unknown;
}

export interface ExportSummary {
  totalExpenses: number;
  transactionCount: number;
  highestExpense: number;
  lowestExpense: number;
  averageExpense: number;
}

export interface ExportOptions {
  dateRange: ExportDateRange;
  customStartDate?: Date;
  customEndDate?: Date;
  format: ExportFormat;
  userName?: string;
  context?: ExportContext;
}

export interface ExportResult {
  success: boolean;
  fileUri?: string;
  displayPath?: string;
  fileName?: string;
  mimeType?: string;
  error?: string;
}
