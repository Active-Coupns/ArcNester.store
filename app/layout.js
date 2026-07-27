import './globals.css';
import AnnouncementBanner from '../components/AnnouncementBanner';
import Script from 'next/script';

export const metadata = {
  title: {
    default: 'ArcNester.store | Luxury & Modern Architectural House Plans E-Commerce',
    template: '%s | ArcNester.store'
  },
  description: 'Download premium architectural concept drawings, 3D renders, and floor plans for your dream house building project.',
  keywords: ['house plans', 'floor plans', 'home designs', 'architectural drawings', '3d renders', 'modern house plans', 'luxury house designs', 'building blueprints'],
  openGraph: {
    title: 'ArcNester.store | Premium Architectural House Plans',
    description: 'Download premium architectural concept drawings, 3D renders, and floor plans for your dream house building project.',
    url: 'https://house-plans-portal.vercel.app',
    siteName: 'ArcNester.store',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&h=630&q=80',
        width: 1200,
        height: 630,
        alt: 'ArcNester.store Premium Home Layout Preview',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ArcNester.store | Premium Architectural House Plans',
    description: 'Download premium architectural concept drawings, 3D renders, and floor plans.',
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&h=630&q=80'],
  },
  verification: {
    other: {
      'p:domain_verify': 'e18dfe5517592cd7230f7086429968e4',
    },
  }
};

export default function RootLayout({ children }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-L4M8Y18CK5';

  return (
    <html lang="en" className="overflow-x-hidden w-full max-w-full">
      <body className="bg-slate-50 text-slate-900 min-h-screen font-sans selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden w-full max-w-full">
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        <AnnouncementBanner />
        {children}
      </body>
    </html>
  );
}
