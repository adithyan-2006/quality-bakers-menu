export type AdminRole = 'Owner' | 'Manager' | 'Staff';
export type UserStatus = 'Active' | 'Inactive' | 'Disabled';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar: string;
  phone: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
  deletedAt: string | null; // Architecture for soft deletion
}

const mockUsers: AdminUser[] = [
  {
    id: 'user_1',
    name: 'Sarah Bakery',
    email: 'sarah@qualitybakers.com',
    role: 'Owner',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    phone: '+91 98765 43210',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    deletedAt: null,
  },
  {
    id: 'user_2',
    name: 'John Manager',
    email: 'john@qualitybakers.com',
    role: 'Manager',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    phone: '+91 98765 11111',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    deletedAt: null,
  },
];

export const UserRepository = {
  getUsers: async (): Promise<AdminUser[]> => {
    return [...mockUsers.filter((u) => !u.deletedAt)];
  },

  getUserById: async (id: string): Promise<AdminUser | null> => {
    return mockUsers.find((u) => u.id === id && !u.deletedAt) || null;
  },

  getUserByEmail: async (email: string): Promise<AdminUser | null> => {
    return mockUsers.find((u) => u.email === email && !u.deletedAt) || null;
  },

  createUser: async (data: Partial<AdminUser>): Promise<AdminUser> => {
    const newUser: AdminUser = {
      id: `user_${Date.now()}`,
      name: data.name || '',
      email: data.email || '',
      role: data.role || 'Staff',
      avatar: data.avatar || '',
      phone: data.phone || '',
      status: data.status || 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null,
      deletedAt: null,
    };
    mockUsers.push(newUser);
    return newUser;
  },

  updateUser: async (id: string, data: Partial<AdminUser>): Promise<AdminUser> => {
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');

    mockUsers[index] = {
      ...mockUsers[index],
      ...data,
      updatedAt: new Date().toISOString(),
    } as AdminUser;
    return mockUsers[index];
  },

  softDeleteUser: async (id: string): Promise<void> => {
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');

    const user = mockUsers[index];
    if (user!.role === 'Owner') throw new Error('Cannot delete Owner account');

    mockUsers[index] = {
      ...user!,
      status: 'Disabled',
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
};
