import { NativeModule, requireOptionalNativeModule } from 'expo-modules-core';
import { SaveToDownloadsOptions } from './AndroidDownloads.types';

declare class AndroidDownloadsModuleNative extends NativeModule {
  saveToDownloads(options: SaveToDownloadsOptions): Promise<string>;
}

export default requireOptionalNativeModule<AndroidDownloadsModuleNative>('AndroidDownloads');
