import React from 'react';
import { Alert, Platform } from 'react-native';
import {
  ExportDateRange,
  ExportFormat,
  ExpenseExportItem,
  ExportResult,
  ExportContext,
} from '../services/export/types';
import { generatePdfReport } from '../services/export/pdf';
import { generateExcelWorkbook } from '../services/export/excel';
import { generateCsvContent } from '../services/export/csv';
import { generateJsonContent } from '../services/export/json';
import { saveExportFile, getSubfolderName } from '../services/export/saveFile';
import { shareExportFile, openExportFile } from '../services/export/shareFile';
import {
  saveToAndroidDownloads,
  isAndroidDownloadsAvailable,
} from '../services/export/androidDownloadService';

export const getDateRangeLabelText = (
  range: ExportDateRange,
  startDate?: Date,
  endDate?: Date
): string => {
  switch (range) {
    case 'last-7-days':
      return 'Last 7 Days';
    case 'last-30-days':
      return 'Last 30 Days';
    case 'last-3-months':
      return 'Last 3 Months';
    case 'custom':
      if (startDate && endDate) {
        return `${startDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
      }
      return 'Custom Range';
    default:
      return 'All Time';
  }
};

export const filterExpensesByRange = (
  expenses: ExpenseExportItem[],
  range: ExportDateRange,
  customStart?: Date,
  customEnd?: Date
): ExpenseExportItem[] => {
  const now = new Date();
  let start = new Date(0);
  let end = new Date();

  if (range === 'last-7-days') {
    start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    end = now;
  } else if (range === 'last-30-days') {
    start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    end = now;
  } else if (range === 'last-3-months') {
    start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    end = now;
  } else if (range === 'custom' && customStart && customEnd) {
    start = new Date(customStart);
    start.setHours(0, 0, 0, 0);
    end = new Date(customEnd);
    end.setHours(23, 59, 59, 999);
  }

  return expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    return expDate >= start && expDate <= end;
  });
};

export const useExport = () => {
  const [exportModalVisible, setExportModalVisible] = React.useState(false);
  const [successModalVisible, setSuccessModalVisible] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<ExportDateRange>('last-30-days');
  const [customStartDate, setCustomStartDate] = React.useState<Date>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );
  const [customEndDate, setCustomEndDate] = React.useState<Date>(new Date());
  const [format, setFormat] = React.useState<ExportFormat>('pdf');
  const [, setActiveContext] = React.useState<ExportContext>('personal');

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [progressMessage, setProgressMessage] = React.useState('');
  const [exportResult, setExportResult] = React.useState<ExportResult | null>(null);

  const executeExport = async (
    allExpenses: ExpenseExportItem[],
    userName = 'User',
    context: ExportContext = 'personal'
  ) => {
    setActiveContext(context);
    setExportModalVisible(false);
    setIsGenerating(true);
    setProgressMessage('Filtering expense records...');
    setExportResult(null);

    try {
      const filteredExpenses = filterExpensesByRange(
        allExpenses,
        dateRange,
        customStartDate,
        customEndDate
      );

      if (filteredExpenses.length === 0) {
        setIsGenerating(false);
        Alert.alert(
          'No Expenses Found',
          'There are no expenses in the selected date range to export.'
        );
        return;
      }

      const periodLabel = getDateRangeLabelText(dateRange, customStartDate, customEndDate);
      let contentOrUri = '';
      let isBase64 = false;

      if (format === 'pdf') {
        setProgressMessage('Generating PDF report...');
        contentOrUri = await generatePdfReport(filteredExpenses, periodLabel, userName);
      } else if (format === 'excel') {
        setProgressMessage('Building Excel workbook...');
        contentOrUri = generateExcelWorkbook(filteredExpenses);
        isBase64 = true;
      } else if (format === 'csv') {
        setProgressMessage('Formatting CSV data...');
        contentOrUri = generateCsvContent(filteredExpenses);
      } else if (format === 'json') {
        setProgressMessage('Formatting JSON document...');
        contentOrUri = generateJsonContent(filteredExpenses);
      }

      const subFolder = getSubfolderName(context);
      setProgressMessage(`Saving to SplitShare / ${subFolder}...`);

      // Save file cleanly to device storage
      const result = await saveExportFile(contentOrUri, format, dateRange, isBase64, context);

      setIsGenerating(false);

      if (result.success) {
        setExportResult(result);
        setSuccessModalVisible(true);
      } else {
        Alert.alert('Export Failed', result.error || 'Could not save file to device storage.');
      }
    } catch (err: unknown) {
      setIsGenerating(false);
      const msg = err instanceof Error ? err.message : 'Export process failed';
      Alert.alert('Export Failed', msg);
    }
  };

  /**
   * Open the exported file via native viewer / Excel / PDF app
   */
  const handleOpenFile = async () => {
    if (exportResult?.fileUri && exportResult.mimeType) {
      await openExportFile(exportResult.fileUri, exportResult.mimeType, exportResult.fileName);
    }
  };

  /**
   * Share the exported file via native share sheet
   */
  const handleShareFile = async () => {
    if (exportResult?.fileUri && exportResult.mimeType) {
      await shareExportFile(exportResult.fileUri, exportResult.mimeType, exportResult.fileName);
    }
  };

  /**
   * Save file directly to phone storage folder without SAF picker
   */
  const handleSaveToDownloads = async () => {
    if (!exportResult?.fileUri || !exportResult.mimeType) return;

    if (Platform.OS === 'android') {
      if (!isAndroidDownloadsAvailable()) {
        Alert.alert(
          'Dev Build Required ℹ️',
          'Direct auto-saving to Internal Storage/Download/SplitShare/Transactions/ requires an Expo Development Build (npx expo run:android).\n\nOpening share option so you can save or view the file now...',
          [
            {
              text: 'OK',
              onPress: () => {
                if (exportResult.fileUri && exportResult.mimeType) {
                  shareExportFile(
                    exportResult.fileUri,
                    exportResult.mimeType,
                    exportResult.fileName
                  );
                }
              },
            },
          ]
        );
        return;
      }

      try {
        const mimeType = exportResult.mimeType;
        const fileName = exportResult.fileName || 'export_file';

        await saveToAndroidDownloads({
          sourceUri: exportResult.fileUri,
          fileName,
          mimeType,
          relativePath: 'Download/SplitShare/Transactions/',
        });

        Alert.alert(
          'Saved to Downloads! 💾',
          `${fileName} is saved directly to your phone storage:\n\nInternal Storage/Download/SplitShare/Transactions/`
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Could not save file to storage';
        Alert.alert('Save Failed', msg);
      }
    } else {
      await shareExportFile(exportResult.fileUri, exportResult.mimeType, exportResult.fileName);
    }
  };

  return {
    exportModalVisible,
    setExportModalVisible,
    successModalVisible,
    setSuccessModalVisible,
    dateRange,
    setDateRange,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    format,
    setFormat,
    isGenerating,
    progressMessage,
    exportResult,
    executeExport,
    handleOpenFile,
    handleShareFile,
    handleSaveToDownloads,
  };
};
