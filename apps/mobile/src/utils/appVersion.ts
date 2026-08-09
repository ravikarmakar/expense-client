import * as Application from 'expo-application';
import Constants from 'expo-constants';

/**
 * Industry-standard app version helper for Expo / React Native apps.
 * Safely resolves the project's app.json version ("2.0.1") first, bypassing
 * Expo Go sandbox container versioning ("54.0.8").
 */
export const getAppVersionInfo = () => {
  // 1. Prefer project configuration from app.json / Constants.expoConfig (e.g., "2.0.1")
  // 2. Fall back to Application.nativeApplicationVersion for custom standalone builds
  const version = Constants.expoConfig?.version || Application.nativeApplicationVersion || '2.0.1';

  // 3. Resolve build code (android versionCode or ios buildNumber), falling back to '1'
  const build =
    Constants.expoConfig?.android?.versionCode?.toString() ||
    Constants.expoConfig?.ios?.buildNumber ||
    (Application.nativeBuildVersion && Application.nativeBuildVersion !== '417'
      ? Application.nativeBuildVersion
      : '1');

  const formattedVersion = version.startsWith('v') ? version : `v${version}`;

  return {
    version,
    build,
    displayString: `${formattedVersion} (Build ${build})`,
    shortDisplay: formattedVersion,
  };
};
