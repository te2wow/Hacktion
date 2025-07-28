import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Logo from '@/components/Logo';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hacktion - Hackathon Progress Tracker',
  description: 'Track GitHub progress across multiple teams during hackathons',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-hacktion-dark min-h-screen text-white`}>
        <header className="bg-hacktion-gray border-b border-gray-700">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo />
              <div className="text-sm text-gray-400 hidden sm:block">
                Hackathon Progress Tracker
              </div>
            </div>
            <div className="text-sm text-gray-400 hidden sm:block">
              Real-time GitHub Analytics
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}