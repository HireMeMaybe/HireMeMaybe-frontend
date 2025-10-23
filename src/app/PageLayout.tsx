'use client';

import Navbar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { usePathname } from 'next/navigation';

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login';

  return (
    <>
      <Navbar />
      {children}
      {!isAdminPage && <Footer />}
    </>
  );
}