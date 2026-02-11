import type { Metadata } from 'next';
// Temporarily disabled Google Fonts due to build issues
// import { Geist, Geist_Mono } from 'next/font/google';
import { ToastContainer } from 'react-toastify';
import { StoreInitializer } from '@/components/store-initializer';
import './globals.css';

// Use system fonts as fallback
// const geistSans = Geist({
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
//   display: 'swap',
//   fallback: ['system-ui', 'arial'],
// });

// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
//   display: 'swap',
//   fallback: ['ui-monospace', 'monospace'],
// });

export const metadata: Metadata = {
  title: 'Class Management',
  description: 'Class Management System',
};

// Root layout với html và body tags bắt buộc cho Next.js
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className="antialiased overflow-x-hidden font-sans">
        <StoreInitializer />
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
