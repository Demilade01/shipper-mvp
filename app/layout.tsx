import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://shipper-mvp.vercel.app'),
  title: {
    default: 'Shipper - Connect with your team instantly',
    template: '%s | Shipper',
  },
  description: 'Send messages, see who\'s online, and chat in real-time. Fast, secure, and free to use. Connect with your team instantly.',
  keywords: [
    'real-time chat',
    'team communication',
    'messaging app',
    'online chat',
    'team collaboration',
    'instant messaging',
    'chat application',
    'secure messaging',
    'free chat',
    'real-time messaging',
  ],
  authors: [{ name: 'Shipper Team' }],
  creator: 'Shipper',
  publisher: 'Shipper',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://shipper-mvp.vercel.app/',
    siteName: 'Shipper',
    title: 'Shipper - Connect with your team instantly',
    description: 'Send messages, see who\'s online, and chat in real-time. Fast, secure, and free to use.',
    images: [
      {
        url: '/screenshot.png',
        width: 1200,
        height: 630,
        alt: 'Shipper - Real-time chat made simple. Connect with your team instantly.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shipper - Connect with your team instantly',
    description: 'Send messages, see who\'s online, and chat in real-time. Fast, secure, and free to use.',
    images: ['/screenshot.png'],
    creator: '@shipper', // Update with your actual Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#070825' },
  ],
  category: 'communication',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
