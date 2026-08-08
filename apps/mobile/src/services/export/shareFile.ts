import { Alert } from 'react-native';
import * as Sharing from 'expo-sharing';

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
    });
    return true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Could not share file';
    Alert.alert('Sharing Notice', msg);
    return false;
  }
};

export const openExportFile = async (
  fileUri: string,
  mimeType: string,
  fileName?: string
): Promise<boolean> => {
  return shareExportFile(fileUri, mimeType, fileName);
};
