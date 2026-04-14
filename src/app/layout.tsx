import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Adherix',
  description: 'Behavioral adherence for GLP-1 programs',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
