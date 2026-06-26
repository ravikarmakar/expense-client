'use client';

import React from 'react';
import { SharedButton } from '@workspace/ui';
import type { User } from '@workspace/types';

export default function HomePage() {
  const dummyUser: User = {
    id: '1',
    name: 'Developer Workspace',
    email: 'admin@workspace.local',
    createdAt: new Date(),
  };

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'radial-gradient(circle at top left, #1a1a2e, #16213e, #0f0c1b)',
        color: '#fff',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '3rem',
          maxWidth: '600px',
          width: '100%',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        }}
      >
        <h1
          style={{
            fontSize: '2.5rem',
            margin: '0 0 1rem 0',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #00c6ff, #0072ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Next.js App Router
        </h1>
        <p style={{ color: '#ccc', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          This application is running inside a Turborepo monorepo using pnpm. It is fully integrated
          with shared styles, configurations, and static TypeScript validation.
        </p>

        <div
          style={{
            textAlign: 'left',
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            fontSize: '0.9rem',
            fontFamily: 'monospace',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <div style={{ color: '#00c6ff', marginBottom: '0.5rem' }}>
            {'// Verified Shared Type Import'}
          </div>
          <div>User ID: {dummyUser.id}</div>
          <div>Name: {dummyUser.name}</div>
          <div>Email: {dummyUser.email}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <SharedButton
            label="Shared UI Button Active"
            onClick={() => alert('Shared UI Component communication works!')}
          />
        </div>
      </div>
    </main>
  );
}
