'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Curated dark mode design tokens with vibrant neon accents
const COLORS = {
  background: '#07090e',
  surface: '#0f131a',
  surfaceCard: '#151b26',
  surfaceElevated: '#1c2434',
  primary: '#00f5a0', // Vibrant emerald neon
  primaryDark: '#00a870',
  primaryGlow: 'rgba(0, 245, 160, 0.15)',
  secondary: '#6366f1', // Electric Indigo
  secondaryGlow: 'rgba(99, 102, 241, 0.15)',
  tertiary: '#f59e0b', // Amber
  accentPink: '#ec4899', // Pink pulse
  onSurface: '#f3f4f6',
  onSurfaceVariant: '#9ca3af',
  outline: '#374151',
  outlineVariant: 'rgba(255, 255, 255, 0.08)',
  error: '#ef4444',
  success: '#10b981',
};

// Avatars for realistic user demo
const AVATARS = {
  alex: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5T5AJUovvhA_WnRPgEHHUebHGXF5_1EiHG95y-QfKq2nOO07Mu6O3nzSp4AjHOG8hjAGd0Le9T3VMsQ554EcRvn-FBqlSpjy3oLYsJUgXfzsRNskrMk9B58aBpvnyrr9dunlwrQ3t-uLtHtQ5AeVKOCn-64fTFblLeVHlXrsHWRLrpvOIYhhnMeriv4c4aLSPUpLcih10KZ6yXzN32ixRZd3TUiAozHsESLzxhXawBgffwZTpUF4UXguT6m8ijF1N9kQL0fwVx9xM',
  sarah:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDAU839kCrt_d__s6wCW1BquK-tXeEDRc3jq90beQIb8YuHwa1t8qJIdlW_nRP4xZXMAf-RPK1r1WCvIriCrYoh7gDBmXeWj6IsFkTnHti3XOIlkBdEiKGaAfj8xQmc9atuJWNEIpV3FZVipCO-n4n20v3ak-KwrRf3ZDuGqzOgvyt8Sipy2WVUuSPvpvu4N9t1z_sBaG3QGT9S81DmGdK9h4xZ6T_Zd6hoM_fT1PL7KGxhALDK9C_mgcJQcFBG3YCL_Kv1rQMNnAfX',
  marcus:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB8OeW6SCZ9iaJP1S0BtPntjELgjQnKPmd1O-E6ApVGkFBSRfT2d92dSkScE08EEYkyiNg2nhBsS2IOOKT0NJgw1hegtfA4t2Q8XwMB3DPUv_GAGQsJvQm6lufUWvyQw1kI4bGDmoB5euQuzSvWZ3fGs3UQUSp_K3Q444DPua5FMyn1SBLwrIxD9hLseaYWaXhvciDpZm-ZIR_ayJiH9x52PjjSUuqUCl3uVI86jlzRcXOc9rznXPr2mZP8vshtznTBIxjYq4mHlTZU',
  elena:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD6erY7eCAowHNemv8kHNZ_vU5EVoghv6bEahNN2ZFDlCYFIfvuePAZl5yb31uMy56UQCM6nBMW6_FOqk84q_Nv5fEp5UATPm-f8ejLczRho3hGQIMxIEWPHKKAaLNLsjrEZi4rK8JcgYdi27Xo_HiXNlD20AC-goE8m6y1gLPn_CEEhkuqCD-71w_y4XtHss8QtnMx6qMDwQqxrCwCLEQJAxOOIVeEZ3WYI10uWcE_ljnALx7a20kjycg31rpNk1PCVNK7kYVie-eX',
};

// FAQ dataset
const FAQS = [
  {
    q: 'How does SplitShare handle complex group bill splitting?',
    a: 'SplitShare uses a built-in debt simplification algorithm to collapse multi-person debts into the smallest number of direct payments possible, saving everyone money on transfer fees and confusion.',
  },
  {
    q: 'Is receipt OCR scanning available on Android?',
    a: 'Yes! You can snap a photo of any paper receipt or upload an image. Our built-in AI detects total amounts, tax, tip, and individual item line items so you can split items directly with one tap.',
  },
  {
    q: 'Can I install the app directly on my Android device without Play Store?',
    a: 'Absolutely. We provide direct APK installation binaries right here on our website, alongside full Google Play Store support and automated OTA updates.',
  },
  {
    q: 'Can I split bills unequally or by custom percentages?',
    a: 'Yes, SplitShare supports equal splits, exact dollar amounts, custom percentages, or item-by-item splitting for dining out and trips.',
  },
  {
    q: 'Is my financial data safe?',
    a: 'SplitShare uses end-to-end encrypted storage for synced balances, and never stores raw credit card credentials or bank passwords.',
  },
];

export default function HomePage() {
  // State for mobile phone simulator tab
  const [simulatedTab, setSimulatedTab] = useState<
    'home' | 'groups' | 'scan' | 'activity' | 'settings'
  >('home');

  // State for Live AI Receipt Scanner preview
  const [isScanningReceipt, setIsScanningReceipt] = useState(false);

  // State for split calculator
  const [calcAmount, setCalcAmount] = useState<string>('180');
  const [calcPeople, setCalcPeople] = useState<number>(4);
  const [calcSplitType, setCalcSplitType] = useState<'equal' | 'unequal' | 'percentage'>('equal');
  const [calcPreset, setCalcPreset] = useState<'custom' | 'dinner' | 'trip' | 'rent'>('trip');
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // State for FAQ accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Split calculation math
  const numAmount = parseFloat(calcAmount) || 0;
  const perPerson = numAmount > 0 && calcPeople > 0 ? (numAmount / calcPeople).toFixed(2) : '0.00';

  // Handle calculator preset selection
  const applyPreset = (preset: 'dinner' | 'trip' | 'rent') => {
    setCalcPreset(preset);
    if (preset === 'dinner') {
      setCalcAmount('88');
      setCalcPeople(3);
    } else if (preset === 'trip') {
      setCalcAmount('480');
      setCalcPeople(4);
    } else if (preset === 'rent') {
      setCalcAmount('1600');
      setCalcPeople(4);
    }
  };

  // Simulate scanning action
  const handleTriggerScan = () => {
    setIsScanningReceipt(true);
    setTimeout(() => {
      setIsScanningReceipt(false);
    }, 1800);
  };

  // Copy share link animation
  const handleCopyLink = () => {
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2000);
  };

  const renderSimulatedMobileScreen = () => {
    switch (simulatedTab) {
      case 'home':
        return (
          <div style={styles.simScreenContainer}>
            {/* Header / Greeting */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '10px',
                    color: COLORS.onSurfaceVariant,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: '600',
                  }}
                >
                  Good Morning,
                </span>
                <h4
                  style={{
                    margin: '2px 0 0 0',
                    fontSize: '18px',
                    fontWeight: '800',
                    color: '#fff',
                  }}
                >
                  Alexander
                </h4>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={AVATARS.alex}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: `2px solid ${COLORS.primary}`,
                }}
              />
            </div>

            {/* Glowing Net Balance Card */}
            <div style={styles.simBalanceCard}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    opacity: 0.9,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    fontWeight: '700',
                  }}
                >
                  Total Net Balance
                </span>
                <span
                  style={{
                    fontSize: '9px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    padding: '2px 6px',
                    borderRadius: '10px',
                  }}
                >
                  Live Sync ⚡
                </span>
              </div>
              <div
                style={{
                  fontSize: '26px',
                  fontWeight: '900',
                  margin: '6px 0 10px 0',
                  letterSpacing: '-0.5px',
                }}
              >
                +$1,248.50
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
                  <div style={{ fontSize: '9px', opacity: 0.8 }}>Owed to you</div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>
                    $1,890.00
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '9px', opacity: 0.8 }}>You owe</div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#fca5a5' }}>
                    $641.50
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Grid */}
            <div style={{ marginBottom: '16px' }}>
              <div style={styles.simSectionHeader}>Quick Actions</div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                <div
                  style={{ ...styles.simQuickAction, cursor: 'pointer' }}
                  onClick={() => setSimulatedTab('scan')}
                >
                  <div
                    style={{
                      ...styles.simQuickIcon,
                      backgroundColor: COLORS.primaryGlow,
                      borderColor: COLORS.primary,
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '18px', color: COLORS.primary }}
                    >
                      document_scanner
                    </span>
                  </div>
                  <span style={styles.simQuickLabel}>Scan Receipt</span>
                </div>
                <div style={styles.simQuickAction}>
                  <div
                    style={{
                      ...styles.simQuickIcon,
                      backgroundColor: COLORS.secondaryGlow,
                      borderColor: COLORS.secondary,
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '18px', color: COLORS.secondary }}
                    >
                      add_circle
                    </span>
                  </div>
                  <span style={styles.simQuickLabel}>Add Expense</span>
                </div>
                <div style={styles.simQuickAction}>
                  <div
                    style={{
                      ...styles.simQuickIcon,
                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                      borderColor: COLORS.tertiary,
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '18px', color: COLORS.tertiary }}
                    >
                      payments
                    </span>
                  </div>
                  <span style={styles.simQuickLabel}>Settle Debt</span>
                </div>
              </div>
            </div>

            {/* Active Groups Preview */}
            <div>
              <div style={styles.simSectionHeader}>Active Groups</div>
              <div style={{ ...styles.simCard, marginBottom: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={AVATARS.sarah} style={styles.simOverlapAvatar} />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={AVATARS.marcus}
                        style={{ ...styles.simOverlapAvatar, marginLeft: '-8px' }}
                      />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>
                      EuroTrip 2026
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: '800',
                      color: COLORS.primary,
                      backgroundColor: COLORS.primaryGlow,
                      padding: '2px 6px',
                      borderRadius: '8px',
                    }}
                  >
                    +$240.00
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: COLORS.onSurfaceVariant }}>
                  AirBnB & Car Rental • 4 members
                </div>
              </div>

              <div style={styles.simCard}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={AVATARS.elena} style={styles.simOverlapAvatar} />
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>
                      Apartment 4B
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: '800',
                      color: COLORS.error,
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      padding: '2px 6px',
                      borderRadius: '8px',
                    }}
                  >
                    -$42.50
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: COLORS.onSurfaceVariant }}>
                  WiFi & Electricity bill
                </div>
              </div>
            </div>
          </div>
        );

      case 'scan':
        return (
          <div style={styles.simScreenContainer}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#fff' }}>
                AI Receipt Scanner
              </h4>
              <button
                onClick={handleTriggerScan}
                style={{
                  backgroundColor: COLORS.primary,
                  color: '#000',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '4px 10px',
                  fontSize: '10px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                  refresh
                </span>
                Rescan
              </button>
            </div>

            {/* Receipt Preview Container with Scanner Laser */}
            <div
              style={{
                position: 'relative',
                backgroundColor: '#111622',
                borderRadius: '16px',
                padding: '14px',
                border: `1px solid ${COLORS.primary}`,
                overflow: 'hidden',
                marginBottom: '12px',
              }}
            >
              {/* Laser animation bar */}
              {isScanningReceipt && <div className="scan-beam-line" />}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '1px stroke rgba(255,255,255,0.1)',
                  paddingBottom: '8px',
                  marginBottom: '10px',
                }}
              >
                <div>
                  <span
                    style={{ fontSize: '12px', fontWeight: '800', color: '#fff', display: 'block' }}
                  >
                    Le Bistro Restaurant
                  </span>
                  <span style={{ fontSize: '9px', color: COLORS.onSurfaceVariant }}>
                    Receipt #84920 • Today 8:15 PM
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    color: COLORS.primary,
                    backgroundColor: COLORS.primaryGlow,
                    padding: '2px 6px',
                    borderRadius: '6px',
                    height: 'fit-content',
                  }}
                >
                  AI Verified ✨
                </span>
              </div>

              {/* Parsed items */}
              {isScanningReceipt ? (
                <div
                  style={{
                    padding: '20px 0',
                    textAlign: 'center',
                    color: COLORS.primary,
                    fontSize: '11px',
                    fontWeight: '700',
                  }}
                >
                  Analyzing image OCR & line items...
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}
                  >
                    <span style={{ color: '#fff' }}>2x Truffle Pasta</span>
                    <span style={{ fontWeight: '700', color: '#fff' }}>$48.00</span>
                  </div>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}
                  >
                    <span style={{ color: '#fff' }}>1x Artisan Pizza</span>
                    <span style={{ fontWeight: '700', color: '#fff' }}>$24.00</span>
                  </div>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}
                  >
                    <span style={{ color: '#fff' }}>3x Sparkling Water</span>
                    <span style={{ fontWeight: '700', color: '#fff' }}>$12.00</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      borderTop: '1px dashed #2d3748',
                      paddingTop: '6px',
                      marginTop: '4px',
                    }}
                  >
                    <span style={{ color: COLORS.onSurfaceVariant }}>Tax & Service Tip</span>
                    <span style={{ fontWeight: '700', color: COLORS.onSurfaceVariant }}>
                      $16.00
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                      fontWeight: '900',
                      color: COLORS.primary,
                      paddingTop: '4px',
                    }}
                  >
                    <span>Total Expense</span>
                    <span>$100.00</span>
                  </div>
                </div>
              )}
            </div>

            {/* Split action button */}
            <button
              style={{
                width: '100%',
                backgroundColor: COLORS.secondary,
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '10px',
                fontSize: '11px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                call_split
              </span>
              Split $100.00 with 4 Members
            </button>
          </div>
        );

      case 'groups':
        return (
          <div style={styles.simScreenContainer}>
            <div style={styles.simTabTitleRow}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#fff' }}>
                My Groups
              </h4>
              <button style={styles.simAddGroupBtn}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '14px', color: '#fff' }}
                >
                  add
                </span>
                <span style={{ fontSize: '10px', fontWeight: '700' }}>Create</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div style={{ ...styles.simCard, flex: 1, padding: '8px 10px' }}>
                <span
                  style={{
                    fontSize: '8px',
                    color: COLORS.onSurfaceVariant,
                    textTransform: 'uppercase',
                    fontWeight: '700',
                  }}
                >
                  You Owe
                </span>
                <div style={{ fontSize: '13px', fontWeight: '800', color: COLORS.error }}>
                  $641.50
                </div>
              </div>
              <div style={{ ...styles.simCard, flex: 1, padding: '8px 10px' }}>
                <span
                  style={{
                    fontSize: '8px',
                    color: COLORS.onSurfaceVariant,
                    textTransform: 'uppercase',
                    fontWeight: '700',
                  }}
                >
                  Owed to You
                </span>
                <div style={{ fontSize: '13px', fontWeight: '800', color: COLORS.primary }}>
                  $1,890.00
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={styles.simCard}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>
                    Europe Summer Trip
                  </span>
                  <span style={{ fontSize: '9px', color: COLORS.primary, fontWeight: '800' }}>
                    +$240.00
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: COLORS.onSurfaceVariant, marginTop: '2px' }}>
                  5 Members • Flight & Hotels
                </div>
              </div>
              <div style={styles.simCard}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>
                    Roommates Apartment
                  </span>
                  <span style={{ fontSize: '9px', color: COLORS.error, fontWeight: '800' }}>
                    -$42.50
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: COLORS.onSurfaceVariant, marginTop: '2px' }}>
                  3 Members • Rent & Groceries
                </div>
              </div>
              <div style={styles.simCard}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>
                    Weekend Skiing
                  </span>
                  <span
                    style={{ fontSize: '9px', color: COLORS.onSurfaceVariant, fontWeight: '700' }}
                  >
                    Settled
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: COLORS.onSurfaceVariant, marginTop: '2px' }}>
                  4 Members • Resort Lift Pass
                </div>
              </div>
            </div>
          </div>
        );

      case 'activity':
        return (
          <div style={styles.simScreenContainer}>
            <div style={styles.simTabTitleRow}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#fff' }}>
                Recent Activity
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={styles.simActivityRow}>
                <div style={{ ...styles.simActivityIcon, backgroundColor: COLORS.secondaryGlow }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '14px', color: COLORS.secondary }}
                  >
                    shopping_cart
                  </span>
                </div>
                <div style={{ flex: 1, marginLeft: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#fff' }}>
                    Marcus added &quot;Trader Joe&apos;s&quot;
                  </div>
                  <div style={{ fontSize: '8px', color: COLORS.onSurfaceVariant }}>
                    EuroTrip • 10m ago
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#fff' }}>$84.20</div>
                  <div style={{ fontSize: '8px', color: COLORS.primary, fontWeight: '700' }}>
                    +$21.05
                  </div>
                </div>
              </div>

              <div style={styles.simActivityRow}>
                <div style={{ ...styles.simActivityIcon, backgroundColor: COLORS.primaryGlow }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '14px', color: COLORS.primary }}
                  >
                    verified
                  </span>
                </div>
                <div style={{ flex: 1, marginLeft: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#fff' }}>
                    Sarah paid you via UPI
                  </div>
                  <div style={{ fontSize: '8px', color: COLORS.onSurfaceVariant }}>
                    Dinner • 2h ago
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: COLORS.primary }}>
                    +$45.00
                  </div>
                  <div style={{ fontSize: '8px', color: COLORS.onSurfaceVariant }}>Received</div>
                </div>
              </div>

              <div style={styles.simActivityRow}>
                <div
                  style={{ ...styles.simActivityIcon, backgroundColor: 'rgba(245, 158, 11, 0.15)' }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '14px', color: COLORS.tertiary }}
                  >
                    bolt
                  </span>
                </div>
                <div style={{ flex: 1, marginLeft: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#fff' }}>
                    New Electricity Bill
                  </div>
                  <div style={{ fontSize: '8px', color: COLORS.onSurfaceVariant }}>
                    Apartment • 1d ago
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: COLORS.error }}>
                    $120.00
                  </div>
                  <div style={{ fontSize: '8px', color: COLORS.error, fontWeight: '700' }}>
                    Pending
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
                src={AVATARS.alex}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  border: `2px solid ${COLORS.primary}`,
                  marginBottom: '6px',
                }}
              />
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>
                Alexander Wright
              </div>
              <div style={{ fontSize: '9px', color: COLORS.onSurfaceVariant }}>
                alexander@splitshare.com
              </div>
            </div>

            <div style={{ ...styles.simCard, padding: '0 8px' }}>
              <div style={styles.simSettingsItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '14px', color: COLORS.onSurfaceVariant }}
                  >
                    person
                  </span>
                  <span style={{ fontSize: '11px', color: '#fff' }}>Profile & Accounts</span>
                </div>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '12px', color: COLORS.onSurfaceVariant }}
                >
                  chevron_right
                </span>
              </div>
              <div style={styles.simSettingsItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '14px', color: COLORS.onSurfaceVariant }}
                  >
                    qr_code_2
                  </span>
                  <span style={{ fontSize: '11px', color: '#fff' }}>My Payment QR</span>
                </div>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '12px', color: COLORS.onSurfaceVariant }}
                >
                  chevron_right
                </span>
              </div>
              <div style={{ ...styles.simSettingsItem, borderBottom: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '14px', color: COLORS.onSurfaceVariant }}
                  >
                    notifications
                  </span>
                  <span style={{ fontSize: '11px', color: '#fff' }}>Push Reminders</span>
                </div>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '12px', color: COLORS.onSurfaceVariant }}
                >
                  chevron_right
                </span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={styles.landingPage}>
      {/* Background Ambient Glowing Orbs */}
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />
      <div style={styles.bgGridOverlay} />

      {/* Sticky Glass Navbar */}
      <header className="header-container" style={styles.header}>
        <div style={styles.logoContainer}>
          <div style={styles.logoIconBg}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#000' }}>
              account_balance_wallet
            </span>
          </div>
          <span style={styles.logoText}>SplitShare</span>
          <span style={styles.versionBadge}>v2.0</span>
        </div>

        <nav className="desktop-nav-links" style={styles.navLinks}>
          <a href="#features" style={styles.navLink}>
            Features
          </a>
          <a href="#simulator" style={styles.navLink}>
            Live Simulator
          </a>
          <a href="#calculator" style={styles.navLink}>
            Split Calculator
          </a>
          <a href="#testimonials" style={styles.navLink}>
            Wall of Love
          </a>
          <a href="#faq" style={styles.navLink}>
            FAQ
          </a>
          <Link href="/download" className="shimmer-btn" style={styles.downloadBtn}>
            Download APK ⚡
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section" style={styles.heroSection}>
        <div className="hero-layout" style={styles.heroLayout}>
          {/* Left Text Column */}
          <div style={styles.heroTextCol}>
            <div style={styles.heroBadge}>
              <span style={{ fontSize: '12px' }}>✨</span>
              <span>Next-Gen Android Expense Splitting</span>
            </div>

            <h1 className="hero-title" style={styles.heroTitle}>
              Group Expenses, <br />
              Settled <span className="gradient-text">Effortlessly.</span>
            </h1>

            <p style={styles.heroSubtitle}>
              The premium finance app built for roommates, group trips, and dining out. Scan paper
              receipts with AI, simplify complex debts, and settle balances instantly.
            </p>

            {/* Store Download Buttons */}
            <div className="store-cta-row" style={styles.storeCtaRow}>
              <Link
                href="/download"
                className="store-badge glass-card-hover"
                style={{ ...styles.storeBadge, borderColor: COLORS.primary }}
              >
                <div style={{ ...styles.storeBadgeIcon, backgroundColor: COLORS.primaryGlow }}>
                  🤖
                </div>
                <div style={{ textAlign: 'left' }}>
                  <span style={styles.storeBadgeSubtext}>Direct Installer</span>
                  <span style={styles.storeBadgeTitle}>Download APK</span>
                </div>
              </Link>

              <Link
                href="/download"
                className="store-badge glass-card-hover"
                style={styles.storeBadge}
              >
                <div style={{ ...styles.storeBadgeIcon, backgroundColor: COLORS.secondaryGlow }}>
                  ▶️
                </div>
                <div style={{ textAlign: 'left' }}>
                  <span style={styles.storeBadgeSubtext}>Google Play</span>
                  <span style={styles.storeBadgeTitle}>Get on Android</span>
                </div>
              </Link>
            </div>

            {/* Metrics Trust Row */}
            <div className="hero-metrics" style={styles.heroMetrics}>
              <div style={styles.metricItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={styles.metricVal}>4.9</span>
                  <span style={{ color: COLORS.tertiary, fontSize: '18px' }}>★</span>
                </div>
                <span style={styles.metricLabel}>App Store Rating</span>
              </div>
              <div style={styles.dividerVertical} />
              <div style={styles.metricItem}>
                <span style={styles.metricVal}>$12M+</span>
                <span style={styles.metricLabel}>Expenses Split</span>
              </div>
              <div style={styles.dividerVertical} />
              <div style={styles.metricItem}>
                <span style={styles.metricVal}>100%</span>
                <span style={styles.metricLabel}>Free & Encrypted</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Phone Simulator */}
          <div style={styles.heroSimCol} id="simulator">
            <div style={styles.phoneOuterShadow} />

            <div style={styles.phoneContainer}>
              {/* Camera cutout (Android hole-punch) */}
              <div style={styles.phoneCameraPunch} />

              {/* Status Bar */}
              <div style={styles.phoneStatusBar}>
                <span style={{ fontSize: '10px', fontWeight: '800' }}>9:41</span>
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

              {/* Mobile App Header */}
              <div style={styles.simTopBar}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '16px', color: COLORS.primary }}
                  >
                    account_balance_wallet
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '900', color: COLORS.primary }}>
                    SplitShare
                  </span>
                </div>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '16px', color: COLORS.onSurfaceVariant }}
                >
                  notifications
                </span>
              </div>

              {/* Dynamic Screen Content */}
              <div className="custom-scrollbar" style={styles.simScreenBody}>
                {renderSimulatedMobileScreen()}
              </div>

              {/* Bottom Nav Bar */}
              <div style={styles.simBottomNav}>
                <button
                  style={{
                    ...styles.simNavItem,
                    color: simulatedTab === 'home' ? COLORS.primary : COLORS.onSurfaceVariant,
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
                    color: simulatedTab === 'groups' ? COLORS.primary : COLORS.onSurfaceVariant,
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
                    color: simulatedTab === 'scan' ? COLORS.primary : COLORS.onSurfaceVariant,
                  }}
                  onClick={() => setSimulatedTab('scan')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    document_scanner
                  </span>
                  <span style={styles.simNavText}>Scan AI</span>
                </button>
                <button
                  style={{
                    ...styles.simNavItem,
                    color: simulatedTab === 'activity' ? COLORS.primary : COLORS.onSurfaceVariant,
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
                    color: simulatedTab === 'settings' ? COLORS.primary : COLORS.onSurfaceVariant,
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
              💡 <strong>Interactive Demo:</strong> Tap bottom tabs or the Scan button to explore
              live features!
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section className="features-section" style={styles.featuresSection} id="features">
        <div style={styles.sectionHeaderCol}>
          <span style={styles.sectionTag}>Built For Speed & Clarity</span>
          <h2 style={styles.sectionTitleText}>Packed with Next-Gen Features</h2>
          <p style={styles.sectionSubtitleText}>
            Say goodbye to messy spreadsheets, endless calculations, and uncomfortable money
            conversations.
          </p>
        </div>

        <div className="features-grid" style={styles.featuresGrid}>
          {/* Card 1: AI OCR Scanner */}
          <div className="glass-card glass-card-hover" style={styles.bentoCardLarge}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px',
              }}
            >
              <div style={{ ...styles.featureIconContainer, backgroundColor: COLORS.primaryGlow }}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '28px', color: COLORS.primary }}
                >
                  document_scanner
                </span>
              </div>
              <span style={styles.bentoTag}>Popular Feature 🔥</span>
            </div>
            <h3 style={styles.featureTitle}>Instant AI Receipt OCR Scanner</h3>
            <p style={styles.featureDesc}>
              Snap a picture of any restaurant check or store receipt. Our AI automatically parses
              individual line items, tax, tip, and matches them to members in seconds.
            </p>
            <div style={styles.bentoVisualDemoBox}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  marginBottom: '6px',
                }}
              >
                <span style={{ color: '#fff', fontWeight: '700' }}>Dinner Check #402</span>
                <span style={{ color: COLORS.primary, fontWeight: '800' }}>$142.50</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={styles.bentoPill}>Itemized OCR</span>
                <span style={styles.bentoPill}>Auto Tax Split</span>
                <span style={styles.bentoPill}>Tip Calculator</span>
              </div>
            </div>
          </div>

          {/* Card 2: Debt Simplification */}
          <div className="glass-card glass-card-hover" style={styles.bentoCard}>
            <div style={{ ...styles.featureIconContainer, backgroundColor: COLORS.secondaryGlow }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '28px', color: COLORS.secondary }}
              >
                account_tree
              </span>
            </div>
            <h3 style={styles.featureTitle}>Debt Simplification Engine</h3>
            <p style={styles.featureDesc}>
              Minimizes transactions across groups. Turn 12 complex IOUs into 2 clean settlements.
            </p>
          </div>

          {/* Card 3: Real-Time Analytics */}
          <div className="glass-card glass-card-hover" style={styles.bentoCard}>
            <div
              style={{
                ...styles.featureIconContainer,
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '28px', color: COLORS.tertiary }}
              >
                insights
              </span>
            </div>
            <h3 style={styles.featureTitle}>Spending Analytics</h3>
            <p style={styles.featureDesc}>
              Track monthly personal spending vs. group splits with intuitive category charts.
            </p>
          </div>

          {/* Card 4: Direct Settlements */}
          <div className="glass-card glass-card-hover" style={styles.bentoCard}>
            <div
              style={{
                ...styles.featureIconContainer,
                backgroundColor: 'rgba(236, 72, 153, 0.15)',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '28px', color: COLORS.accentPink }}
              >
                qr_code_2
              </span>
            </div>
            <h3 style={styles.featureTitle}>Instant UPI & QR Pay</h3>
            <p style={styles.featureDesc}>
              Generate instant payment links and QR codes to settle up via your favorite UPI or bank
              app.
            </p>
          </div>

          {/* Card 5: Offline First Sync */}
          <div className="glass-card glass-card-hover" style={styles.bentoCard}>
            <div style={{ ...styles.featureIconContainer, backgroundColor: COLORS.primaryGlow }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '28px', color: COLORS.primary }}
              >
                cloud_done
              </span>
            </div>
            <h3 style={styles.featureTitle}>Offline First & Cloud Sync</h3>
            <p style={styles.featureDesc}>
              Add expenses anywhere on trips without cell service. Auto-syncs as soon as you
              reconnect.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Live Bill Split Calculator Section */}
      <section className="calculator-section" style={styles.calculatorSection} id="calculator">
        <div className="calc-layout" style={styles.calcLayout}>
          <div style={styles.calcCopyCol}>
            <span style={styles.sectionTag}>Try it Live</span>
            <h2 style={styles.sectionTitleText}>Calculate splits in real-time</h2>
            <p
              style={{ ...styles.sectionSubtitleText, textAlign: 'left', margin: '12px 0 24px 0' }}
            >
              Select a quick preset or type any custom bill amount to see SplitShare&apos;s instant
              breakdown.
            </p>

            {/* Presets Row */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <button
                onClick={() => applyPreset('dinner')}
                style={{
                  ...styles.presetBtn,
                  borderColor: calcPreset === 'dinner' ? COLORS.primary : COLORS.outline,
                  backgroundColor: calcPreset === 'dinner' ? COLORS.primaryGlow : 'transparent',
                  color: calcPreset === 'dinner' ? COLORS.primary : COLORS.onSurfaceVariant,
                }}
              >
                🍕 Dinner ($88 / 3)
              </button>
              <button
                onClick={() => applyPreset('trip')}
                style={{
                  ...styles.presetBtn,
                  borderColor: calcPreset === 'trip' ? COLORS.primary : COLORS.outline,
                  backgroundColor: calcPreset === 'trip' ? COLORS.primaryGlow : 'transparent',
                  color: calcPreset === 'trip' ? COLORS.primary : COLORS.onSurfaceVariant,
                }}
              >
                🏕️ Trip ($480 / 4)
              </button>
              <button
                onClick={() => applyPreset('rent')}
                style={{
                  ...styles.presetBtn,
                  borderColor: calcPreset === 'rent' ? COLORS.primary : COLORS.outline,
                  backgroundColor: calcPreset === 'rent' ? COLORS.primaryGlow : 'transparent',
                  color: calcPreset === 'rent' ? COLORS.primary : COLORS.onSurfaceVariant,
                }}
              >
                🏠 Rent ($1,600 / 4)
              </button>
            </div>

            {/* Calculated Result Card */}
            <div className="glass-card" style={styles.calcSummaryCard}>
              <span
                style={{
                  fontSize: '12px',
                  color: COLORS.onSurfaceVariant,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: '700',
                }}
              >
                Each Person Owes
              </span>
              <div
                style={{
                  fontSize: '42px',
                  fontWeight: '900',
                  color: COLORS.primary,
                  margin: '4px 0',
                }}
              >
                ${perPerson}
              </div>
              <p
                style={{
                  fontSize: '12px',
                  color: COLORS.onSurfaceVariant,
                  margin: '8px 0 16px 0',
                  lineHeight: '1.5',
                }}
              >
                Split among {calcPeople} people (
                {calcSplitType === 'equal' ? 'Equal Share' : 'Custom Weighted'}).
              </p>

              <button
                onClick={handleCopyLink}
                style={{
                  backgroundColor: copiedShareLink ? COLORS.success : COLORS.surfaceElevated,
                  color: '#fff',
                  border: `1px solid ${COLORS.outline}`,
                  borderRadius: '12px',
                  padding: '10px 16px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  {copiedShareLink ? 'check_circle' : 'share'}
                </span>
                {copiedShareLink ? 'Split Share Link Copied!' : 'Copy Shareable Split Summary'}
              </button>
            </div>
          </div>

          {/* Calculator Inputs Column */}
          <div className="glass-card" style={styles.calcCardContainer}>
            <div style={styles.calcInputGroup}>
              <label style={styles.calcLabel}>Total Bill Amount ($)</label>
              <input
                type="number"
                value={calcAmount}
                onChange={(e) => {
                  setCalcAmount(e.target.value);
                  setCalcPreset('custom');
                }}
                style={styles.calcInput}
                placeholder="0.00"
              />
            </div>

            <div style={styles.calcInputGroup}>
              <label style={styles.calcLabel}>Split Between ({calcPeople} People)</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  onClick={() => setCalcPeople((prev) => Math.max(2, prev - 1))}
                  style={styles.calcAdjustBtn}
                >
                  -
                </button>
                <div
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    fontSize: '20px',
                    fontWeight: '900',
                    color: '#fff',
                  }}
                >
                  {calcPeople} Members
                </div>
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
                  Equally (1/N)
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

      {/* Testimonials / Wall of Love */}
      <section
        className="testimonials-section"
        style={styles.testimonialsSection}
        id="testimonials"
      >
        <div style={styles.sectionHeaderCol}>
          <span style={styles.sectionTag}>Wall of Love</span>
          <h2 style={styles.sectionTitleText}>Loved by 50,000+ Android Users</h2>
          <p style={styles.sectionSubtitleText}>
            Here is what roommates and trip planners are saying about SplitShare.
          </p>
        </div>

        <div style={styles.testimonialsGrid}>
          <div className="glass-card glass-card-hover" style={styles.testimonialCard}>
            <div
              style={{ display: 'flex', gap: '4px', color: COLORS.tertiary, marginBottom: '12px' }}
            >
              ★★★★★
            </div>
            <p style={styles.testimonialText}>
              &quot;SplitShare saved our Europe group trip. Scanning dining receipts with the camera
              and auto-splitting tax was magical.&quot;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={AVATARS.sarah}
                style={{ width: '36px', height: '36px', borderRadius: '50%' }}
              />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>
                  Sarah Jenkins
                </div>
                <div style={{ fontSize: '10px', color: COLORS.onSurfaceVariant }}>
                  Travel Enthusiast
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card glass-card-hover" style={styles.testimonialCard}>
            <div
              style={{ display: 'flex', gap: '4px', color: COLORS.tertiary, marginBottom: '12px' }}
            >
              ★★★★★
            </div>
            <p style={styles.testimonialText}>
              &quot;No more awkward texts about utility bills! The debt simplification feature
              reduced our 15 roomie transfers down to 3.&quot;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={AVATARS.marcus}
                style={{ width: '36px', height: '36px', borderRadius: '50%' }}
              />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>
                  Marcus Vance
                </div>
                <div style={{ fontSize: '10px', color: COLORS.onSurfaceVariant }}>
                  Apartment Manager
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card glass-card-hover" style={styles.testimonialCard}>
            <div
              style={{ display: 'flex', gap: '4px', color: COLORS.tertiary, marginBottom: '12px' }}
            >
              ★★★★★
            </div>
            <p style={styles.testimonialText}>
              &quot;The direct APK installation and instant UPI QR payments make settling debts
              frictionless on Android!&quot;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={AVATARS.elena}
                style={{ width: '36px', height: '36px', borderRadius: '50%' }}
              />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>
                  Elena Rostova
                </div>
                <div style={{ fontSize: '10px', color: COLORS.onSurfaceVariant }}>
                  Android Power User
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Accordion FAQ Section */}
      <section className="faq-section" style={styles.faqSection} id="faq">
        <div style={styles.sectionHeaderCol}>
          <span style={styles.sectionTag}>Got Questions?</span>
          <h2 style={styles.sectionTitleText}>Frequently Asked Questions</h2>
        </div>

        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="glass-card"
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: `1px solid ${isOpen ? COLORS.primaryDark : COLORS.outlineVariant}`,
                }}
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>{faq.q}</span>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s',
                      color: COLORS.primary,
                    }}
                  >
                    expand_more
                  </span>
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: '0 24px 20px 24px',
                      color: COLORS.onSurfaceVariant,
                      fontSize: '14px',
                      lineHeight: '1.6',
                      borderTop: `1px stroke ${COLORS.outlineVariant}`,
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* High Impact Download CTA */}
      <section className="download-section" style={styles.downloadSection} id="download">
        <div style={styles.downloadBgGradient} />
        <h2 style={{ fontSize: '36px', fontWeight: '900', margin: '0 0 16px 0', color: '#fff' }}>
          Get SplitShare for Android Today
        </h2>
        <p
          style={{
            color: COLORS.onSurfaceVariant,
            fontSize: '16px',
            maxWidth: '520px',
            margin: '0 auto 36px auto',
            lineHeight: '1.6',
          }}
        >
          Stop worrying about spreadsheet math. Settle up effortlessly with friends, roommates, and
          travel buddies.
        </p>

        <div className="store-cta-row" style={{ ...styles.storeCtaRow, justifyContent: 'center' }}>
          <Link
            href="/download"
            className="shimmer-btn"
            style={{ ...styles.storeBadge, padding: '12px 28px' }}
          >
            <div style={{ fontSize: '24px' }}>🤖</div>
            <div style={{ textAlign: 'left' }}>
              <span
                style={{
                  fontSize: '10px',
                  color: '#000',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  display: 'block',
                }}
              >
                Direct APK
              </span>
              <span style={{ fontSize: '16px', fontWeight: '900', color: '#000' }}>
                Download Android APK
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Modern Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerTop}>
          <div style={styles.logoContainer}>
            <div style={styles.logoIconBg}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '18px', color: '#000' }}
              >
                account_balance_wallet
              </span>
            </div>
            <span style={{ ...styles.logoText, fontSize: '18px' }}>SplitShare</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: COLORS.primary,
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: COLORS.primary,
                boxShadow: `0 0 10px ${COLORS.primary}`,
              }}
            />
            <span>All Systems Operational (v2.0)</span>
          </div>

          <span style={{ fontSize: '13px', color: COLORS.onSurfaceVariant }}>
            © 2026 SplitShare Inc. Built for Android.
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
    position: 'relative',
    overflowX: 'hidden',
  },
  bgOrb1: {
    position: 'absolute',
    top: '-150px',
    left: '10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0, 245, 160, 0.12) 0%, rgba(0,0,0,0) 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  bgOrb2: {
    position: 'absolute',
    top: '300px',
    right: '5%',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(0,0,0,0) 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  bgGridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
    backgroundSize: '32px 32px',
    pointerEvents: 'none',
    opacity: 0.5,
    zIndex: 0,
  },
  header: {
    height: '72px',
    padding: '0 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1px solid ${COLORS.outlineVariant}`,
    backgroundColor: 'rgba(7, 9, 14, 0.75)',
    backdropFilter: 'blur(16px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoIconBg: {
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    backgroundColor: COLORS.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 0 16px ${COLORS.primaryGlow}`,
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: '-0.5px',
  },
  versionBadge: {
    fontSize: '10px',
    fontWeight: '800',
    color: COLORS.primary,
    backgroundColor: COLORS.primaryGlow,
    padding: '2px 6px',
    borderRadius: '6px',
    border: `1px solid ${COLORS.primaryDark}`,
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '28px',
  },
  navLink: {
    color: COLORS.onSurfaceVariant,
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'color 0.2s',
    cursor: 'pointer',
  },
  downloadBtn: {
    color: '#000',
    padding: '10px 18px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '800',
    textDecoration: 'none',
    boxShadow: '0 4px 16px rgba(0, 245, 160, 0.3)',
  },
  heroSection: {
    padding: '80px 40px 100px 40px',
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
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
  heroBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    color: '#818cf8',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    marginBottom: '20px',
  },
  heroTitle: {
    fontSize: '56px',
    fontWeight: '900',
    lineHeight: '1.1',
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
  },
  storeBadgeIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  storeBadgeSubtext: {
    fontSize: '9px',
    color: COLORS.onSurfaceVariant,
    textTransform: 'uppercase',
    display: 'block',
    fontWeight: '700',
  },
  storeBadgeTitle: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#fff',
  },
  heroMetrics: {
    display: 'flex',
    alignItems: 'center',
    gap: '28px',
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  metricVal: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#ffffff',
  },
  metricLabel: {
    fontSize: '11px',
    color: COLORS.onSurfaceVariant,
    marginTop: '2px',
  },
  dividerVertical: {
    width: '1px',
    height: '32px',
    backgroundColor: COLORS.outlineVariant,
  },
  heroSimCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  phoneOuterShadow: {
    position: 'absolute',
    width: '280px',
    height: '560px',
    borderRadius: '40px',
    backgroundColor: COLORS.primary,
    opacity: 0.15,
    filter: 'blur(50px)',
    zIndex: 1,
  },
  phoneContainer: {
    width: '310px',
    height: '610px',
    backgroundColor: '#07090e',
    borderRadius: '44px',
    border: '10px solid #1f2937',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 30px 60px -12px rgba(0,0,0,0.9)',
    zIndex: 2,
  },
  phoneCameraPunch: {
    width: '12px',
    height: '12px',
    backgroundColor: '#000000',
    borderRadius: '50%',
    position: 'absolute',
    top: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10,
    border: '1px solid #374151',
  },
  phoneStatusBar: {
    height: '36px',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: COLORS.onSurface,
    backgroundColor: '#07090e',
    paddingTop: '6px',
  },
  simTopBar: {
    height: '44px',
    padding: '0 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0c0f17',
    borderBottom: `1px solid ${COLORS.outlineVariant}`,
  },
  simScreenBody: {
    flex: 1,
    backgroundColor: '#07090e',
    overflowY: 'auto',
  },
  simScreenContainer: {
    padding: '14px',
  },
  simBalanceCard: {
    background: 'linear-gradient(135deg, #00a870 0%, #005137 100%)',
    borderRadius: '16px',
    padding: '14px',
    color: '#ffffff',
    marginBottom: '16px',
    boxShadow: '0 8px 24px rgba(0, 168, 112, 0.25)',
  },
  simSectionHeader: {
    fontSize: '9px',
    fontWeight: '800',
    color: COLORS.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px',
  },
  simCard: {
    backgroundColor: COLORS.surfaceCard,
    border: `1px solid ${COLORS.outlineVariant}`,
    borderRadius: '14px',
    padding: '10px 12px',
    color: '#ffffff',
  },
  simOverlapAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '2px solid #07090e',
  },
  simQuickAction: {
    flex: 1,
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
  },
  simQuickIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
    border: '1px solid',
  },
  simQuickLabel: {
    fontSize: '9px',
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  simTabTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
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
    color: '#fff',
  },
  simActivityRow: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceCard,
    borderRadius: '12px',
    padding: '8px 10px',
    border: `1px solid ${COLORS.outlineVariant}`,
  },
  simActivityIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simProfileHeader: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '14px',
  },
  simSettingsItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: `1px solid ${COLORS.outlineVariant}`,
  },
  simBottomNav: {
    height: '54px',
    borderTop: `1px solid ${COLORS.outlineVariant}`,
    backgroundColor: '#0a0d14',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  simNavItem: {
    backgroundColor: 'transparent',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
  },
  simNavText: {
    fontSize: '8px',
    marginTop: '2px',
    fontWeight: '700',
  },
  simTip: {
    fontSize: '12px',
    color: COLORS.onSurfaceVariant,
    marginTop: '16px',
    textAlign: 'center',
  },
  featuresSection: {
    padding: '100px 40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  sectionHeaderCol: {
    textAlign: 'center',
    marginBottom: '64px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  sectionTag: {
    color: COLORS.primary,
    fontSize: '11px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: '8px',
  },
  sectionTitleText: {
    fontSize: '38px',
    fontWeight: '900',
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
  bentoCardLarge: {
    gridColumn: 'span 2',
    borderRadius: '24px',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  bentoCard: {
    borderRadius: '24px',
    padding: '32px',
  },
  bentoTag: {
    fontSize: '11px',
    fontWeight: '800',
    color: COLORS.tertiary,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    padding: '4px 10px',
    borderRadius: '12px',
    border: '1px solid rgba(245, 158, 11, 0.3)',
  },
  bentoVisualDemoBox: {
    backgroundColor: '#0a0d14',
    border: `1px solid ${COLORS.outlineVariant}`,
    borderRadius: '16px',
    padding: '16px',
    marginTop: '20px',
  },
  bentoPill: {
    fontSize: '10px',
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
    backgroundColor: COLORS.surfaceCard,
    padding: '4px 8px',
    borderRadius: '6px',
  },
  featureIconContainer: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  featureTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 10px 0',
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
    position: 'relative',
    zIndex: 1,
  },
  calcLayout: {
    maxWidth: '1050px',
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '1.1fr 1fr',
    gap: '56px',
    alignItems: 'center',
  },
  calcCopyCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  presetBtn: {
    border: '1px solid',
    borderRadius: '12px',
    padding: '8px 14px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  calcSummaryCard: {
    borderRadius: '24px',
    padding: '28px',
    width: '100%',
    boxSizing: 'border-box',
  },
  calcCardContainer: {
    borderRadius: '24px',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  calcInputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  calcLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  calcInput: {
    backgroundColor: COLORS.surfaceCard,
    border: `1px solid ${COLORS.outline}`,
    borderRadius: '14px',
    padding: '14px',
    fontSize: '18px',
    fontWeight: '800',
    color: '#ffffff',
    outline: 'none',
  },
  calcAdjustBtn: {
    backgroundColor: COLORS.surfaceCard,
    border: `1px solid ${COLORS.outline}`,
    borderRadius: '14px',
    width: '46px',
    height: '46px',
    fontSize: '22px',
    fontWeight: '900',
    color: '#ffffff',
    cursor: 'pointer',
  },
  calcToggleBtn: {
    flex: 1,
    border: '1px solid',
    borderRadius: '14px',
    padding: '12px',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
  },
  testimonialsSection: {
    padding: '100px 40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  testimonialsGrid: {
    maxWidth: '1200px',
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  },
  testimonialCard: {
    borderRadius: '24px',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  testimonialText: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: COLORS.onSurface,
    fontStyle: 'italic',
    marginBottom: '20px',
  },
  faqSection: {
    padding: '100px 40px',
    position: 'relative',
    zIndex: 1,
  },
  downloadSection: {
    padding: '100px 40px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    zIndex: 1,
  },
  downloadBgGradient: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    backgroundColor: COLORS.primary,
    opacity: 0.1,
    filter: 'blur(90px)',
    pointerEvents: 'none',
  },
  footer: {
    padding: '40px',
    borderTop: `1px solid ${COLORS.outlineVariant}`,
    backgroundColor: '#07090e',
    position: 'relative',
    zIndex: 1,
  },
  footerTop: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
  },
};
