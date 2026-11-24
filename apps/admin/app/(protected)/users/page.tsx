'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminUser } from '../../../features/users/repositories/user-repository';
import { getUsersAction, softDeleteUserAction } from '../../../features/users/actions/user-actions';
import { Plus, Search, Edit, User, UserX } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    const data = await getUsersAction();
    setUsers(data);
    setIsLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchUsers();
  }, []);

  const handleDeactivate = async (id: string, role: string) => {
    if (role === 'Owner') {
      alert('Cannot deactivate the Owner account.');
      return;
    }
    if (confirm('Are you sure you want to deactivate this user?')) {
      await softDeleteUserAction(id);
      fetchUsers();
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Users & Roles</h2>
          <p className="text-sm text-stone-500">Manage access to the Admin Control Panel.</p>
        </div>
        <Link
          href="/users/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-medium text-sm hover:bg-stone-800 transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add User
        </Link>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-xl border border-black/[0.07] shadow-[0_8px_30px_rgb(0,0,0,0.03),inset_0_1px_0_0_rgba(255,255,255,0.9)] overflow-hidden">
        <div className="p-4 border-b border-black/[0.06]">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="w-full pl-9 pr-4 py-2 bg-white/70 backdrop-blur-sm border border-black/10 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-black/[0.02] text-stone-500 font-semibold border-b border-black/[0.06]">
              <tr>
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Last Login</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-stone-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-stone-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-black/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black/[0.04] flex items-center justify-center overflow-hidden shrink-0 border border-black/[0.08]">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-stone-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-black text-sm">{user.name}</div>
                          <div className="text-stone-500 text-xs">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-black/[0.04] border border-black/[0.08] text-xs font-semibold text-black">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-stone-400'}`}
                        ></span>
                        <span className="text-stone-700 font-semibold text-xs">{user.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone-500 text-xs">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/users/${user.id}/edit`}
                          className="p-1.5 text-stone-600 hover:text-black hover:bg-black/5 rounded-lg border border-black/[0.06] transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        {user.role !== 'Owner' && (
                          <button
                            onClick={() => handleDeactivate(user.id, user.role)}
                            className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                            title="Deactivate User"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
