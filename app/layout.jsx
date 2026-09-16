import './globals.css';
import ConditionalChrome from '@/components/layout/ConditionalChrome';
import { brandConfig } from '@/lib/config';

export const metadata = {
  metadataBase: new URL(brandConfig.seo.siteUrl),
  title: brandConfig.seo.title,
  description: brandConfig.seo.description,
  keywords: brandConfig.seo.keywords.join(', '),
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: brandConfig.seo.title,
    description: brandConfig.seo.description,
    url: brandConfig.seo.siteUrl,
    siteName: brandConfig.displayName,
    images: [{ url: brandConfig.seo.ogImage, width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: brandConfig.seo.title,
    description: brandConfig.seo.description,
    images: [brandConfig.seo.ogImage],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-background text-charcoal antialiased">
        <ConditionalChrome>{children}</ConditionalChrome>
      </body>
    </html>
  );
}
