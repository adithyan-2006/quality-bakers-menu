'use client';

import { useState } from 'react';
import { AuthService } from '../../../features/auth/services/auth-service';
import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await AuthService.requestPasswordReset(email);
      setIsSuccess(true);
    } catch (err) {
      // In a real app we don't want to confirm if email exists,
      // but for mock we can just show success either way.
      console.error(err);
      setIsSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        <div className="p-8">
          <Link
            href="/login"
            className="inline-flex items-center text-sm font-medium text-stone-500 hover:text-stone-900 dark:hover:text-stone-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Link>

          <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-50 mb-2">
            Reset Password
          </h2>
          <p className="text-sm text-stone-500 mb-8">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-green-50 dark:bg-green-950/30 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-medium text-stone-900 dark:text-stone-50">Check your email</h3>
                <p className="text-sm text-stone-500 mt-1">
                  We've sent password reset instructions to {email}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-50 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-stone-900 dark:bg-stone-50 text-stone-50 dark:text-stone-900 rounded-md py-2.5 font-medium flex items-center justify-center gap-2 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors disabled:opacity-70"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
