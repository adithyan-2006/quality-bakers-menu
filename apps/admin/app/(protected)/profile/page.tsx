'use client';

import { useState } from 'react';
import { useAuth } from '../../../components/providers/auth-provider';
import { updateUserAction } from '../../../features/users/actions/user-actions';
import { changePasswordAction } from '../../../features/auth/actions/auth-actions';
import { MediaPicker } from '../../../features/media/components/media-picker';
import { CollapsibleSection } from '../../../components/ui/collapsible-section';
import { User, Lock, Mail, Phone, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, login } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarId, setAvatarId] = useState(user?.avatarId || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const updatedUser = await updateUserAction(user.id, { name, phone, avatarId });
      login(updatedUser); // Update context
      alert('Profile updated successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPassword) return;
    setIsSaving(true);
    try {
      await changePasswordAction(user.id, newPassword);
      alert('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Your Profile</h2>
        <p className="text-sm text-stone-500">Manage your personal information and security.</p>
      </div>

      <CollapsibleSection title="Personal Information" defaultOpen>
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="flex items-center gap-6 pb-6 border-b border-black/[0.06]">
            <div className="flex-shrink-0">
              <MediaPicker
                value={avatarId}
                onChange={(val) => setAvatarId(val as string)}
                multiple={false}
                trigger={
                  <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-white border border-black/10 flex items-center justify-center">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-stone-400" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/50 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                      Change
                    </div>
                  </div>
                }
              />
            </div>
            <div>
              <h3 className="font-medium">{user.name}</h3>
              <p className="text-sm text-stone-500">{user.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-black/[0.08] bg-white/80 text-black pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black shadow-sm transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address (Read-only)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={user.email}
                  disabled
                  className="w-full rounded-xl border border-black/[0.08] bg-stone-100 text-stone-600 pl-10 pr-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-black/[0.08] bg-white/80 text-black pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black shadow-sm transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
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
      </CollapsibleSection>

      <CollapsibleSection title="Change Password">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-black/[0.08] bg-white/80 text-black pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black shadow-sm transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-black/[0.08] bg-white/80 text-black pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black shadow-sm transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-black text-white rounded-lg font-medium text-sm hover:bg-stone-800 transition-all shadow-sm flex items-center gap-2"
            >
              Update Password
            </button>
          </div>
        </form>
      </CollapsibleSection>
    </div>
  );
}
