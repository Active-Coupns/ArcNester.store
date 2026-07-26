import './globals.css';
import AnnouncementBanner from '../components/AnnouncementBanner';

export const metadata = {
  title: 'ArcNester.store | Luxury & Modern Architectural House Plans E-Commerce',
  description: 'Download premium architectural concept drawings, 3D renders, and floor plans for your dream house building project.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="overflow-x-hidden w-full max-w-full">
      <body className="bg-slate-50 text-slate-900 min-h-screen font-sans selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden w-full max-w-full">
        <AnnouncementBanner />
        {children}
      </body>
    </html>
  );
}
