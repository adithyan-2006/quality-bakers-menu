export type HomepageStatus = 'draft' | 'published';

export interface HomepageHero {
  title: string;
  subtitle: string;
  image: string;
  imageId?: string;
  ctaText: string;
  ctaLink: string;
}

export interface HomepageAbout {
  title: string;
  description: string;
  image: string;
  imageId?: string;
}

export interface HomepageStory {
  title: string;
  description: string;
}

export interface HomepageBanner {
  enabled: boolean;
  title: string;
  description: string;
  image: string;
  imageId?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor?: string;
}

export interface AdminHomepage {
  id: string;
  hero: HomepageHero;
  featuredCollections: string[]; // Category IDs
  featuredCategories: string[]; // Category IDs
  about: HomepageAbout;
  story: HomepageStory;
  seasonalBanner: HomepageBanner;
  promotionBanner: HomepageBanner;
  status: HomepageStatus;
  updatedAt: string;
  publishedAt: string | null;
}

// Initial mock data
let mockHomepage: AdminHomepage = {
  id: 'homepage_1',
  hero: {
    title: 'Freshly Baked Memories',
    subtitle: 'Experience the magic of artisanal baking, crafted with love every single day.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&h=900&fit=crop',
    ctaText: 'Explore Menu',
    ctaLink: '/menu',
  },
  featuredCollections: ['cat_1', 'cat_2'], // Mock IDs
  featuredCategories: ['cat_3', 'cat_4', 'cat_5'], // Mock IDs
  about: {
    title: 'Our Craft',
    description:
      'Every morning, before the sun rises, our master bakers begin the delicate process of crafting perfect pastries. We source only the finest local ingredients.',
    image: 'https://images.unsplash.com/photo-1555507036-ab1e4006aaeb?w=1200&h=800&fit=crop',
  },
  story: {
    title: 'A Family Tradition',
    description:
      'Since 1985, our bakery has been the heart of the community. What started as a small kitchen has grown into a destination for lovers of fine baked goods.',
  },
  seasonalBanner: {
    enabled: true,
    title: 'Summer Berry Collection',
    description:
      'Bright, fresh, and perfectly sweet. Try our new seasonal strawberry and blueberry pastries.',
    image: 'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=1200&h=400&fit=crop',
  },
  promotionBanner: {
    enabled: false,
    title: 'Weekend Special',
    description: 'Buy any two large pastries, get a coffee free.',
    image: '',
    buttonText: 'Order Now',
    backgroundColor: '#fff0e6',
  },
  status: 'published',
  updatedAt: new Date().toISOString(),
  publishedAt: new Date().toISOString(),
};

export const HomepageRepository = {
  getHomepage: async (): Promise<AdminHomepage> => {
    return { ...mockHomepage };
  },

  updateHomepage: async (data: Partial<AdminHomepage>): Promise<AdminHomepage> => {
    mockHomepage = {
      ...mockHomepage,
      ...data,
      updatedAt: new Date().toISOString(),
      ...(data.status === 'published' ? { publishedAt: new Date().toISOString() } : {}),
    };
    return { ...mockHomepage };
  },
};
