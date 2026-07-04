/**
 * Shape of the response returned after comparing versions.
 */
export interface UpdateCheckResult {
  /** True if a newer version exists in the release channel */
  updateAvailable: boolean;
  /** True if this is a critical/mandatory update */
  forceUpdate: boolean;
  /** The current installed version of the app */
  currentVersion: string;
  /** The latest version version available on the server */
  latestVersion: string;
  /** The build number (versionCode) of the latest release */
  latestBuildNumber: number;
  /** The URL to trigger the APK download */
  apkUrl: string;
  /** Size of the APK file in bytes */
  apkSizeBytes: number;
  /** Release notes detailing changes in the new version */
  releaseNotes: string[];
  /** ISO timestamp of the release date */
  releasedAt: string;
}

/**
 * Abstraction interface for checking app updates.
 * Implement this interface to change update sources (R2, Firebase, App Store)
 * without affecting UI layouts or screen components.
 */
export interface UpdateProvider {
  /**
   * Compares current app version metadata with the latest release.
   * @param currentVersion Installed version string (e.g. "1.0.0")
   * @param currentBuildNumber Installed build number (e.g. 1)
   */
  checkForUpdate(currentVersion: string, currentBuildNumber: number): Promise<UpdateCheckResult>;

  /**
   * Returns the endpoint where the APK download can be initiated (for analytics redirection).
   */
  getDownloadUrl(): string;
}
