import AndroidDownloadsModule from './src/AndroidDownloadsModule';
import { SaveToDownloadsOptions } from './src/AndroidDownloads.types';

export * from './src/AndroidDownloads.types';

export function isAndroidDownloadsAvailable(): boolean {
  return Boolean(AndroidDownloadsModule && AndroidDownloadsModule.saveToDownloads);
}

export async function saveToDownloads(options: SaveToDownloadsOptions): Promise<string> {
  if (!isAndroidDownloadsAvailable()) {
    throw new Error('AndroidDownloads native module is not available in this build.');
  }
  return await AndroidDownloadsModule!.saveToDownloads(options);
}
