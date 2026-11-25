import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import '../styles/globals.css';
import { ThemeProvider } from '../providers/theme-provider';
import { QueryProvider } from '../providers/query-provider';
import { AuthProvider } from '../components/providers/auth-provider';
// NOTE: WebsiteVisitTracker intentionally removed from the admin layout.
// Admin page views must NOT be mixed into customer analytics.
// Customer tracking is handled exclusively in apps/customer/app/layout.tsx.

const inter = localFont({
  src: '../public/fonts/inter-variable.woff2',
  variable: '--font-sans',
  weight: '100 900',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'Admin | Quality Bakers',
    template: '%s | Admin | Quality Bakers',
  },
  description: 'Admin Control Panel for Quality Bakers',
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/icon.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-screen font-sans text-stone-900 antialiased selection:bg-black selection:text-white glass-canvas-bg`}
      >
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
