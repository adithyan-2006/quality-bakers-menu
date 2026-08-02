'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../components/providers/auth-provider';
import { AuthService } from '../../../features/auth/services/auth-service';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { user } = await AuthService.login(email, password);
      login(user);

      const callbackUrl = searchParams.get('callbackUrl');
      router.push(callbackUrl || '/dashboard');
    } catch (err) {
      setError((err as Error).message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        <div className="p-8 text-center border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/50">
          <div className="w-16 h-16 mx-auto bg-stone-900 dark:bg-stone-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
            {/* Placeholder for bakery logo */}
            <span className="text-2xl font-serif font-bold text-stone-50 dark:text-stone-900">
              Q
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-50">
            Quality Bakers
          </h1>
          <p className="text-sm text-stone-500 mt-1">Admin Control Panel</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-sm rounded-md border border-rose-100 dark:border-rose-900/50 text-center font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@qualitybakers.com"
                className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-50 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                />
                <span className="text-sm text-stone-600 dark:text-stone-400">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-stone-900 dark:text-stone-300 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-stone-900 dark:bg-stone-50 text-stone-50 dark:text-stone-900 rounded-md py-2.5 font-medium flex items-center justify-center gap-2 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors disabled:opacity-70"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-stone-400">
            <p>Mock Credentials for Sprint 3.6:</p>
            <p className="mt-1">
              Email: <strong>sarah@qualitybakers.com</strong> (Owner)
            </p>
            <p>
              Email: <strong>john@qualitybakers.com</strong> (Manager)
            </p>
            <p className="mt-1 text-stone-500">Any password will work.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
