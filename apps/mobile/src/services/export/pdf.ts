import * as Print from 'expo-print';
import { ExpenseExportItem, ExportSummary } from './types';

export const calculateSummary = (expenses: ExpenseExportItem[]): ExportSummary => {
  if (expenses.length === 0) {
    return {
      totalExpenses: 0,
      transactionCount: 0,
      highestExpense: 0,
      lowestExpense: 0,
      averageExpense: 0,
    };
  }

  const amounts = expenses.map((e) => e.amount);
  const total = amounts.reduce((sum, val) => sum + val, 0);
  const highest = Math.max(...amounts);
  const lowest = Math.min(...amounts);
  const average = total / expenses.length;

  return {
    totalExpenses: total,
    transactionCount: expenses.length,
    highestExpense: highest,
    lowestExpense: lowest,
    averageExpense: average,
  };
};

export const generatePdfReport = async (
  expenses: ExpenseExportItem[],
  periodLabel: string,
  userName = 'Valued User'
): Promise<string> => {
  const summary = calculateSummary(expenses);
  const generatedDateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Personal Expenses Report</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 32px;
            color: #191c1d;
            background-color: #ffffff;
          }
          .header-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #006948;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .app-logo {
            font-size: 22px;
            font-weight: 800;
            color: #006948;
            letter-spacing: -0.5px;
          }
          .report-title {
            font-size: 20px;
            font-weight: 700;
            color: #191c1d;
            margin: 0 0 4px 0;
          }
          .meta-info {
            font-size: 12px;
            color: #5b645e;
            margin: 0;
          }
          .summary-card {
            background-color: #f4f6f4;
            border-radius: 12px;
            padding: 18px;
            margin-bottom: 28px;
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            justify-content: space-between;
          }
          .summary-item {
            flex: 1;
            min-width: 120px;
          }
          .summary-label {
            font-size: 11px;
            font-weight: 700;
            color: #5b645e;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          .summary-value {
            font-size: 18px;
            font-weight: 800;
            color: #006948;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            font-size: 12px;
          }
          th, td {
            border-bottom: 1px solid #e1e3e0;
            padding: 10px 12px;
            text-align: left;
          }
          th {
            background-color: #006948;
            color: #ffffff;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
          }
          tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          .amount-col {
            text-align: right;
            font-weight: 700;
          }
          .footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #e1e3e0;
            text-align: center;
            font-size: 11px;
            color: #8c938e;
          }
        </style>
      </head>
      <body>
        <div class="header-bar">
          <div>
            <div class="app-logo">💳 SplitShare Expense Tracker</div>
            <div class="report-title">Personal Expenses Report</div>
          </div>
          <div style="text-align: right;">
            <p class="meta-info">User: <strong>${userName}</strong></p>
            <p class="meta-info">Period: <strong>${periodLabel}</strong></p>
            <p class="meta-info">Date: ${generatedDateStr}</p>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-item">
            <div class="summary-label">Total Expenses</div>
            <div class="summary-value">₹${summary.totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Transactions</div>
            <div class="summary-value">${summary.transactionCount}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Highest Expense</div>
            <div class="summary-value">₹${summary.highestExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Lowest Expense</div>
            <div class="summary-value">₹${summary.lowestExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Average Expense</div>
            <div class="summary-value">₹${summary.averageExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Payment Method</th>
              <th class="amount-col">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${expenses
              .map(
                (exp) => `
              <tr>
                <td>${new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td>${exp.category || 'Other'}</td>
                <td>${exp.title}</td>
                <td>${exp.paymentMethod || 'UPI / Cash'}</td>
                <td class="amount-col">₹${exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="footer">
          Generated by SplitShare Expense App • Confidential Personal Report
        </div>
      </body>
    </html>
  `;

  // Print to PDF file via expo-print
  const { uri } = await Print.printToFileAsync({
    html: htmlContent,
  });

  return uri;
};
