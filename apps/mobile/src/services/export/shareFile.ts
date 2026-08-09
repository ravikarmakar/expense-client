import { Alert } from 'react-native';
import * as Sharing from 'expo-sharing';

/**
 * Share the exported file using the native share sheet.
 * The user can choose to save to Google Drive, WhatsApp, email, etc.
 * Requires a file:// URI (not content://).
 */
export const shareExportFile = async (
  fileUri: string,
  mimeType: string,
  fileName?: string
): Promise<boolean> => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Sharing Unavailable', 'File sharing is not supported on this device.');
      return false;
    }

    await Sharing.shareAsync(fileUri, {
      mimeType,
      dialogTitle: `Share ${fileName || 'Export File'}`,
      UTI: mimeType,
    });
    return true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Could not share file';
    Alert.alert('Share Failed', msg);
    return false;
  }
};

/**
 * Open the exported file using the native share sheet (same as share on Expo).
 * Android will show app chooser for the file type (Excel, PDF viewer, etc.)
 */
export const openExportFile = async (
  fileUri: string,
  mimeType: string,
  fileName?: string
): Promise<boolean> => {
  return shareExportFile(fileUri, mimeType, fileName);
};
