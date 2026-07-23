'use client';

import React, { useState, useEffect } from 'react';
import { env } from '../../env';

import Link from 'next/link';

// Colors matching the main landing page theme
const COLORS = {
  background: '#07090e',
  surface: '#0f131a',
  surfaceCard: '#151b26',
  primary: '#00a870', // Vibrant emerald green
  secondary: '#6366f1', // Indigo accent
  onSurface: '#f3f4f6',
  onSurfaceVariant: '#9ca3af',
  outline: '#4b5563',
  outlineVariant: '#374151',
};

interface VersionManifest {
  version: string;
  buildNumber: number;
  forceUpdate: boolean;
  minVersion: string;
  apkUrl: string;
  apkSizeBytes: number;
  sha256: string;
  releaseNotes: string[];
  releasedAt: string;
}

export default function DownloadPage() {
  const [latestManifest, setLatestManifest] = useState<VersionManifest | null>(null);
  const [releases, setReleases] = useState<VersionManifest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedChecksum, setCopiedChecksum] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        // Fetch latest version
        const latestRes = await fetch(`${env.NEXT_PUBLIC_API_URL}/version`);
        if (!latestRes.ok) throw new Error('Failed to load version manifest');
        const latestJson = await latestRes.json();
        setLatestManifest(latestJson.data);

        // Fetch release history
        const historyRes = await fetch(`${env.NEXT_PUBLIC_API_URL}/version/releases`);
        if (historyRes.ok) {
          const historyJson = await historyRes.json();
          setReleases(historyJson.data.releases || []);
        }
      } catch (err) {
        console.error('Error fetching version data:', err);
        setError('Failed to fetch release information. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const formatSize = (bytes: number) => {
    if (!bytes) return 'Unknown Size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChecksum(true);
    setTimeout(() => setCopiedChecksum(false), 2000);
  };

  // The download URL is routed through the analytics endpoint on the backend
  const downloadUrl = `${env.NEXT_PUBLIC_API_URL}/download/latest`;

  return (
    <div style={styles.downloadPage}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoContainer} onClick={() => (window.location.href = '/')}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '28px', color: COLORS.primary, cursor: 'pointer' }}
          >
            account_balance_wallet
          </span>
          <span style={styles.logoText}>SplitShare</span>
        </div>
        <nav style={styles.navLinks}>
          <Link href="/" style={styles.navLink}>
            Back to Home
          </Link>
        </nav>
      </header>

      {/* Main Container */}
      <main className="download-container" style={styles.container}>
        {isLoading ? (
          <div style={styles.loaderContainer}>
            <div style={styles.spinner}></div>
            <p style={{ color: COLORS.onSurfaceVariant }}>Loading latest releases...</p>
          </div>
        ) : error ? (
          <div style={styles.errorContainer}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '48px', color: '#ef4444' }}
            >
              error
            </span>
            <h2 style={{ marginTop: '16px' }}>Connection Issue</h2>
            <p style={{ color: COLORS.onSurfaceVariant, margin: '8px 0 24px 0' }}>{error}</p>
            <button style={styles.primaryBtn} onClick={() => window.location.reload()}>
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="download-content-layout" style={styles.contentLayout}>
            {/* Left Column: CTA & Details */}
            <div style={styles.infoCol}>
              <div style={styles.badge}>🚀 Production Ready</div>
              <h1 className="download-page-title" style={styles.pageTitle}>
                Get SplitShare for Android
              </h1>
              <p style={styles.pageSubtitle}>
                Download the standalone package directly to your Android device to start splitting,
                tracking, and settling shared expenses without Play Store limitations.
              </p>

              {/* Install guide */}
              <div style={styles.guideCard}>
                <h3 style={styles.cardSectionTitle}>Installation Instructions</h3>
                <div style={styles.step}>
                  <span style={styles.stepNumber}>1</span>
                  <p style={styles.stepText}>
                    Tap the <strong>Download APK</strong> button to retrieve the installer package.
                  </p>
                </div>
                <div style={styles.step}>
                  <span style={styles.stepNumber}>2</span>
                  <p style={styles.stepText}>
                    Open the downloaded `.apk` file. If prompted, enable{' '}
                    <strong>Install from Unknown Sources</strong> in your device system settings.
                  </p>
                </div>
                <div style={styles.step}>
                  <span style={styles.stepNumber}>3</span>
                  <p style={styles.stepText}>
                    Complete the on-screen installer prompts, open SplitShare, and log in.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Download Card & Notes */}
            <div style={styles.downloadCol}>
              {latestManifest && (
                <div style={styles.downloadCard}>
                  <div style={styles.cardHeader}>
                    <div>
                      <h2 style={styles.versionTitle}>v{latestManifest.version}</h2>
                      <span style={styles.releaseDate}>
                        Released on {formatDate(latestManifest.releasedAt)}
                      </span>
                    </div>
                    <span style={styles.sizeBadge}>{formatSize(latestManifest.apkSizeBytes)}</span>
                  </div>

                  <a href={downloadUrl} style={styles.primaryBtn}>
                    <span className="material-symbols-outlined" style={{ marginRight: '8px' }}>
                      download
                    </span>
                    Download latest APK
                  </a>

                  {/* Checksum info */}
                  <div style={styles.checksumBox}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={styles.checksumLabel}>SHA-256 Checksum</span>
                      <button
                        onClick={() => copyToClipboard(latestManifest.sha256)}
                        style={styles.copyBtn}
                        title="Copy SHA-256 to clipboard"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          {copiedChecksum ? 'done' : 'content_copy'}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 'bold' }}>
                          {copiedChecksum ? 'Copied' : 'Copy'}
                        </span>
                      </button>
                    </div>
                    <code style={styles.checksumValue}>{latestManifest.sha256}</code>
                  </div>

                  {/* Release Notes */}
                  {latestManifest.releaseNotes && latestManifest.releaseNotes.length > 0 && (
                    <div style={styles.notesBox}>
                      <h3 style={styles.notesBoxTitle}>{"What's New:"}</h3>
                      <ul style={styles.notesList}>
                        {latestManifest.releaseNotes.map((note, index) => (
                          <li key={index} style={styles.noteItem}>
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Version History (Only show up to 2 previous releases, 3 total including latest) */}
              {releases.length > 1 && (
                <div style={styles.historyCard}>
                  <h3 style={styles.cardSectionTitle}>Version History</h3>
                  <div style={styles.historyList}>
                    {releases.slice(1, 3).map((release, index) => (
                      <div key={index} style={styles.historyRow}>
                        <div>
                          <div
                            style={{
                              fontWeight: 'bold',
                              fontSize: '14px',
                              color: COLORS.onSurface,
                            }}
                          >
                            v{release.version}
                          </div>
                          <div
                            style={{
                              fontSize: '11px',
                              color: COLORS.onSurfaceVariant,
                              marginTop: '2px',
                            }}
                          >
                            {formatDate(release.releasedAt)}
                          </div>
                        </div>
                        <a
                          href={`${env.NEXT_PUBLIC_API_URL}/download/latest`} // Point to main download flow
                          style={styles.historyDownloadLink}
                          onClick={(e) => {
                            // Redirect to versioned URL if wanting specific old version,
                            // otherwise redirect to redirect api
                            e.preventDefault();
                            window.location.href = release.apkUrl;
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            download
                          </span>
                          <span>{formatSize(release.apkSizeBytes)}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  downloadPage: {
    backgroundColor: COLORS.background,
    minHeight: '100vh',
    color: COLORS.onSurface,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 8%',
    borderBottom: `1px solid ${COLORS.outlineVariant}`,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: 'bold',
    letterSpacing: '-0.5px',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
  },
  navLink: {
    color: COLORS.onSurfaceVariant,
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'color 0.2s',
  },
  container: {
    padding: '60px 8%',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 0',
    gap: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: `3px solid ${COLORS.outlineVariant}`,
    borderTopColor: COLORS.primary,
    animation: 'spin 1s linear infinite',
  },
  errorContainer: {
    textAlign: 'center' as const,
    maxWidth: '400px',
    margin: '40px auto',
    padding: '32px',
    backgroundColor: COLORS.surface,
    borderRadius: '24px',
    border: `1px solid ${COLORS.outlineVariant}`,
  },
  contentLayout: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '64px',
    alignItems: 'start',
  },
  infoCol: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 168, 112, 0.1)',
    color: COLORS.primary,
    padding: '6px 12px',
    borderRadius: '30px',
    fontSize: '12px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  pageTitle: {
    fontSize: '44px',
    fontWeight: '800',
    lineHeight: '1.2',
    letterSpacing: '-1px',
    marginBottom: '20px',
  },
  pageSubtitle: {
    color: COLORS.onSurfaceVariant,
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '40px',
  },
  guideCard: {
    backgroundColor: COLORS.surface,
    padding: '28px',
    borderRadius: '24px',
    border: `1px solid ${COLORS.outlineVariant}`,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  cardSectionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: COLORS.onSurface,
    marginBottom: '4px',
  },
  step: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },
  stepNumber: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    color: COLORS.secondary,
    width: '28px',
    height: '28px',
    borderRadius: '14px',
    fontSize: '13px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  stepText: {
    fontSize: '14px',
    color: COLORS.onSurfaceVariant,
    lineHeight: '1.5',
    margin: 0,
  },
  downloadCol: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  downloadCard: {
    backgroundColor: COLORS.surface,
    padding: '32px',
    borderRadius: '28px',
    border: `1px solid ${COLORS.outlineVariant}`,
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  versionTitle: {
    fontSize: '28px',
    fontWeight: '800',
    margin: 0,
  },
  releaseDate: {
    fontSize: '12px',
    color: COLORS.onSurfaceVariant,
    display: 'block',
    marginTop: '4px',
  },
  sizeBadge: {
    backgroundColor: COLORS.outlineVariant,
    color: COLORS.onSurface,
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    color: '#ffffff',
    textDecoration: 'none',
    width: '100%',
    height: '56px',
    borderRadius: '28px',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  checksumBox: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: '16px',
    padding: '16px',
    marginTop: '20px',
    border: `1px solid ${COLORS.outlineVariant}`,
  },
  checksumLabel: {
    fontSize: '11px',
    color: COLORS.onSurfaceVariant,
    fontWeight: 'bold',
  },
  copyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'transparent',
    border: 'none',
    color: COLORS.primary,
    cursor: 'pointer',
    padding: '2px 6px',
    borderRadius: '6px',
  },
  checksumValue: {
    display: 'block',
    fontSize: '11px',
    color: COLORS.onSurface,
    wordBreak: 'break-all' as const,
    marginTop: '8px',
    fontFamily: 'monospace',
    padding: '8px',
    backgroundColor: '#0c0f14',
    borderRadius: '8px',
  },
  notesBox: {
    marginTop: '24px',
  },
  notesBoxTitle: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: COLORS.onSurface,
    marginBottom: '8px',
  },
  notesList: {
    margin: 0,
    paddingLeft: '18px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  noteItem: {
    fontSize: '13px',
    color: COLORS.onSurfaceVariant,
    lineHeight: '1.4',
  },
  historyCard: {
    backgroundColor: COLORS.surface,
    padding: '24px',
    borderRadius: '24px',
    border: `1px solid ${COLORS.outlineVariant}`,
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    marginTop: '16px',
  },
  historyRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '16px',
    borderBottom: `1px solid ${COLORS.outlineVariant}`,
  },
  historyDownloadLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: COLORS.secondary,
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: 'bold',
  },
};
