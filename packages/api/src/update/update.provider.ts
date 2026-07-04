import { getApiClient } from '../client';
import type { UpdateProvider, UpdateCheckResult } from './update.types';

/**
 * Compares two semver version strings (e.g. "1.0.1" and "1.0.0").
 * Returns:
 *   - 1 if v1 > v2
 *   - -1 if v1 < v2
 *   - 0 if they are equal
 */
export function compareSemver(v1: string, v2: string): number {
  const parts1 = v1.split('.').map((x) => parseInt(x, 10) || 0);
  const parts2 = v2.split('.').map((x) => parseInt(x, 10) || 0);

  // Pad to 3 parts (major, minor, patch)
  while (parts1.length < 3) parts1.push(0);
  while (parts2.length < 3) parts2.push(0);

  for (let i = 0; i < 3; i++) {
    if (parts1[i] > parts2[i]) return 1;
    if (parts1[i] < parts2[i]) return -1;
  }

  return 0;
}

export class R2UpdateProvider implements UpdateProvider {
  async checkForUpdate(
    currentVersion: string,
    currentBuildNumber: number
  ): Promise<UpdateCheckResult> {
    const client = getApiClient();

    // Call the public version metadata endpoint on expense-server
    const response = await client.get('/version', {
      timeout: 10_000, // 10s timeout specific to update checking
    });

    const latest = response.data.data;
    if (!latest) {
      throw new Error('Invalid version response from server');
    }

    const latestVersion = latest.version;
    const latestBuildNumber = latest.buildNumber;
    const minVersion = latest.minVersion || '0.0.0';
    const forceUpdateFlag = !!latest.forceUpdate;

    // Check if an update is available:
    // 1. Semver is higher, OR
    // 2. Semver is identical but buildNumber (versionCode) is higher
    const semverComparison = compareSemver(latestVersion, currentVersion);
    const updateAvailable =
      semverComparison > 0 || (semverComparison === 0 && latestBuildNumber > currentBuildNumber);

    // Force update triggers if:
    // 1. The latest release is marked as forced, OR
    // 2. The user's current version is below the minimum supported version
    const forceUpdate =
      updateAvailable && (forceUpdateFlag || compareSemver(currentVersion, minVersion) < 0);

    return {
      updateAvailable,
      forceUpdate,
      currentVersion,
      latestVersion,
      latestBuildNumber,
      apkUrl: this.getDownloadUrl(),
      apkSizeBytes: latest.apkSizeBytes || 0,
      releaseNotes: latest.releaseNotes || [],
      releasedAt: latest.releasedAt || new Date().toISOString(),
    };
  }

  getDownloadUrl(): string {
    const client = getApiClient();
    // Resolves to e.g. "https://expense-server.ravikarmkar.workers.dev/download/latest"
    const baseURL = client.defaults.baseURL || '';
    // If base URL ends with /api (Better Auth routing compatibility), adjust accordingly
    const cleanBaseURL = baseURL.endsWith('/api') ? baseURL.slice(0, -4) : baseURL;
    return `${cleanBaseURL}/download/latest`;
  }
}

export const updateProvider: UpdateProvider = new R2UpdateProvider();
