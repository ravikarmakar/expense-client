import { ExpenseExportItem } from './types';

export const generateJsonContent = (expenses: ExpenseExportItem[]): string => {
  const formattedData = expenses.map((exp) => ({
    id: exp.id,
    title: exp.title,
    amount: exp.amount,
    category: exp.category || 'Other',
    date: exp.date,
    paymentMethod: exp.paymentMethod || 'UPI / Cash',
    notes: exp.notes || '',
  }));

  return JSON.stringify(formattedData, null, 2);
};
