export type MediaType = 'image' | 'video' | 'document';
export type MediaStatus = 'ready' | 'processing' | 'error';

export interface MediaUsage {
  id: string; // The ID of the item using the media (e.g. product ID or category ID)
  type: 'product' | 'category' | 'page';
  name: string; // Display name of the item
}

export interface AdminMedia {
  id: string;
  fileName: string;
  displayName: string;
  altText: string;
  type: MediaType;
  imageUrl: string;
  thumbnailUrl: string;
  size: number; // in bytes
  width: number;
  height: number;
  isUsed: boolean;
  usedBy: MediaUsage[];
  tags: string[];
  status: MediaStatus;
  uploadedAt: string;
  updatedAt: string;
}

// In-memory store for optimistic updates during Sprint 3.3
const mockMedia: AdminMedia[] = [
  {
    id: 'media_1',
    fileName: 'vanilla-scoop-hero.jpg',
    displayName: 'Vanilla Scoop Hero',
    altText: 'A close up of premium vanilla bean ice cream scoop',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1557142046-c704a3adf364?w=1600&h=1200&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557142046-c704a3adf364?w=400&h=400&fit=crop',
    size: 1450000, // 1.45MB
    width: 1600,
    height: 1200,
    isUsed: true,
    usedBy: [{ id: 'prod_1', type: 'product', name: 'Vanilla Scoop' }],
    tags: ['ice cream', 'product', 'hero'],
    status: 'ready',
    uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'media_2',
    fileName: 'strawberry-smoothie.jpg',
    displayName: 'Strawberry Smoothie Promo',
    altText: 'Fresh strawberry smoothie in a tall glass with a straw',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1626074961596-caa96fa1a115?w=1600&h=1200&fit=crop',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1626074961596-caa96fa1a115?w=400&h=400&fit=crop',
    size: 2100000,
    width: 1600,
    height: 1200,
    isUsed: true,
    usedBy: [
      { id: 'prod_2', type: 'product', name: 'Strawberry Smoothie' },
      { id: 'cat_2', type: 'category', name: 'Smoothies' },
    ],
    tags: ['smoothie', 'category-cover', 'strawberry'],
    status: 'ready',
    uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'media_3',
    fileName: 'chocolate-drizzle.jpg',
    displayName: 'Chocolate Drizzle Action',
    altText: 'Pouring rich chocolate syrup over a dessert',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1600326145359-3a45c8147573?w=1600&h=1200&fit=crop',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1600326145359-3a45c8147573?w=400&h=400&fit=crop',
    size: 3500000,
    width: 2400,
    height: 1600,
    isUsed: false,
    usedBy: [],
    tags: ['chocolate', 'action', 'unused'],
    status: 'ready',
    uploadedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MediaRepository = {
  getMedia: async (): Promise<AdminMedia[]> => {
    // Sort newest first by default
    return [...mockMedia].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    );
  },

  getMediaById: async (id: string): Promise<AdminMedia | null> => {
    return mockMedia.find((m) => m.id === id) || null;
  },

  updateMedia: async (id: string, data: Partial<AdminMedia>): Promise<AdminMedia> => {
    const index = mockMedia.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Media not found');

    mockMedia[index] = {
      ...mockMedia[index],
      ...(data as any),
      updatedAt: new Date().toISOString(),
    };

    return mockMedia[index]!;
  },

  deleteMedia: async (id: string): Promise<void> => {
    const index = mockMedia.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Media not found');

    if (mockMedia[index]!.isUsed) {
      throw new Error('Cannot delete media that is currently in use');
    }

    mockMedia.splice(index, 1);
  },

  simulateUpload: async (file: File): Promise<AdminMedia> => {
    // This mocks the Cloudinary upload process for Sprint 3.3
    const newMedia: AdminMedia = {
      id: `media_${Date.now()}`,
      fileName: file.name,
      displayName: file.name.split('.')[0] || 'Uploaded Image',
      altText: '',
      type: 'image',
      imageUrl:
        'https://images.unsplash.com/photo-1495147466023-e6a463722526?w=1600&h=1200&fit=crop', // Placeholder baking image
      thumbnailUrl:
        'https://images.unsplash.com/photo-1495147466023-e6a463722526?w=400&h=400&fit=crop',
      size: file.size,
      width: 1600,
      height: 1200,
      isUsed: false,
      usedBy: [],
      tags: ['newly-uploaded'],
      status: 'ready',
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockMedia.unshift(newMedia); // Add to top
    return newMedia;
  },
};
