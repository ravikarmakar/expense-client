'use client';

import React, { useState } from 'react';

// Shared branding color definitions matching the mobile application
const COLORS = {
  background: '#07090e',
  surface: '#0f131a',
  surfaceCard: '#151b26',
  primary: '#00a870', // Vibrant emerald green for web
  primaryFixed: '#85f8c4',
  onPrimaryFixedVariant: '#005137',
  secondary: '#6366f1', // Indigo accent
  secondaryFixed: '#e2dfff',
  tertiary: '#f59e0b', // Amber accent
  tertiaryFixed: '#ffddb8',
  onSurface: '#f3f4f6',
  onSurfaceVariant: '#9ca3af',
  outline: '#4b5563',
  outlineVariant: '#374151',
  error: '#ef4444',
  errorContainer: '#fee2e2',
  onErrorContainer: '#991b1b',
  surfaceContainer: '#1f2937',
  surfaceContainerHigh: '#374151',
  surfaceContainerLow: '#111827',
};

// Avatars matching the design guidelines
const avatars = {
  womanWithGlasses:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDAU839kCrt_d__s6wCW1BquK-tXeEDRc3jq90beQIb8YuHwa1t8qJIdlW_nRP4xZXMAf-RPK1r1WCvIriCrYoh7gDBmXeWj6IsFkTnHti3XOIlkBdEiKGaAfj8xQmc9atuJWNEIpV3FZVipCO-n4n20v3ak-KwrRf3ZDuGqzOgvyt8Sipy2WVUuSPvpvu4N9t1z_sBaG3QGT9S81DmGdK9h4xZ6T_Zd6hoM_fT1PL7KGxhALDK9C_mgcJQcFBG3YCL_Kv1rQMNnAfX',
  fintechMan:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD5T5AJUovvhA_WnRPgEHHUebHGXF5_1EiHG95y-QfKq2nOO07Mu6O3nzSp4AjHOG8hjAGd0Le9T3VMsQ554EcRvn-FBqlSpjy3oLYsJUgXfzsRNskrMk9B58aBpvnyrr9dunlwrQ3t-uLtHtQ5AeVKOCn-64fTFblLeVHlXrsHWRLrpvOIYhhnMeriv4c4aLSPUpLcih10KZ6yXzN32ixRZd3TUiAozHsESLzxhXawBgffwZTpUF4UXguT6m8ijF1N9kQL0fwVx9xM',
  groupLaugh:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB8OeW6SCZ9iaJP1S0BtPntjELgjQnKPmd1O-E6ApVGkFBSRfT2d92dSkScE08EEYkyiNg2nhBsS2IOOKT0NJgw1hegtfA4t2Q8XwMB3DPUv_GAGQsJvQm6lufUWvyQw1kI4bGDmoB5euQuzSvWZ3fGs3UQUSp_K3Q444DPua5FMyn1SBLwrIxD9hLseaYWaXhvciDpZm-ZIR_ayJiH9x52PjjSUuqUCl3uVI86jlzRcXOc9rznXPr2mZP8vshtznTBIxjYq4mHlTZU',
  minimalistWoman:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD6erY7eCAowHNemv8kHNZ_vU5EVoghv6bEahNN2ZFDlCYFIfvuePAZl5yb31uMy56UQCM6nBMW6_FOqk84q_Nv5fEp5UATPm-f8ejLczRho3hGQIMxIEWPHKKAaLNLsjrEZi4rK8JcgYdi27Xo_HiXNlD20AC-goE8m6y1gLPn_CEEhkuqCD-71w_y4XtHss8QtnMx6qMDwQqxrCwCLEQJAxOOIVeEZ3WYI10uWcE_ljnALx7a20kjycg31rpNk1PCVNK7kYVie-eX',
};

export default function HomePage() {
  const [simulatedTab, setSimulatedTab] = useState<'home' | 'groups' | 'activity' | 'settings'>(
    'home'
  );
  const [calcAmount, setCalcAmount] = useState<string>('120');
  const [calcPeople, setCalcPeople] = useState<number>(3);
  const [calcSplitType, setCalcSplitType] = useState<'equal' | 'unequal'>('equal');

  const splitResult =
    parseFloat(calcAmount) > 0 ? (parseFloat(calcAmount) / calcPeople).toFixed(2) : '0.00';

  const renderSimulatedMobileScreen = () => {
    switch (simulatedTab) {
      case 'home':
        return (
          <div style={styles.simScreenContainer}>
            {/* Greeting */}
            <div style={styles.simGreeting}>
              <span
                style={{
                  fontSize: '10px',
                  color: COLORS.onSurfaceVariant,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Good Morning,
              </span>
              <h4 style={{ margin: '2px 0 0 0', fontSize: '20px', fontWeight: 'bold' }}>
                Alexander
              </h4>
            </div>

            {/* Balance Card */}
            <div style={styles.simBalanceCard}>
              <div
                style={{
                  fontSize: '10px',
                  opacity: 0.8,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                Total Net Balance
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '4px 0 12px 0' }}>
                $1,248.50
              </div>
              <div
                style={{
                  height: '1px',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  margin: '8px 0',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '9px', opacity: 0.7 }}>Owed to you</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>$1,890.00</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '9px', opacity: 0.7 }}>You owe</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>$641.50</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: '16px' }}>
              <div style={styles.simSectionHeader}>Quick Actions</div>
              <div
                style={{ display: 'flex', gap: '8px', overflowX: 'hidden', paddingBottom: '4px' }}
              >
                <div style={styles.simQuickAction}>
                  <div style={styles.simQuickIcon}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '18px', color: COLORS.primary }}
                    >
                      document_scanner
                    </span>
                  </div>
                  <span style={styles.simQuickLabel}>Scan</span>
                </div>
                <div style={{ ...styles.simQuickAction, opacity: 0.9 }}>
                  <div style={{ ...styles.simQuickIcon, backgroundColor: COLORS.secondary }}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '18px', color: '#fff' }}
                    >
                      add
                    </span>
                  </div>
                  <span style={styles.simQuickLabel}>Add</span>
                </div>
                <div style={styles.simQuickAction}>
                  <div style={styles.simQuickIcon}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '18px', color: COLORS.secondary }}
                    >
                      payments
                    </span>
                  </div>
                  <span style={styles.simQuickLabel}>Settle</span>
                </div>
                <div style={styles.simQuickAction}>
                  <div style={styles.simQuickIcon}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '18px', color: COLORS.tertiary }}
                    >
                      call_split
                    </span>
                  </div>
                  <span style={styles.simQuickLabel}>Split</span>
                </div>
              </div>
            </div>

            {/* Active Groups */}
            <div style={{ marginBottom: '16px' }}>
              <div style={styles.simSectionHeader}>Active Groups</div>
              <div style={styles.simCard}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '-6px' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatars.womanWithGlasses} style={styles.simOverlapAvatar} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatars.fintechMan}
                      style={{ ...styles.simOverlapAvatar, marginLeft: '-8px' }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 'bold',
                      color: COLORS.primary,
                      backgroundColor: 'rgba(0,168,112,0.1)',
                      padding: '2px 6px',
                      borderRadius: '8px',
                    }}
                  >
                    Owed $120
                  </span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Europe Trip 2024</div>
                <div style={{ fontSize: '10px', color: COLORS.onSurfaceVariant, marginTop: '2px' }}>
                  Last activity: Yesterday
                </div>
              </div>
            </div>
          </div>
        );
      case 'groups':
        return (
          <div style={styles.simScreenContainer}>
            <div style={styles.simTabTitleRow}>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>My Groups</h4>
              <button style={styles.simAddGroupBtn}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '14px', color: '#fff' }}
                >
                  add
                </span>
                <span style={{ fontSize: '10px', fontWeight: '600' }}>New</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <div style={{ ...styles.simCard, flex: 1, padding: '10px' }}>
                <span style={{ fontSize: '8px', color: COLORS.onSurfaceVariant }}>Owed to you</span>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: COLORS.primary }}>
                  $1,890.00
                </div>
              </div>
              <div style={{ ...styles.simCard, flex: 1, padding: '10px' }}>
                <span style={{ fontSize: '8px', color: COLORS.onSurfaceVariant }}>You owe</span>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: COLORS.error }}>
                  $641.50
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={styles.simCard}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Europe Trip 2024</span>
                  <span style={{ fontSize: '9px', color: COLORS.primary, fontWeight: 'bold' }}>
                    Owed $120
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: COLORS.onSurfaceVariant, marginTop: '4px' }}>
                  Flight tickets split • 5 members
                </div>
              </div>
              <div style={styles.simCard}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Roommates Office</span>
                  <span style={{ fontSize: '9px', color: COLORS.error, fontWeight: 'bold' }}>
                    You owe $42
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: COLORS.onSurfaceVariant, marginTop: '4px' }}>
                  Electricity bill due tomorrow
                </div>
              </div>
              <div style={styles.simCard}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Friday Dinners</span>
                  <span
                    style={{ fontSize: '9px', color: COLORS.onSurfaceVariant, fontWeight: 'bold' }}
                  >
                    Settled
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: COLORS.onSurfaceVariant, marginTop: '4px' }}>
                  All expenses split settled up
                </div>
              </div>
            </div>
          </div>
        );
      case 'activity':
        return (
          <div style={styles.simScreenContainer}>
            <div style={styles.simTabTitleRow}>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Recent Activity</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={styles.simActivityRow}>
                <div style={{ ...styles.simActivityIcon, backgroundColor: 'rgba(99,102,241,0.1)' }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '16px', color: COLORS.secondary }}
                  >
                    shopping_cart
                  </span>
                </div>
                <div style={{ flex: 1, marginLeft: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                    {'Marcus added "Groceries"'}
                  </div>
                  <div style={{ fontSize: '9px', color: COLORS.onSurfaceVariant }}>
                    Europe Trip • 2h ago
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold' }}>$85.40</div>
                  <div style={{ fontSize: '9px', color: COLORS.primary, fontWeight: 'bold' }}>
                    +$21.35
                  </div>
                </div>
              </div>

              <div style={styles.simActivityRow}>
                <div style={{ ...styles.simActivityIcon, backgroundColor: 'rgba(0,168,112,0.1)' }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '16px', color: COLORS.primary }}
                  >
                    done_all
                  </span>
                </div>
                <div style={{ flex: 1, marginLeft: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Sarah settled up</div>
                  <div style={{ fontSize: '9px', color: COLORS.onSurfaceVariant }}>
                    Dinner Friday • 5h ago
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold' }}>$45.00</div>
                  <div style={{ fontSize: '9px', color: COLORS.onSurfaceVariant }}>Received</div>
                </div>
              </div>

              <div style={styles.simActivityRow}>
                <div style={{ ...styles.simActivityIcon, backgroundColor: 'rgba(245,158,11,0.1)' }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '16px', color: COLORS.tertiary }}
                  >
                    electric_bolt
                  </span>
                </div>
                <div style={{ flex: 1, marginLeft: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold' }}>New bill from PG&E</div>
                  <div style={{ fontSize: '9px', color: COLORS.onSurfaceVariant }}>
                    House • 1d ago
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: COLORS.error }}>
                    $212.00
                  </div>
                  <div style={{ fontSize: '9px', color: COLORS.error, fontWeight: 'bold' }}>
                    Unsplit
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div style={styles.simScreenContainer}>
            <div style={styles.simProfileHeader}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatars.fintechMan}
                style={{ width: '48px', height: '48px', borderRadius: '24px', marginBottom: '8px' }}
              />
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Alexander Wright</div>
              <div style={{ fontSize: '9px', color: COLORS.onSurfaceVariant }}>
                alexander.wright@splitshare.com
              </div>
            </div>

            <div style={{ ...styles.simCard, padding: '0 8px' }}>
              <div style={styles.simSettingsItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '16px', color: COLORS.onSurfaceVariant }}
                  >
                    person
                  </span>
                  <span style={{ fontSize: '12px' }}>Personal Info</span>
                </div>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '14px', color: COLORS.outline }}
                >
                  chevron_forward
                </span>
              </div>
              <div style={styles.simSettingsItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '16px', color: COLORS.onSurfaceVariant }}
                  >
                    credit_card
                  </span>
                  <span style={{ fontSize: '12px' }}>Payment Methods</span>
                </div>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '14px', color: COLORS.outline }}
                >
                  chevron_forward
                </span>
              </div>
              <div style={{ ...styles.simSettingsItem, borderBottom: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '16px', color: COLORS.onSurfaceVariant }}
                  >
                    notifications
                  </span>
                  <span style={{ fontSize: '12px' }}>Notifications</span>
                </div>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '14px', color: COLORS.outline }}
                >
                  chevron_forward
                </span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={styles.landingPage}>
      {/* Header / Navbar */}
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '28px', color: COLORS.primary }}
          >
            account_balance_wallet
          </span>
          <span style={styles.logoText}>SplitShare</span>
        </div>
        <nav style={styles.navLinks}>
          <a href="#features" style={styles.navLink}>
            Features
          </a>
          <a href="#preview" style={styles.navLink}>
            Interactive Preview
          </a>
          <a href="#calculator" style={styles.navLink}>
            Split Calculator
          </a>
          <a href="#download" style={styles.downloadBtn}>
            Download App
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroLayout}>
          <div style={styles.heroTextCol}>
            <div style={styles.heroTag}>✨ Unified Expenses Platform</div>
            <h1 style={styles.heroTitle}>
              Group Expenses,
              <br />
              Settle Up,
              <br />
              <span style={{ color: COLORS.primary }}>No Stress.</span>
            </h1>
            <p style={styles.heroSubtitle}>
              The premium finance app designed to split expenses for roommates, trips, and nights
              out. Scan physical receipts, track live balances, and settle debts instantly.
            </p>

            {/* Store Download CTA */}
            <div style={styles.storeCtaRow}>
              <a href="#download" style={styles.storeBadge}>
                <div style={styles.storeBadgeIcon}>🍏</div>
                <div style={{ textAlign: 'left' }}>
                  <span
                    style={{
                      fontSize: '9px',
                      color: '#9cb3ff',
                      textTransform: 'uppercase',
                      display: 'block',
                      fontWeight: '600',
                    }}
                  >
                    Download on the
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>
                    App Store
                  </span>
                </div>
              </a>
              <a href="#download" style={styles.storeBadge}>
                <div style={styles.storeBadgeIcon}>🤖</div>
                <div style={{ textAlign: 'left' }}>
                  <span
                    style={{
                      fontSize: '9px',
                      color: '#85f8c4',
                      textTransform: 'uppercase',
                      display: 'block',
                      fontWeight: '600',
                    }}
                  >
                    Get it on
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>
                    Google Play
                  </span>
                </div>
              </a>
            </div>

            <div style={styles.heroMetrics}>
              <div style={styles.metricItem}>
                <span style={styles.metricVal}>4.9★</span>
                <span style={styles.metricLabel}>App rating</span>
              </div>
              <div style={styles.dividerVertical} />
              <div style={styles.metricItem}>
                <span style={styles.metricVal}>10M+</span>
                <span style={styles.metricLabel}>Transactions split</span>
              </div>
            </div>
          </div>

          {/* Interactive Simulator Column */}
          <div style={styles.heroSimCol} id="preview">
            <div style={styles.phoneOuterShadow} />
            <div style={styles.phoneContainer}>
              {/* Ear Speaker Speaker / Camera cutout */}
              <div style={styles.phoneSpeaker} />

              {/* Phone Status Bar */}
              <div style={styles.phoneStatusBar}>
                <span style={{ fontSize: '10px', fontWeight: 'bold' }}>9:41</span>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                    signal_cellular_4_bar
                  </span>
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                    wifi
                  </span>
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                    battery_full
                  </span>
                </div>
              </div>

              {/* Top bar */}
              <div style={styles.simTopBar}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '16px', color: COLORS.primary }}
                  >
                    account_balance_wallet
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: COLORS.primary }}>
                    SplitShare
                  </span>
                </div>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '18px', color: COLORS.onSurfaceVariant }}
                >
                  notifications
                </span>
              </div>

              {/* Screen Body */}
              <div style={styles.simScreenBody}>{renderSimulatedMobileScreen()}</div>

              {/* Bottom Nav Bar */}
              <div style={styles.simBottomNav}>
                <button
                  style={{
                    ...styles.simNavItem,
                    color: simulatedTab === 'home' ? COLORS.secondary : COLORS.outline,
                  }}
                  onClick={() => setSimulatedTab('home')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    home
                  </span>
                  <span style={styles.simNavText}>Home</span>
                </button>
                <button
                  style={{
                    ...styles.simNavItem,
                    color: simulatedTab === 'groups' ? COLORS.secondary : COLORS.outline,
                  }}
                  onClick={() => setSimulatedTab('groups')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    group
                  </span>
                  <span style={styles.simNavText}>Groups</span>
                </button>
                <button
                  style={{
                    ...styles.simNavItem,
                    color: simulatedTab === 'activity' ? COLORS.secondary : COLORS.outline,
                  }}
                  onClick={() => setSimulatedTab('activity')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    receipt_long
                  </span>
                  <span style={styles.simNavText}>Activity</span>
                </button>
                <button
                  style={{
                    ...styles.simNavItem,
                    color: simulatedTab === 'settings' ? COLORS.secondary : COLORS.outline,
                  }}
                  onClick={() => setSimulatedTab('settings')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    settings
                  </span>
                  <span style={styles.simNavText}>Settings</span>
                </button>
              </div>
            </div>
            <div style={styles.simTip}>
              💡 Tap the navigation bar items to preview different mobile tabs live!
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section style={styles.featuresSection} id="features">
        <div style={styles.sectionHeaderCol}>
          <span style={styles.sectionTag}>Features</span>
          <h2 style={styles.sectionTitleText}>Tailored for Social Sharing</h2>
          <p style={styles.sectionSubtitleText}>
            Everything you need to eliminate debt awkwardness and track split expenses.
          </p>
        </div>

        <div style={styles.featuresGrid}>
          {/* Feature 1 */}
          <div style={styles.featureCard}>
            <div style={{ ...styles.featureIconContainer, backgroundColor: 'rgba(0,168,112,0.1)' }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '28px', color: COLORS.primary }}
              >
                document_scanner
              </span>
            </div>
            <h3 style={styles.featureTitle}>AI Receipt Scanner</h3>
            <p style={styles.featureDesc}>
              Just take a photo of your paper receipt. Our smart layout parser scans the lines,
              matches taxes, and allocates amounts to different users in seconds.
            </p>
          </div>

          {/* Feature 2 */}
          <div style={styles.featureCard}>
            <div
              style={{ ...styles.featureIconContainer, backgroundColor: 'rgba(99,102,241,0.1)' }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '28px', color: COLORS.secondary }}
              >
                group
              </span>
            </div>
            <h3 style={styles.featureTitle}>Group Consolidation</h3>
            <p style={styles.featureDesc}>
              Set up dedicated groups for roommate bills, vacations, or dinners. SplitShare tracks
              who paid for what and consolidates it all into a single net balance.
            </p>
          </div>

          {/* Feature 3 */}
          <div style={styles.featureCard}>
            <div
              style={{ ...styles.featureIconContainer, backgroundColor: 'rgba(245,158,11,0.1)' }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '28px', color: COLORS.tertiary }}
              >
                bolt
              </span>
            </div>
            <h3 style={styles.featureTitle}>Instant Settle Up</h3>
            <p style={styles.featureDesc}>
              Ready to settle balances? Pay directly inside the app with integrated secure gateways,
              or log manual cash transactions to wipe the slate clean.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Bill Splitting Calculator */}
      <section style={styles.calculatorSection} id="calculator">
        <div style={styles.calcLayout}>
          <div style={styles.calcCopyCol}>
            <span style={styles.sectionTag}>Try it Live</span>
            <h2 style={styles.sectionTitleText}>Calculate splits instantly</h2>
            <p
              style={{ ...styles.sectionSubtitleText, textAlign: 'left', margin: '12px 0 24px 0' }}
            >
              Want to see how simple it is? Enter any bill details here to see how SplitShare
              calculates shares in real-time.
            </p>
            <div style={styles.calcSummaryCard}>
              <span
                style={{
                  fontSize: '13px',
                  color: COLORS.onSurfaceVariant,
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                Each person owes:
              </span>
              <span style={{ fontSize: '36px', fontWeight: 'bold', color: COLORS.primary }}>
                ${splitResult}
              </span>
              <p style={{ fontSize: '11px', color: COLORS.onSurfaceVariant, margin: '8px 0 0 0' }}>
                *Calculated using{' '}
                {calcSplitType === 'equal' ? 'Equal splitting' : 'custom split profiles'}. Settle
                with one click in-app.
              </p>
            </div>
          </div>

          <div style={styles.calcCardContainer}>
            <div style={styles.calcInputGroup}>
              <label style={styles.calcLabel}>Bill Amount ($)</label>
              <input
                type="number"
                value={calcAmount}
                onChange={(e) => setCalcAmount(e.target.value)}
                style={styles.calcInput}
                placeholder="0.00"
              />
            </div>

            <div style={styles.calcInputGroup}>
              <label style={styles.calcLabel}>Split Between ({calcPeople} people)</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => setCalcPeople((prev) => Math.max(2, prev - 1))}
                  style={styles.calcAdjustBtn}
                >
                  -
                </button>
                <span
                  style={{ fontSize: '16px', fontWeight: 'bold', flex: 1, textAlign: 'center' }}
                >
                  {calcPeople}
                </span>
                <button
                  onClick={() => setCalcPeople((prev) => Math.min(20, prev + 1))}
                  style={styles.calcAdjustBtn}
                >
                  +
                </button>
              </div>
            </div>

            <div style={styles.calcInputGroup}>
              <label style={styles.calcLabel}>Splitting Method</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setCalcSplitType('equal')}
                  style={{
                    ...styles.calcToggleBtn,
                    backgroundColor: calcSplitType === 'equal' ? COLORS.secondary : 'transparent',
                    borderColor: calcSplitType === 'equal' ? COLORS.secondary : COLORS.outline,
                  }}
                >
                  Equally
                </button>
                <button
                  onClick={() => setCalcSplitType('unequal')}
                  style={{
                    ...styles.calcToggleBtn,
                    backgroundColor: calcSplitType === 'unequal' ? COLORS.secondary : 'transparent',
                    borderColor: calcSplitType === 'unequal' ? COLORS.secondary : COLORS.outline,
                  }}
                >
                  Weighted (60/40)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section style={styles.downloadSection} id="download">
        <div style={styles.downloadBgGradient} />
        <h2 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 12px 0' }}>
          Get SplitShare today
        </h2>
        <p
          style={{
            color: COLORS.onSurfaceVariant,
            fontSize: '15px',
            maxWidth: '500px',
            margin: '0 auto 32px auto',
            lineHeight: '1.6',
          }}
        >
          Stop worrying about group expenses and spreadsheets. Settle up effortlessly with friends,
          roommates, and travel buddies.
        </p>

        <div style={{ ...styles.storeCtaRow, justifyContent: 'center' }}>
          <a
            href="#"
            style={styles.storeBadge}
            onClick={(e) => {
              e.preventDefault();
              alert('SplitShare iOS App downloading...');
            }}
          >
            <div style={styles.storeBadgeIcon}>🍏</div>
            <div style={{ textAlign: 'left' }}>
              <span
                style={{
                  fontSize: '9px',
                  color: '#9cb3ff',
                  textTransform: 'uppercase',
                  display: 'block',
                  fontWeight: '600',
                }}
              >
                Download on the
              </span>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>App Store</span>
            </div>
          </a>
          <a
            href="#"
            style={styles.storeBadge}
            onClick={(e) => {
              e.preventDefault();
              alert('SplitShare Android App downloading...');
            }}
          >
            <div style={styles.storeBadgeIcon}>🤖</div>
            <div style={{ textAlign: 'left' }}>
              <span
                style={{
                  fontSize: '9px',
                  color: '#85f8c4',
                  textTransform: 'uppercase',
                  display: 'block',
                  fontWeight: '600',
                }}
              >
                Get it on
              </span>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>
                Google Play
              </span>
            </div>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerTop}>
          <div style={styles.logoContainer}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '22px', color: COLORS.primary }}
            >
              account_balance_wallet
            </span>
            <span style={{ ...styles.logoText, fontSize: '16px' }}>SplitShare</span>
          </div>
          <span style={{ fontSize: '13px', color: COLORS.onSurfaceVariant }}>
            © 2026 SplitShare Inc. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  landingPage: {
    backgroundColor: COLORS.background,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative' as const,
  },
  header: {
    height: '72px',
    padding: '0 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1px solid ${COLORS.outlineVariant}`,
    backgroundColor: 'rgba(7, 9, 14, 0.8)',
    backdropFilter: 'blur(12px)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-0.5px',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  navLink: {
    color: COLORS.onSurfaceVariant,
    fontSize: '14px',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'color 0.2s',
    cursor: 'pointer',
  },
  downloadBtn: {
    backgroundColor: COLORS.primary,
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 12px rgba(0, 168, 112, 0.2)',
  },
  heroSection: {
    padding: '80px 40px 100px 40px',
    display: 'flex',
    justifyContent: 'center',
    position: 'relative' as const,
    borderBottom: `1px solid ${COLORS.outlineVariant}`,
  },
  heroLayout: {
    maxWidth: '1200px',
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '64px',
    alignItems: 'center',
  },
  heroTextCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  heroTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    color: COLORS.secondary,
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    marginBottom: '16px',
    letterSpacing: '0.5px',
  },
  heroTitle: {
    fontSize: '54px',
    fontWeight: '900',
    lineHeight: '1.15',
    color: '#ffffff',
    margin: '0 0 20px 0',
    letterSpacing: '-1.5px',
  },
  heroSubtitle: {
    fontSize: '18px',
    lineHeight: '1.6',
    color: COLORS.onSurfaceVariant,
    margin: '0 0 32px 0',
    maxWidth: '520px',
  },
  storeCtaRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '48px',
  },
  storeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: COLORS.surfaceCard,
    border: `1px solid ${COLORS.outlineVariant}`,
    padding: '10px 20px',
    borderRadius: '16px',
    textDecoration: 'none',
    transition: 'transform 0.2s, border-color 0.2s',
  },
  storeBadgeIcon: {
    fontSize: '24px',
  },
  heroMetrics: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  metricVal: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#ffffff',
  },
  metricLabel: {
    fontSize: '12px',
    color: COLORS.onSurfaceVariant,
  },
  dividerVertical: {
    width: '1px',
    height: '32px',
    backgroundColor: COLORS.outlineVariant,
  },
  heroSimCol: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
  },
  phoneOuterShadow: {
    position: 'absolute' as const,
    width: '280px',
    height: '560px',
    borderRadius: '40px',
    backgroundColor: COLORS.secondary,
    opacity: 0.15,
    filter: 'blur(40px)',
    zIndex: 1,
  },
  phoneContainer: {
    width: '300px',
    height: '600px',
    backgroundColor: '#000000',
    borderRadius: '44px',
    border: '10px solid #222530',
    overflow: 'hidden',
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
    zIndex: 2,
  },
  phoneSpeaker: {
    width: '100px',
    height: '24px',
    backgroundColor: '#222530',
    position: 'absolute' as const,
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    borderBottomLeftRadius: '16px',
    borderBottomRightRadius: '16px',
    zIndex: 10,
  },
  phoneStatusBar: {
    height: '36px',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: COLORS.onSurface,
    backgroundColor: COLORS.background,
    paddingTop: '6px',
  },
  simTopBar: {
    height: '44px',
    padding: '0 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderBottom: '1px solid #1c2331',
  },
  simScreenBody: {
    flex: 1,
    backgroundColor: COLORS.background,
    overflowY: 'auto' as const,
  },
  simScreenContainer: {
    padding: '16px',
  },
  simGreeting: {
    marginBottom: 16,
  },
  simBalanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: '16px',
    padding: '16px',
    color: '#ffffff',
    marginBottom: '20px',
  },
  simSectionHeader: {
    fontSize: '9px',
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px',
  },
  simCard: {
    backgroundColor: COLORS.surfaceCard,
    border: '1px solid #1f2937',
    borderRadius: '16px',
    padding: '12px',
    color: '#ffffff',
  },
  simOverlapAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '12px',
    border: '2px solid #07090e',
  },
  simQuickAction: {
    flex: 1,
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  simQuickIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    backgroundColor: COLORS.surfaceCard,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
    border: '1px solid #1f2937',
  },
  simQuickLabel: {
    fontSize: '9px',
    color: COLORS.onSurfaceVariant,
  },
  simTabTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  simAddGroupBtn: {
    backgroundColor: COLORS.secondary,
    border: 'none',
    borderRadius: '8px',
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    cursor: 'pointer',
  },
  simActivityRow: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceCard,
    borderRadius: '12px',
    padding: '8px 12px',
    border: '1px solid #1f2937',
  },
  simActivityIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simProfileHeader: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column' as const,
    marginBottom: '16px',
    paddingTop: '8px',
  },
  simSettingsItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #1f2937',
  },
  simBottomNav: {
    height: '56px',
    borderTop: '1px solid #1c2331',
    backgroundColor: '#0c0f17',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  simNavItem: {
    backgroundColor: 'transparent',
    border: 'none',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    cursor: 'pointer',
  },
  simNavText: {
    fontSize: '8px',
    marginTop: '2px',
    fontWeight: '600',
  },
  simTip: {
    fontSize: '13px',
    color: COLORS.onSurfaceVariant,
    marginTop: '16px',
    fontStyle: 'italic',
  },
  featuresSection: {
    padding: '100px 40px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    borderBottom: `1px solid ${COLORS.outlineVariant}`,
  },
  sectionHeaderCol: {
    textAlign: 'center',
    marginBottom: '64px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  sectionTag: {
    color: COLORS.primary,
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: '8px',
  },
  sectionTitleText: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 12px 0',
    letterSpacing: '-0.5px',
  },
  sectionSubtitleText: {
    fontSize: '16px',
    color: COLORS.onSurfaceVariant,
    maxWidth: '560px',
    margin: 0,
    lineHeight: '1.5',
    textAlign: 'center',
  },
  featuresGrid: {
    maxWidth: '1200px',
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  },
  featureCard: {
    backgroundColor: COLORS.surface,
    border: `1px solid ${COLORS.outlineVariant}`,
    borderRadius: '24px',
    padding: '32px',
    transition: 'transform 0.2s, border-color 0.2s',
  },
  featureIconContainer: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  featureTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 12px 0',
  },
  featureDesc: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: COLORS.onSurfaceVariant,
    margin: 0,
  },
  calculatorSection: {
    padding: '100px 40px',
    display: 'flex',
    justifyContent: 'center',
    borderBottom: `1px solid ${COLORS.outlineVariant}`,
    backgroundColor: 'rgba(99, 102, 241, 0.02)',
  },
  calcLayout: {
    maxWidth: '1000px',
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '64px',
    alignItems: 'center',
  },
  calcCopyCol: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
  },
  calcSummaryCard: {
    backgroundColor: COLORS.surfaceCard,
    border: `1px solid ${COLORS.outlineVariant}`,
    borderRadius: '20px',
    padding: '24px',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  calcCardContainer: {
    backgroundColor: COLORS.surface,
    border: `1px solid ${COLORS.outlineVariant}`,
    borderRadius: '24px',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  calcInputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  calcLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  calcInput: {
    backgroundColor: COLORS.surfaceCard,
    border: `1px solid ${COLORS.outline}`,
    borderRadius: '12px',
    padding: '12px',
    fontSize: '16px',
    color: '#ffffff',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  calcAdjustBtn: {
    backgroundColor: COLORS.surfaceCard,
    border: `1px solid ${COLORS.outline}`,
    borderRadius: '12px',
    width: '44px',
    height: '44px',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#ffffff',
    cursor: 'pointer',
  },
  calcToggleBtn: {
    flex: 1,
    border: '1px solid',
    borderRadius: '12px',
    padding: '12px',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  downloadSection: {
    padding: '120px 40px',
    textAlign: 'center' as const,
    position: 'relative' as const,
    overflow: 'hidden' as const,
    borderBottom: `1px solid ${COLORS.outlineVariant}`,
  },
  downloadBgGradient: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '320px',
    height: '320px',
    borderRadius: '160px',
    backgroundColor: COLORS.primary,
    opacity: 0.1,
    filter: 'blur(80px)',
  },
  footer: {
    padding: '40px',
    borderTop: `1px solid ${COLORS.outlineVariant}`,
    backgroundColor: '#0c0f17',
  },
  footerTop: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
};
