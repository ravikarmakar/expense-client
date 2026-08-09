import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { ExportFormat, ExportResult, ExportContext } from './types';
import { saveToAndroidDownloads, isAndroidDownloadsAvailable } from './androidDownloadService';

declare const document: {
  body: {
    appendChild(node: unknown): void;
    removeChild(node: unknown): void;
  };
  createElement(tag: string): {
    href: string;
    download: string;
    click(): void;
    setAttribute(name: string, value: string): void;
  };
};

export const getMimeType = (format: ExportFormat): string => {
  switch (format) {
    case 'pdf':
      return 'application/pdf';
    case 'excel':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'csv':
      return 'text/csv';
    case 'json':
      return 'application/json';
    default:
      return 'application/octet-stream';
  }
};

export const getFileName = (
  format: ExportFormat,
  _dateRangeStr: string,
  context: ExportContext = 'personal'
): string => {
  const todayStr = new Date().toISOString().split('T')[0];
  const extensionMap: Record<ExportFormat, string> = {
    pdf: 'pdf',
    excel: 'xlsx',
    csv: 'csv',
    json: 'json',
  };

  const prefixMap: Record<ExportContext, string> = {
    personal: 'SplitShare_Transactions',
    income: 'SplitShare_Income',
    group: 'SplitShare_Group_Expenses',
    activity: 'SplitShare_Activity',
  };

  const prefix = prefixMap[context] || 'SplitShare_Transactions';
  return `${prefix}_${todayStr}.${extensionMap[format]}`;
};

export const getSubfolderName = (context: ExportContext = 'personal'): string => {
  switch (context) {
    case 'income':
      return 'Income Statements';
    case 'group':
      return 'Group Expenses';
    case 'activity':
      return 'Activity Logs';
    case 'personal':
    default:
      return 'Transactions';
  }
};

/**
 * Save export file into local device storage cleanly & automatically.
 * On Android, uses Android MediaStore.Downloads to save directly to Download/SplitShare/Transactions/
 * without SAF folder picker prompts ("Can't use this folder").
 */
export const saveExportFile = async (
  fileContentOrUri: string,
  format: ExportFormat,
  dateRangeStr: string,
  isBase64 = false,
  context: ExportContext = 'personal'
): Promise<ExportResult> => {
  const fileName = getFileName(format, dateRangeStr, context);
  const mimeType = getMimeType(format);

  // 1. WEB ENVIRONMENT
  if (Platform.OS === 'web') {
    try {
      if (format === 'pdf' && fileContentOrUri.startsWith('file://')) {
        const link = document.createElement('a');
        link.href = fileContentOrUri;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const encodedUri = isBase64
          ? `data:${mimeType};base64,${fileContentOrUri}`
          : `data:${mimeType};charset=utf-8,${encodeURIComponent(fileContentOrUri)}`;

        const link = document.createElement('a');
        link.href = encodedUri;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          try {
            document.body.removeChild(link);
          } catch {
            // ignore
          }
        }, 300);
      }

      return {
        success: true,
        fileName,
        mimeType,
        displayPath: `Download/SplitShare/Transactions/${fileName}`,
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to download file in browser',
      };
    }
  }

  // 2. MOBILE ENVIRONMENT (Android & iOS)
  try {
    const targetDir = FileSystem.documentDirectory;
    if (!targetDir) {
      return {
        success: false,
        error: 'Device storage is unavailable',
      };
    }

    const localFileUri = `${targetDir}${fileName}`;
    const encoding = isBase64 ? FileSystem.EncodingType.Base64 : FileSystem.EncodingType.UTF8;

    // Save temporary local copy for preview / sharing
    if (
      format === 'pdf' &&
      (fileContentOrUri.startsWith('file://') || fileContentOrUri.startsWith('content://'))
    ) {
      await FileSystem.copyAsync({ from: fileContentOrUri, to: localFileUri });
    } else {
      await FileSystem.writeAsStringAsync(localFileUri, fileContentOrUri, { encoding });
    }

    // On Android, save directly to MediaStore Download/SplitShare/Transactions/ if native module is available
    if (isAndroidDownloadsAvailable()) {
      try {
        await saveToAndroidDownloads({
          sourceUri: localFileUri,
          fileName,
          mimeType,
          relativePath: 'Download/SplitShare/Transactions/',
        });
      } catch (nativeErr: unknown) {
        console.warn('Android MediaStore save notice:', nativeErr);
        // Fallback gracefully if native module is unavailable (e.g. running in standard Expo Go)
      }
    }

    return {
      success: true,
      fileUri: localFileUri,
      fileName,
      mimeType,
      displayPath: `Download/SplitShare/Transactions/${fileName}`,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save export file',
    };
  }
};
