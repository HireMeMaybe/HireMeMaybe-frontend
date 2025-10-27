'use client';

import Image from 'next/image';
import { Search, User, UserPen, History, LogOut, Shield } from 'lucide-react';
import { PrimaryIcon } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function Navbar() {
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL ?? '/';
  const [open, setOpen] = useState<boolean>(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';

  const isAdminRoute = pathname?.startsWith('/admin');
  const {
    user: adminUser,
    isAuthenticated: isAdminAuthenticated,
    logout: adminLogout,
  } = useAdminAuth();

  function hasIsRegistered(obj: unknown): obj is { isRegistered?: boolean } {
    return typeof obj === 'object' && obj !== null && 'isRegistered' in obj;
  }

  const isRegistered = hasIsRegistered(session) ? !!session.isRegistered : false;
  type BackendUser = {
    role?: string | null;
    verified_status?: string | null;
    company?: { verified_status?: string | null } | null;
    id?: string | number;
    name?: string | null;
    first_name?: string | null;
    User?: { profile_picture?: string | null } | null;
  };

  const backendUser = session?.backendUser as BackendUser | undefined;
  const isCompany = backendUser?.role === 'Company';
  const verifiedStatus =
    backendUser?.company?.verified_status ?? backendUser?.verified_status ?? null;
  const isUnverifiedCompany = isCompany && String(verifiedStatus).toLowerCase() !== 'verified';
  const profileHref = isCompany ? `/company/${backendUser?.id ?? ''}?view=company` : '/profile';

  const scrollToLoginSection = () => {
    setOpen(false);
    const el = typeof document !== 'undefined' ? document.getElementById('login-section') : null;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      const base = frontendUrl.replace(/\/$/, '');
      window.location.href = `${base}#login-section`;
    }
  };

  const handleUserClick = () => {
    if (isLoading) return;

    // If admin is authenticated (regardless of route), allow dropdown
    if (isAdminAuthenticated) {
      setOpen((o) => !o);
      return;
    }

    // For regular users, check authentication and registration
    if (!isAuthenticated || (isAuthenticated && !isRegistered)) {
      scrollToLoginSection();
      return;
    }

    setOpen((o) => !o);
  };

  const handleLogout = () => {
    if (isAdminAuthenticated) {
      adminLogout();
      window.location.href = '/admin/login';
    } else {
      signOut({ callbackUrl: '/' });
    }
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (open && !target.closest('.user-dropdown-container')) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Determine what content to show in dropdown
  let dropdownContent: React.ReactNode = null;

  if (isLoading) {
    dropdownContent = <div className="py-4">Loading...</div>;
  } else if (isAdminAuthenticated) {
    // Show admin dropdown content (works on any page now)
    dropdownContent = (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 border-b pb-3">
          <div className="bg-primary-green flex h-10 w-10 items-center justify-center rounded-full">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-bold">{adminUser?.username || 'Admin'}</div>
            <div className="text-sm text-zinc-400">Administrator</div>
          </div>
        </div>
        {!isAdminRoute && (
          <a
            href="/admin/dashboard"
            className="flex items-center gap-2 rounded px-3 py-2 hover:bg-white/5"
          >
            <Shield className="h-4 w-4" />
            Admin Dashboard
          </a>
        )}
        <button
          onClick={handleLogout}
          className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-left hover:bg-white/5"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    );
  } else if (!isRegistered) {
    dropdownContent = (
      <div className="py-3 text-sm text-gray-400">
        Complete your registration to see account actions.
      </div>
    );
  } else {
    const isVisitor = backendUser?.role === 'Visitor';

    dropdownContent = (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 border-b pb-3">
          {session?.backendUser?.User?.profile_picture ? (
            <Image
              src={session.backendUser.User.profile_picture}
              alt={session.backendUser?.name || session.backendUser?.first_name || 'User'}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-emerald-500" />
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate font-bold">
              {session?.backendUser?.role === 'Company'
                ? session?.backendUser?.name || 'Company'
                : session?.backendUser?.first_name || 'User'}
            </div>
            <div className="overflow-wrap-anywhere text-sm break-all text-zinc-400">
              {session?.user?.email}
            </div>
          </div>
        </div>

        {!isVisitor && !isUnverifiedCompany && (
          <a
            href={profileHref}
            className="flex items-center gap-2 rounded px-3 py-2 hover:bg-white/5"
          >
            <UserPen className="h-4 w-4" />
            View profile
          </a>
        )}

        {!isVisitor &&
          !isUnverifiedCompany &&
          (session?.backendUser?.role === 'Company' ? (
            <a
              href={`/company/${session.backendUser?.id ?? ''}?view=company`}
              className="flex items-center gap-2 rounded px-3 py-2 hover:bg-white/5"
            >
              <History className="h-4 w-4" />
              Applications
            </a>
          ) : (
            <a
              href="/history"
              className="flex items-center gap-2 rounded px-3 py-2 hover:bg-white/5"
            >
              <History className="h-4 w-4" />
              History
            </a>
          ))}

        <button
          onClick={handleLogout}
          className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-left hover:bg-white/5"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    );
  }

  return (
    <nav className="border-border sticky top-0 z-50 flex w-full items-center justify-between border-b bg-[var(--background)] px-15 py-3 text-white shadow-[0px_1px_10px_rgba(2,188,119,255)]">
      {/* Left side - Brand */}
      <a href={frontendUrl} className="flex items-center gap-3" aria-label="Go to frontend home">
        <PrimaryIcon width={12} height={12} />
        <div className="h-6 w-32 justify-start text-lg leading-snug font-bold text-white">
          HireMeMaybe
        </div>
      </a>

      {/* Center - Search bar */}
      {!(pathname && (pathname.startsWith('/search') || pathname.startsWith('/admin'))) && (
        <div className="mx-8 max-w-md flex-1">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search..."
              className="bg-component w-full rounded-full border-none text-white placeholder-zinc-500 focus:ring-purple-500"
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Search className="h-5 w-5 text-zinc-500" />
            </span>
          </div>
        </div>
      )}

      {/* Right side - User icon and dropdown */}
      <div className="user-dropdown-container relative ml-auto">
        <button
          onClick={handleUserClick}
          aria-label="User menu"
          className="rounded-full p-2 hover:bg-white/10"
        >
          <User />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 min-w-56 rounded-lg bg-[rgb(33,33,33)] p-4 text-white shadow-lg">
            {dropdownContent}
          </div>
        )}
      </div>
    </nav>
  );
}
