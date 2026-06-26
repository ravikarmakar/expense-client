import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Expense Tracker',
  description: 'Manage your personal expenses with ease',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{ margin: 0, fontFamily: 'sans-serif', backgroundColor: '#fafafa', color: '#333' }}
      >
        {children}
      </body>
    </html>
  );
}
