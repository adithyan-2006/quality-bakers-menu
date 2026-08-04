export type BadgeType = 'none' | 'signature' | 'best-seller' | 'new' | 'seasonal' | 'chefs-choice';
export type AvailabilityStatus = 'available' | 'out-of-stock' | 'seasonal';
export type ProductStatus = 'draft' | 'published' | 'hidden';

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string; // Future use
  price: number;
  categoryId: string;
  image: string; // The URL for preview
  imageId?: string; // The Media foreign key
  galleryIds?: string[]; // Media foreign keys for gallery
  galleryImages?: string[]; // URLs for preview
  badge: BadgeType;
  isFeatured: boolean;
  isVisible: boolean; // Repository flag mapped to "Availability" visually
  availabilityStatus: AvailabilityStatus; // Semantic mapping for bakery
  status: ProductStatus;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  deletedAt?: string;
}

// In-memory store for optimistic updates during Sprint 3.2
const mockProducts: AdminProduct[] = [
  {
    id: 'prod_1',
    name: 'Vanilla Scoop',
    slug: 'vanilla-scoop',
    shortDescription: 'Classic Madagascar vanilla bean ice cream.',
    longDescription: '',
    price: 180,
    categoryId: 'cat_1', // Mapped to Ice Cream Shake/Scoops depending on real data
    image: '',
    badge: 'signature',
    isFeatured: true,
    isVisible: true,
    availabilityStatus: 'available',
    status: 'published',
    displayOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  },
  {
    id: 'prod_2',
    name: 'Strawberry Smoothie',
    slug: 'strawberry-smoothie',
    shortDescription: 'Fresh strawberries blended with yogurt.',
    longDescription: '',
    price: 220,
    categoryId: 'cat_2', // Smoothies
    image: '',
    badge: 'best-seller',
    isFeatured: true,
    isVisible: true,
    availabilityStatus: 'available',
    status: 'published',
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  },
  {
    id: 'prod_3',
    name: 'Mango Frappe',
    slug: 'mango-frappe',
    shortDescription: 'A rich seasonal mango blend.',
    longDescription: '',
    price: 250,
    categoryId: 'cat_3', // Seasonal
    image: '',
    badge: 'seasonal',
    isFeatured: false,
    isVisible: false,
    availabilityStatus: 'seasonal',
    status: 'draft',
    displayOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const ProductRepository = {
  getProducts: async (): Promise<AdminProduct[]> => {
    return [...mockProducts].sort((a, b) => a.displayOrder - b.displayOrder);
  },

  getProduct: async (id: string): Promise<AdminProduct | null> => {
    return mockProducts.find((p) => p.id === id) || null;
  },

  createProduct: async (data: Partial<AdminProduct>): Promise<AdminProduct> => {
    const newProduct: AdminProduct = {
      id: `prod_${Date.now()}`,
      slug: data.slug || data.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'new-product',
      name: data.name || 'New Product',
      shortDescription: data.shortDescription || '',
      longDescription: data.longDescription || '',
      price: data.price ?? 0,
      categoryId: data.categoryId || '',
      image: data.image || '',
      badge: data.badge || 'none',
      isFeatured: data.isFeatured ?? false,
      isVisible: data.isVisible ?? true,
      availabilityStatus: data.availabilityStatus || 'available',
      status: data.status || 'draft',
      displayOrder: mockProducts.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockProducts.push(newProduct);
    return newProduct;
  },

  updateProduct: async (id: string, data: Partial<AdminProduct>): Promise<AdminProduct> => {
    const index = mockProducts.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Product not found');

    mockProducts[index] = {
      ...mockProducts[index],
      ...(data as any),
      updatedAt: new Date().toISOString(),
    };

    return mockProducts[index]!;
  },

  duplicateProduct: async (id: string): Promise<AdminProduct> => {
    const source = await ProductRepository.getProduct(id);
    if (!source) throw new Error('Product not found');

    const newName = `${source.name} (Copy)`;

    const newProduct = { ...source } as Partial<AdminProduct>;
    delete newProduct.id;
    delete newProduct.createdAt;
    delete newProduct.updatedAt;
    delete newProduct.publishedAt;
    delete newProduct.deletedAt;

    return ProductRepository.createProduct({
      ...(newProduct as any),
      name: newName,
      slug: newName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    });
  },

  updateDisplayOrder: async (items: { id: string; displayOrder: number }[]): Promise<void> => {
    items.forEach(({ id, displayOrder }) => {
      const product = mockProducts.find((p) => p.id === id);
      if (product) {
        product.displayOrder = displayOrder;
        product.updatedAt = new Date().toISOString();
      }
    });
  },
};
