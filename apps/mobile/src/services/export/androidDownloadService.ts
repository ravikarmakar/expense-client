import { Platform } from 'react-native';
import {
  saveToDownloads,
  SaveToDownloadsOptions,
  isAndroidDownloadsAvailable as isNativeAvailable,
} from '../../../modules/android-downloads';

export type SaveToAndroidDownloadsOptions = {
  sourceUri: string;
  fileName: string;
  mimeType: string;
  relativePath?: string;
};

export const isAndroidDownloadsAvailable = (): boolean => {
  return Platform.OS === 'android' && isNativeAvailable();
};

export const sanitizeExportFileName = (fileName: string): string => {
  // Strip path traversal and invalid characters
  const clean = fileName.replace(/[\\/:\*?"<>|]/g, '_').replace(/^\.+/, '');
  return clean || `SplitShare_Export_${Date.now()}`;
};

export const saveToAndroidDownloads = async (
  options: SaveToAndroidDownloadsOptions
): Promise<string> => {
  if (Platform.OS !== 'android') {
    throw new Error('saveToAndroidDownloads is only supported on Android devices.');
  }

  const cleanFileName = sanitizeExportFileName(options.fileName);
  const fixedRelativePath = options.relativePath || 'Download/SplitShare/Transactions/';

  const payload: SaveToDownloadsOptions = {
    sourceUri: options.sourceUri,
    fileName: cleanFileName,
    mimeType: options.mimeType,
    relativePath: fixedRelativePath,
  };

  return await saveToDownloads(payload);
};
