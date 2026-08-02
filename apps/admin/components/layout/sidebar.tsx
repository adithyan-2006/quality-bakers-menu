'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  MenuSquare,
  Package,
  Image as ImageIcon,
  Home,
  Briefcase,
  Palette,
  Settings,
  Users,
  Menu,
  X,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { SidebarItem } from '../navigation/sidebar-item';
import { useAuth } from '../providers/auth-provider';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleSidebar = () => setIsOpen(!isOpen);

  if (!user) return null; // Wait for auth

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-md shadow-sm"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      >
        <div className="h-16 flex items-center px-6 border-b border-stone-200 dark:border-stone-800">
          <h1 className="text-lg font-serif font-semibold tracking-wide">Admin Panel</h1>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          <div>
            <SidebarItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" />
          </div>

          <div>
            <h3 className="px-3 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              Menu Management
            </h3>
            <div className="space-y-1">
              <SidebarItem icon={MenuSquare} label="Categories" href="/categories" />
              <SidebarItem icon={Package} label="Products" href="/products" />
            </div>
          </div>

          <div>
            <h3 className="px-3 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              System
            </h3>
            <div className="space-y-1">
              {['Owner', 'Manager'].includes(user.role) && (
                <SidebarItem icon={Home} label="Homepage" href="/homepage" />
              )}
              <SidebarItem icon={ImageIcon} label="Media Library" href="/media" />
              {['Owner', 'Manager'].includes(user.role) && (
                <SidebarItem icon={Briefcase} label="Business Info" href="/business" />
              )}
              {['Owner', 'Manager'].includes(user.role) && (
                <SidebarItem icon={Palette} label="Appearance" href="/appearance" />
              )}
              {user.role === 'Owner' && (
                <SidebarItem icon={Users} label="Users & Roles" href="/users" />
              )}
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-stone-200 dark:border-stone-800 space-y-1">
          <SidebarItem icon={Settings} label="Settings" href="/settings" />
        </div>

        {/* User Profile Area */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/50">
          <div className="flex items-center justify-between">
            <Link
              href="/profile"
              className="flex items-center gap-3 flex-1 min-w-0 group cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden bg-stone-200 dark:bg-stone-800 flex items-center justify-center shrink-0 border border-stone-200 dark:border-stone-700">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-4 h-4 text-stone-400" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-stone-900 dark:text-stone-50 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-stone-500 truncate">{user.role}</p>
              </div>
            </Link>
            <button
              onClick={logout}
              className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
