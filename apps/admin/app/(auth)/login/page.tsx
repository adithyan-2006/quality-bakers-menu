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
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.9)] border border-black/[0.08] overflow-hidden">
        <div className="p-8 text-center border-b border-black/[0.06] bg-white/40 backdrop-blur-md">
          <div className="w-16 h-16 mx-auto bg-black rounded-full flex items-center justify-center mb-4 shadow-md">
            {/* Bakery logo placeholder */}
            <span className="text-2xl font-serif font-bold text-white">Q</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Quality Bakers</h1>
          <p className="text-sm text-stone-500 mt-1">Admin Control Panel</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-rose-50/80 backdrop-blur-sm text-rose-600 text-sm rounded-lg border border-rose-200 text-center font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@qualitybakers.com"
                className="w-full rounded-lg border border-black/10 bg-white/70 backdrop-blur-sm px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:ring-2 focus:ring-black focus:border-black transition-all placeholder:text-stone-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-black/10 bg-white/70 backdrop-blur-sm px-3.5 py-2.5 pr-10 text-sm text-stone-900 outline-none focus:ring-2 focus:ring-black focus:border-black transition-all placeholder:text-stone-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-black/20 text-black focus:ring-black"
                />
                <span className="text-sm text-stone-600">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-stone-900 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white rounded-lg py-2.5 font-medium flex items-center justify-center gap-2 hover:bg-stone-800 transition-all shadow-sm disabled:opacity-70"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
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
