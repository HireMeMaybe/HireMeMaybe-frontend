'use client';

import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Building, GraduationCap, Eye, Check } from 'lucide-react';
import GoogleLogin from '@/features/landing/components/GoogleLogin';
import { signIn, useSession } from 'next-auth/react';

type RoleCardProps = Readonly<{
  title: string;
  description: string;
  checks: string[];
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onSelect?: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
}>;

function RoleCard({
  title,
  description,
  checks,
  Icon,
  onSelect,
  isActive,
  isDisabled,
}: RoleCardProps) {
  const pointerActivated = useRef(false);
  const { data: session } = useSession();

  const handleGoogleLogin = async (title: string) => {
    if (title === 'CPSK') {
      try {
        console.log('🔄 Starting Google authentication for CPSK...');
        // Build Google OAuth2 URL and redirect user to Google
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_CPSK;
        const redirectUri = `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/auth/callback`;
        const state = Math.random().toString(36).slice(2);
        // Store state to validate on callback if desired
        sessionStorage.setItem('oauth_state', state);

        const params = new URLSearchParams({
          client_id: clientId || '',
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: 'openid profile email',
          access_type: 'offline',
          prompt: 'consent',
          state,
        });

        const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
        window.location.href = googleUrl;
      } catch (error) {
        console.error('❌ Error during Google authentication:', error);
        alert('Error starting Google authentication. Please try again.');
      }
    } else {
      console.log('Google login for', title, '- not implemented yet');
    }
  };

  return (
    <Card
      // Support pointer (mouse & touch), with a guard to avoid double-invocation
      onPointerUp={(() => {
        const handler: React.PointerEventHandler<HTMLButtonElement | HTMLDivElement> = () => {
          if (isDisabled) return;
          if (!isActive) {
            pointerActivated.current = true;
            onSelect?.();
          }
        };
        return handler;
      })()}
      onClick={(() => {
        const handler: React.MouseEventHandler<HTMLButtonElement | HTMLDivElement> = () => {
          // If pointer already handled the activation, swallow the click.
          if (isDisabled) return;
          if (pointerActivated.current) {
            pointerActivated.current = false;
            return;
          }
          if (!isActive) onSelect?.();
        };
        return handler;
      })()}
      onKeyDown={(() => {
        const handler: React.KeyboardEventHandler<HTMLButtonElement | HTMLDivElement> = (e) => {
          if (isDisabled) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!isActive) onSelect?.();
          }
        };
        return handler;
      })()}
      tabIndex={isDisabled ? -1 : 0}
      role="button"
      aria-pressed={isActive}
      aria-disabled={isDisabled}
      aria-label={`${title} - ${description}`}
      className={`relative mx-4 h-96 w-72 overflow-hidden border-[var(--color-primary-green)] bg-transparent transition-transform duration-300 ${
        isDisabled
          ? 'cursor-not-allowed opacity-60'
          : 'cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(2,188,119,0.12)] hover:ring-1 hover:ring-[var(--color-primary-green)]'
      }`}
    >
      <CardHeader className="items-center">
        <div className="mx-auto">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary-green)]">
            <Icon className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="mt-4 w-full text-center">
          <CardTitle className="text-2xl text-white">{title}</CardTitle>
          <CardDescription className="mt-2">{description}</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3">
          {checks.map((c) => (
            <li key={c} className="flex items-start text-sm text-white/80">
              <Check className="mt-1 h-5 w-5 text-[var(--color-primary-green)]" />
              <span className="ml-3">{c}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      {isActive && !isDisabled && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.45)]"
          style={{ WebkitBackdropFilter: 'blur(6px)', backdropFilter: 'blur(6px)' }}
          onClick={() => onSelect?.()}
        >
          <div onClick={(e) => e.stopPropagation()} className="px-6">
            <GoogleLogin onClick={() => handleGoogleLogin(title)} />
          </div>
        </div>
      )}
    </Card>
  );
}

export default function LoginSection() {
  const [active, setActive] = useState<string | null>(null);
  const { data: session, status } = useSession();

  // User is authenticated if they have a session
  const isAuthenticated = status === 'authenticated';

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setActive(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <section
      id="login-section"
      className="bg-[var(--background)] pt-0 pb-20 text-[var(--foreground)]"
    >
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold md:text-4xl">Ready to join?</h2>
        <p className="mt-3 text-lg text-white/80">Select your role below</p>

        <div className="mt-12 flex flex-col items-stretch justify-center md:flex-row">
          <RoleCard
            title="Company"
            description="Find talented CPE and SKE students for your organization"
            checks={['Create company profile', 'Post job openings', 'Track applications']}
            Icon={Building}
            onSelect={() => setActive((s) => (s === 'Company' ? null : 'Company'))}
            isActive={active === 'Company'}
            isDisabled={isAuthenticated}
          />

          <RoleCard
            title="CPSK"
            description="Discover internships and job opportunities"
            checks={['Build your profile', 'Apply to positions', 'Search & filter jobs']}
            Icon={GraduationCap}
            onSelect={() => setActive((s) => (s === 'CPSK' ? null : 'CPSK'))}
            isActive={active === 'CPSK'}
            isDisabled={isAuthenticated}
          />

          <RoleCard
            title="Visitor"
            description="Browse and explore the platform's features"
            checks={['View job posts', 'Browse company profiles', 'Explore opportunities']}
            Icon={Eye}
            onSelect={() => setActive((s) => (s === 'Visitor' ? null : 'Visitor'))}
            isActive={active === 'Visitor'}
            isDisabled={isAuthenticated}
          />
        </div>
      </div>

      {/* per-card overlay is rendered inside each RoleCard */}
    </section>
  );
}
