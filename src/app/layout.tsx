import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../styles/global.css';
import Providers from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GitHub Explorer',
  description: 'GitHub Analytics Dashboard for users insights and repository statistics.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
        <footer className="mt-auto w-full border-t border-white/5 py-4 text-center text-sm text-muted">
          <p>
            Made by{' '}
            <a
              href="https://github.com/jkazakos"
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Iasonas Kazakos
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
