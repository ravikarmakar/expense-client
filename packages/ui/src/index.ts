import * as React from 'react';

export interface ButtonProps {
  label: string;
  onClick?: () => void;
}

export function SharedButton({ label, onClick }: ButtonProps) {
  return React.createElement(
    'button',
    {
      onClick,
      style: {
        padding: '8px 16px',
        borderRadius: '4px',
        backgroundColor: '#0070f3',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
      },
    },
    label
  );
}
