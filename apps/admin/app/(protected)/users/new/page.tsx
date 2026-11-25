'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminRole } from '../../../../features/users/repositories/user-repository';
import { createUserAction } from '../../../../features/users/actions/user-actions';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function NewUserPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('Staff');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await createUserAction({ name, email, role, status: 'Active' });
      router.push('/users');
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Failed to create user');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="mb-6">
        <Link
          href="/users"
          className="inline-flex items-center text-sm font-semibold text-stone-600 hover:text-black mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Users
        </Link>
        <h2 className="text-2xl font-semibold tracking-tight">Create New User</h2>
        <p className="text-sm text-stone-500">Add a new staff member to the Admin Control Panel.</p>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-xl border border-black/[0.07] shadow-[0_8px_30px_rgb(0,0,0,0.03),inset_0_1px_0_0_rgba(255,255,255,0.9)] overflow-hidden p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full rounded-lg border border-black/10 bg-white/70 backdrop-blur-sm px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@qualitybakers.com"
              className="w-full rounded-lg border border-black/10 bg-white/70 backdrop-blur-sm px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
              className="w-full rounded-lg border border-black/10 bg-white/70 backdrop-blur-sm px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="Staff">Staff (Products, Categories, Media)</option>
              <option value="Manager">Manager (All content, no user management)</option>
              <option value="Owner">Owner (Full access)</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-black/[0.06]">
            <Link
              href="/users"
              className="px-4 py-2 border border-black/10 bg-white/80 text-stone-700 hover:text-black hover:bg-white rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-black text-white rounded-lg font-medium text-sm hover:bg-stone-800 transition-all shadow-sm flex items-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
