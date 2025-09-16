'use client';

import { Search, User } from 'lucide-react';
import { PrimaryIcon } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { UserPen, History, LogOut } from 'lucide-react';

export default function Navbar() {
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL ?? '/';
  const [open, setOpen] = useState<boolean>(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const isRegistered = (session as any)?.isRegistered ?? false;
  const handleUserClick = () => {
    if (isLoading) return;
    if (!isAuthenticated) {
      // Don't open dropdown. Try to scroll to in-page login section, otherwise navigate to the frontend URL with anchor.
      setOpen(false);
      const el = typeof document !== 'undefined' ? document.getElementById('login-section') : null;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        const base = frontendUrl.replace(/\/$/, '');
        window.location.href = `${base}#login-section`;
      }
      return;
    }
    setOpen((o) => !o);
  };

  return (
    <nav className="border-border sticky top-0 z-50 flex w-full items-center justify-between border-b bg-[var(--background)] px-15 py-3 text-white shadow-[0px_1px_10px_rgba(2,188,119,255)]">
      {/* Left side - Brand with green indicator */}
      <a href={frontendUrl} className="flex items-center gap-3" aria-label="Go to frontend home">
        <PrimaryIcon width={12} height={12} />
        <div className="h-6 w-32 justify-start text-lg leading-snug font-bold text-white">
          HireMeMaybe
        </div>
      </a>

      {/* Center - Search bar */}
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

      {/* Right side - User icon and dropdown */}
      <div className="relative ml-auto">
        <button
          onClick={handleUserClick}
          aria-label="User menu"
          className="rounded-full p-2 hover:bg-white/10"
        >
          <User />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-56 rounded-lg bg-[rgb(33,33,33)] p-4 text-white shadow-lg">
            {isLoading ? (
              <div className="py-4">Loading...</div>
            ) : !isRegistered ? (
              <div className="flex flex-col gap-2">
                <a href="/auth/google" className="rounded px-3 py-2 hover:bg-white/5">
                  Login with Google
                </a>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 border-b pb-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500" />
                  <div>
                    <div className="font-bold">
                      {session?.backendUser?.role === 'Company'
                        ? session?.backendUser?.name || 'Company'
                        : session?.backendUser?.first_name || 'U'}
                    </div>
                    <div className="text-sm text-zinc-400">{session?.user?.email}</div>
                  </div>
                </div>
                <a
                  href="/profile"
                  className="flex items-center gap-2 rounded px-3 py-2 hover:bg-white/5"
                >
                  <UserPen className="h-4 w-4" />
                  View profile
                </a>
                <a
                  href="/history"
                  className="flex items-center gap-2 rounded px-3 py-2 hover:bg-white/5"
                >
                  <History className="h-4 w-4" />
                  History
                </a>
                <button
                  onClick={() => {
                    signOut();
                    setOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-left hover:bg-white/5"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
