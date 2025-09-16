import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/NavBar';
import Footer from '@/components/Footer';
import NextAuthProvider from '@/components/NextAuthProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'HireMeMaybe',
  description:
    'An employment system designed to serve students in the Software and Knowledge Engineering (SKE) and Computer Engineering (CPE) programs.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          <NextAuthProvider>
            <Navbar />
            {children}
            <Footer />
          </NextAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
