export interface AdminCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  coverImage: string; // The URL for preview
  coverImageId: string | null; // The Media foreign key
  theme: string;
  layoutType: string;
  animationPreset: string;
  displayOrder: number;
  status: 'draft' | 'published' | 'hidden';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  deletedAt?: string;
  isFeatured: boolean;
  isVisible: boolean;
  productCount: number;
  accentColor?: string;
}

// In-memory store for optimistic updates during Sprint 3.1
const mockCategories: AdminCategory[] = [
  {
    id: 'cat_1',
    slug: 'ice-cream-shake',
    name: 'Ice Cream Shake',
    description:
      'Thick, creamy, and blended to perfection. Our premium milkshakes are made with real ice cream and fresh ingredients.',
    coverImage: '/placeholder-shake.jpg',
    coverImageId: null,
    theme: 'vibrant',
    layoutType: 'editorial-grid',
    animationPreset: 'fade-up',
    displayOrder: 0,
    status: 'published',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    publishedAt: '2024-01-01T00:00:00Z',
    isFeatured: true,
    isVisible: true,
    productCount: 12,
  },
  {
    id: 'cat_2',
    slug: 'smoothies',
    name: 'Smoothies',
    description: 'Fresh fruit smoothies blended fresh every day.',
    coverImage: '/placeholder-smoothie.jpg',
    coverImageId: null,
    theme: 'fresh',
    layoutType: 'gallery-wall',
    animationPreset: 'reveal',
    displayOrder: 1,
    status: 'published',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    publishedAt: '2024-01-02T00:00:00Z',
    isFeatured: false,
    isVisible: true,
    productCount: 8,
  },
  {
    id: 'cat_3',
    slug: 'seasonal-specials',
    name: 'Seasonal Specials',
    description: 'Limited time offerings crafted for the season.',
    coverImage: '/placeholder-seasonal.jpg',
    coverImageId: null,
    theme: 'warm',
    layoutType: 'spotlight',
    animationPreset: 'fade-up',
    displayOrder: 2,
    status: 'draft',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-05T00:00:00Z',
    isFeatured: false,
    isVisible: false,
    productCount: 3,
  },
];

export const CategoryRepository = {
  getCategories: async (): Promise<AdminCategory[]> => {
    // Return sorted by displayOrder
    return [...mockCategories].sort((a, b) => a.displayOrder - b.displayOrder);
  },

  getCategory: async (id: string): Promise<AdminCategory | null> => {
    return mockCategories.find((c) => c.id === id) || null;
  },

  createCategory: async (data: Partial<AdminCategory>): Promise<AdminCategory> => {
    const newCategory: AdminCategory = {
      id: `cat_${Date.now()}`,
      slug: data.slug || data.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'new-category',
      name: data.name || 'New Category',
      description: data.description || '',
      coverImage: data.coverImage || '',
      coverImageId: data.coverImageId || null,
      theme: data.theme || 'classic',
      layoutType: data.layoutType || 'editorial-grid',
      animationPreset: data.animationPreset || 'fade-up',
      displayOrder: mockCategories.length,
      status: data.status || 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFeatured: data.isFeatured || false,
      isVisible: data.isVisible ?? true,
      productCount: 0,
    };

    if (data.accentColor) {
      newCategory.accentColor = data.accentColor;
    }

    mockCategories.push(newCategory);
    return newCategory;
  },

  updateCategory: async (id: string, data: Partial<AdminCategory>): Promise<AdminCategory> => {
    const index = mockCategories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Category not found');

    mockCategories[index] = {
      ...mockCategories[index],
      ...(data as any),
      updatedAt: new Date().toISOString(),
    };

    return mockCategories[index]!;
  },

  updateDisplayOrder: async (items: { id: string; displayOrder: number }[]): Promise<void> => {
    items.forEach(({ id, displayOrder }) => {
      const category = mockCategories.find((c) => c.id === id);
      if (category) {
        category.displayOrder = displayOrder;
        category.updatedAt = new Date().toISOString();
      }
    });
  },
};
