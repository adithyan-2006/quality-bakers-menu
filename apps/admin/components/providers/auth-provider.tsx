'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminUser, AdminRole } from '../../features/users/repositories/user-repository';
import { AuthService } from '../../features/auth/services/auth-service';

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  login: (user: AdminUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AuthService.getCurrentUser().then((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
  }, []);

  const login = (newUser: AdminUser) => {
    setUser(newUser);
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export function AuthGuard({
  children,
  requiredRoles = [],
}: {
  children: React.ReactNode;
  requiredRoles?: string[];
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/login?callbackUrl=${pathname}`);
    } else if (
      !isLoading &&
      user &&
      requiredRoles.length > 0 &&
      !AuthService.hasPermission(user, requiredRoles as AdminRole[])
    ) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router, pathname, requiredRoles]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="w-8 h-8 border-4 border-black/10 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  if (requiredRoles.length > 0 && !AuthService.hasPermission(user, requiredRoles as AdminRole[])) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
