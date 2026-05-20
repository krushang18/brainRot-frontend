import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import 'sketchbook-ui/style.css';
import './globals.css';
import { Providers } from '@/components/Providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Brainrot',
  description:
    'A place where users can yap freely. Dump thoughts, ideas, memes, late-night overthinking, random obsessions, tasks, and internet brainrot all in one chaotic space.',
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
      </body>
    </html>
  );
}
