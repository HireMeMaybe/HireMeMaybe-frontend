'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login, isAuthenticated } = useAdminAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      // Router will handle redirect via useEffect above
    } catch (err) {
      // Stay on login page and show error
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background flex h-screen items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-darker-gray rounded-2xl p-8 shadow-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold">
              <span className="text-white">HIRE </span>
              <span className="text-primary-green">ME</span>
              <span className="text-white">, MAY</span>
              <span className="text-primary-green">BE</span>
              <span className="text-white">?</span>
            </h1>
            <h2 className="text-2xl font-semibold text-white">Admin Portal</h2>
            <p className="mt-2 text-gray-400">Sign in to your admin account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-md border border-red-500/50 bg-red-500/10 p-3">
              <p className="text-red-reject text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-darker-gray focus:border-primary-green focus:ring-primary-green w-full rounded-md border border-gray-600 px-4 py-3 text-white placeholder-gray-400 focus:ring-1"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-darker-gray focus:border-primary-green focus:ring-primary-green w-full rounded-md border border-gray-600 px-4 py-3 pr-12 text-white placeholder-gray-400 focus:ring-1"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3"
                  disabled={isLoading}
                  data-testid="toggle-password-visibility"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              className="bg-primary-green focus:ring-primary-green w-full cursor-pointer rounded-md py-3 font-semibold text-white hover:bg-green-600 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
