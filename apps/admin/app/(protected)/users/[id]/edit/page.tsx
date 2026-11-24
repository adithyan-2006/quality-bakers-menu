'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  AdminUser,
  AdminRole,
  UserStatus,
} from '../../../../../features/users/repositories/user-repository';
import {
  getUserByIdAction,
  updateUserAction,
} from '../../../../../features/users/actions/user-actions';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function EditUserPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [user, setUser] = useState<AdminUser | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState<AdminRole>('Staff');
  const [status, setStatus] = useState<UserStatus>('Active');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getUserByIdAction(id).then((data) => {
      if (!data) {
        router.push('/users');
        return;
      }
      setUser(data);
      setName(data.name);
      setRole(data.role);
      setStatus(data.status);
      setIsLoading(false);
    });
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role === 'Owner' && role !== 'Owner') {
      alert('Cannot change the role of the Owner account.');
      return;
    }
    if (user?.role === 'Owner' && status !== 'Active') {
      alert('Cannot deactivate the Owner account.');
      return;
    }

    setIsSaving(true);
    try {
      await updateUserAction(id, { name, role, status });
      router.push('/users');
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-stone-500">Loading user...</div>;
  if (!user) return null;

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
        <h2 className="text-2xl font-semibold tracking-tight">Edit User</h2>
        <p className="text-sm text-stone-500">Update access and details for {user.email}</p>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-xl border border-black/[0.07] shadow-[0_8px_30px_rgb(0,0,0,0.03),inset_0_1px_0_0_rgba(255,255,255,0.9)] overflow-hidden p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white/70 backdrop-blur-sm px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
              disabled={user.role === 'Owner'}
              className="w-full rounded-lg border border-black/10 bg-white/70 backdrop-blur-sm px-3 py-2 text-sm text-stone-900 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="Staff">Staff (Products, Categories, Media)</option>
              <option value="Manager">Manager (All content, no user management)</option>
              <option value="Owner">Owner (Full access)</option>
            </select>
            {user.role === 'Owner' && (
              <p className="text-xs text-stone-500">Owner role cannot be changed directly.</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as UserStatus)}
              disabled={user.role === 'Owner'}
              className="w-full rounded-lg border border-black/10 bg-white/70 backdrop-blur-sm px-3 py-2 text-sm text-stone-900 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="Active">Active</option>
              <option value="Disabled">Disabled</option>
            </select>
            {user.role === 'Owner' && (
              <p className="text-xs text-stone-500">Owner account cannot be disabled.</p>
            )}
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
