import Papa from 'papaparse';
import { ExpenseExportItem } from './types';

export const generateCsvContent = (expenses: ExpenseExportItem[]): string => {
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

  const csvString = Papa.unparse(data, {
    quotes: true,
    header: true,
    newline: '\n',
  });

  return csvString;
};
