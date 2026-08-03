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
          className="inline-flex items-center text-sm font-medium text-stone-500 hover:text-stone-900 dark:hover:text-stone-300 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Users
        </Link>
        <h2 className="text-2xl font-semibold tracking-tight">Edit User</h2>
        <p className="text-sm text-stone-500">Update access and details for {user.email}</p>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
              disabled={user.role === 'Owner'}
              className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm disabled:opacity-50"
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
              className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm disabled:opacity-50"
            >
              <option value="Active">Active</option>
              <option value="Disabled">Disabled</option>
            </select>
            {user.role === 'Owner' && (
              <p className="text-xs text-stone-500">Owner account cannot be disabled.</p>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-stone-100 dark:border-stone-800">
            <Link
              href="/users"
              className="px-4 py-2 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 rounded-md font-medium text-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-stone-900 dark:bg-stone-50 text-stone-50 dark:text-stone-900 rounded-md font-medium text-sm hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors flex items-center gap-2"
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
