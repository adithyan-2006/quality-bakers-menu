import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import '../styles/globals.css';
import { ThemeProvider } from '../providers/theme-provider';
import { QueryProvider } from '../providers/query-provider';
import { AppShell } from '../components/layout/app-shell';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'Quality Bakers Menu',
    template: '%s | Quality Bakers',
  },
  description: 'A premium digital menu experience.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Quality Bakers Menu',
    description: 'Explore our artisanal baked goods.',
    url: 'https://menu.qualitybakers.com',
    siteName: 'Quality Bakers',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quality Bakers Menu',
    description: 'Explore our artisanal baked goods.',
  },
  alternates: {
    canonical: 'https://menu.qualitybakers.com',
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
        className={`${inter.variable} ${playfair.variable} min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary/20 selection:text-primary`}
      >
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AppShell>{children}</AppShell>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
