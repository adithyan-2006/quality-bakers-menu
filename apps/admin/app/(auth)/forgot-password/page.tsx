'use client';

import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.9)] border border-black/[0.08] overflow-hidden">
        <div className="p-8">
          <Link
            href="/login"
            className="inline-flex items-center text-sm font-medium text-stone-500 hover:text-stone-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Link>

          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 bg-black/5 text-stone-900 rounded-full flex items-center justify-center mx-auto border border-black/10">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <h2 className="text-2xl font-serif font-bold text-stone-900">
              Password Reset Unavailable
            </h2>

            <div className="text-sm text-stone-600 space-y-3 text-left bg-black/[0.03] p-4 rounded-xl border border-black/[0.06]">
              <p>
                For security reasons, self-service automated password reset is disabled for
                administrative accounts.
              </p>
              <p>
                To recover or reset your administrator password, please contact the{' '}
                <strong>Store Owner</strong> or your <strong>System Administrator</strong> directly.
                An authorized administrator can update your credentials securely from the User
                Management console.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/login"
              className="w-full bg-black text-white rounded-lg py-2.5 font-medium flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors shadow-sm"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
