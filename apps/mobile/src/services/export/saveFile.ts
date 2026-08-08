import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { ExportFormat, ExportResult } from './types';

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

interface FileSystemExtended {
  StorageAccessFramework?: {
    requestDirectoryPermissionsAsync: (
      initialUri?: string
    ) => Promise<{ granted: boolean; directoryUri: string }>;
    createFileAsync: (directoryUri: string, fileName: string, mimeType: string) => Promise<string>;
  };
  documentDirectory?: string;
  cacheDirectory?: string;
  EncodingType?: { UTF8: string; Base64: string };
  writeAsStringAsync?: (
    uri: string,
    contents: string,
    options?: { encoding?: string }
  ) => Promise<void>;
  getInfoAsync?: (uri: string) => Promise<{ exists: boolean; size?: number; uri: string }>;
}

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

export const getFileName = (format: ExportFormat, dateRangeStr: string): string => {
  const todayStr = new Date().toISOString().split('T')[0];
  const extensionMap: Record<ExportFormat, string> = {
    pdf: 'pdf',
    excel: 'xlsx',
    csv: 'csv',
    json: 'json',
  };
  return `Expenses_${dateRangeStr}_${todayStr}.${extensionMap[format]}`;
};

export const saveExportFile = async (
  fileContentOrUri: string,
  format: ExportFormat,
  dateRangeStr: string,
  isBase64 = false
): Promise<ExportResult> => {
  const fileName = getFileName(format, dateRangeStr);
  const mimeType = getMimeType(format);
  const fs = FileSystem as unknown as FileSystemExtended;

  // 1. WEB ENVIRONMENT
  if (Platform.OS === 'web') {
    try {
      if (format === 'pdf' && fileContentOrUri.startsWith('file://')) {
        // If generated via expo-print
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
        displayPath: `Downloads/${fileName}`,
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to download file in browser',
      };
    }
  }

  // 2. ANDROID ENVIRONMENT (Storage Access Framework or Cache + Verification)
  if (Platform.OS === 'android') {
    try {
      // If pdf file generated via expo-print URI
      if (
        format === 'pdf' &&
        (fileContentOrUri.startsWith('file://') || fileContentOrUri.startsWith('content://'))
      ) {
        if (fs.getInfoAsync) {
          const info = await fs.getInfoAsync(fileContentOrUri);
          if (info.exists) {
            return {
              success: true,
              fileUri: fileContentOrUri,
              fileName,
              mimeType,
              displayPath: `Downloads/${fileName}`,
            };
          }
        }
      }

      // Try Storage Access Framework (SAF) for public Downloads directory
      if (fs.StorageAccessFramework && fs.writeAsStringAsync) {
        try {
          const permissions = await fs.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (permissions.granted) {
            const createdUri = await fs.StorageAccessFramework.createFileAsync(
              permissions.directoryUri,
              fileName,
              mimeType
            );
            const encoding = isBase64
              ? fs.EncodingType?.Base64 || 'base64'
              : fs.EncodingType?.UTF8 || 'utf8';

            await fs.writeAsStringAsync(createdUri, fileContentOrUri, { encoding });

            // Verify file exists
            if (fs.getInfoAsync) {
              const info = await fs.getInfoAsync(createdUri);
              if (!info.exists) {
                throw new Error('File verification failed after SAF write');
              }
            }

            return {
              success: true,
              fileUri: createdUri,
              fileName,
              mimeType,
              displayPath: `Downloads/${fileName}`,
            };
          }
        } catch {
          // Fallback to cache/document directory if SAF permission was dismissed
        }
      }

      // Fallback: Save to Local Device App Cache / Document Directory
      const targetDir = fs.cacheDirectory || fs.documentDirectory;
      if (!targetDir || !fs.writeAsStringAsync) {
        return {
          success: false,
          error: 'Mobile device storage is unavailable',
        };
      }

      const fileUri = `${targetDir}${fileName}`;
      const encoding = isBase64
        ? fs.EncodingType?.Base64 || 'base64'
        : fs.EncodingType?.UTF8 || 'utf8';

      await fs.writeAsStringAsync(fileUri, fileContentOrUri, { encoding });

      // Verify existence
      if (fs.getInfoAsync) {
        const info = await fs.getInfoAsync(fileUri);
        if (!info.exists) {
          return {
            success: false,
            error: 'File verification failed after writing to device storage',
          };
        }
      }

      return {
        success: true,
        fileUri,
        fileName,
        mimeType,
        displayPath: `Downloads/${fileName}`,
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Android storage save failed',
      };
    }
  }

  // 3. IOS ENVIRONMENT
  try {
    const targetDir = fs.documentDirectory || fs.cacheDirectory;
    if (!targetDir || !fs.writeAsStringAsync) {
      return {
        success: false,
        error: 'iOS device storage is unavailable',
      };
    }

    const fileUri = `${targetDir}${fileName}`;
    const encoding = isBase64
      ? fs.EncodingType?.Base64 || 'base64'
      : fs.EncodingType?.UTF8 || 'utf8';

    await fs.writeAsStringAsync(fileUri, fileContentOrUri, { encoding });

    if (fs.getInfoAsync) {
      const info = await fs.getInfoAsync(fileUri);
      if (!info.exists) {
        return {
          success: false,
          error: 'File verification failed on iOS storage',
        };
      }
    }

    return {
      success: true,
      fileUri,
      fileName,
      mimeType,
      displayPath: `Documents/${fileName}`,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'iOS storage save failed',
    };
  }
};
