import type { Metadata } from 'next';
import Header from '../components/Header';
import './globals.css';

export const metadata: Metadata = {
  title: 'Deploy Hub | Website development, hosting, support',
  description:
    'Professional website development, managed hosting, SSL setup, and ongoing support for growing businesses.',
  metadataBase: new URL('https://www.deployhub.ph'),
  openGraph: {
    title: 'Deploy Hub',
    description:
      'Website development, deployment, hosting, SSL setup, and maintenance designed for small and medium businesses.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-dark text-brand-text antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}
