/**
 * Type-safe environment variables validation helper.
 * Ready for future configuration variables (e.g. API keys, base URLs).
 */

const requiredPublicEnv = ['NEXT_PUBLIC_API_URL'] as const;

export const env = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;

// Validate setup in server-side contexts
if (typeof window === 'undefined') {
  const missing: string[] = [];

  for (const key of requiredPublicEnv) {
    if (!process.env[key] && !env[key as keyof typeof env]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.warn(
      `[Environment Warning]: Missing expected environment variables: ${missing.join(', ')}`
    );
  }
}
