import { useQuery } from '@tanstack/react-query';
import { updateProvider } from './update.provider';
import type { UpdateCheckResult } from './update.types';

export const updateKeys = {
  check: (version: string, buildNumber: number) =>
    ['app', 'update-check', version, buildNumber] as const,
};

/**
 * React Query hook to check for available updates.
 *
 * @param currentVersion Current version string (e.g. "1.0.0")
 * @param currentBuildNumber Current build number (versionCode)
 * @param enabled Set to false to disable verification (e.g. in dev)
 */
export const useUpdateCheck = (
  currentVersion: string,
  currentBuildNumber: number,
  enabled = true
) =>
  useQuery<UpdateCheckResult>({
    queryKey: updateKeys.check(currentVersion, currentBuildNumber),
    queryFn: () => updateProvider.checkForUpdate(currentVersion, currentBuildNumber),
    enabled: enabled && !!currentVersion,
    staleTime: 30 * 60 * 1000, // cache update check results for 30 minutes
    refetchOnWindowFocus: true, // triggers check when the app returns from background
    retry: 1,
  });
export { updateProvider };
export type { UpdateCheckResult } from './update.types';
