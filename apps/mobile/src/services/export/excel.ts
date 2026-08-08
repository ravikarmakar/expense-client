import * as XLSX from 'xlsx';
import { ExpenseExportItem } from './types';

export const generateExcelWorkbook = (expenses: ExpenseExportItem[]): string => {
  const data = expenses.map((exp) => ({
    Date: new Date(exp.date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    Category: exp.category || 'Other',
    Description: exp.title,
    Amount: exp.amount,
    'Payment Method': exp.paymentMethod || 'UPI / Cash',
    Notes: exp.notes || '',
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const colWidths = [
    { wch: 14 }, // Date
    { wch: 16 }, // Category
    { wch: 28 }, // Description
    { wch: 14 }, // Amount
    { wch: 18 }, // Payment Method
    { wch: 24 }, // Notes
  ];
  worksheet['!cols'] = colWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Personal Expenses');

  // Export to base64 string
  const base64Content = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
  return base64Content;
};
