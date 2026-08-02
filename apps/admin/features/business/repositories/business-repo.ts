export type BusinessStatus = 'Open' | 'Closed' | 'Holiday' | 'Temporarily Closed';

export interface DayHours {
  isClosed: boolean;
  openTime: string; // HH:mm
  closeTime: string; // HH:mm
}

export interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
  holidayHours: string;
}

export interface AdminBusiness {
  id: string;
  // General
  name: string;
  tagline: string;
  description: string;
  businessStatus: BusinessStatus;

  // Brand
  logo: string;
  favicon: string;
  coverImage: string;

  // Contact
  phone: string;
  whatsapp: string;
  email: string;
  website: string;

  // Address
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  googleMapsUrl: string;
  latitude: number | null;
  longitude: number | null;

  // Hours
  hours: BusinessHours;

  // Social
  instagram: string;
  facebook: string;
  youtube: string;
  x: string;
  threads: string;
  linkedin: string;

  // SEO
  seoTitle: string;
  seoDescription: string;
  keywords: string;

  // Metadata
  status: 'draft' | 'published';
  updatedAt: string;
  publishedAt: string | null;
}

const defaultHours: DayHours = { isClosed: false, openTime: '08:00', closeTime: '20:00' };

let mockBusiness: AdminBusiness = {
  id: 'biz_main',
  name: 'Quality Bakers',
  tagline: 'Artisanal Baking & Craft Beverages',
  description:
    'A family-owned bakery dedicated to crafting perfect pastries, fresh breads, and signature beverages daily.',
  businessStatus: 'Open',
  logo: '',
  favicon: '',
  coverImage: 'https://images.unsplash.com/photo-1555507036-ab1e4006aaeb?w=1200&h=800&fit=crop',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  email: 'hello@qualitybakers.com',
  website: 'https://qualitybakers.com',
  street: '123 Baker Street',
  city: 'Mumbai',
  state: 'Maharashtra',
  country: 'India',
  postalCode: '400001',
  googleMapsUrl: 'https://maps.google.com',
  latitude: null,
  longitude: null,
  hours: {
    monday: { ...defaultHours },
    tuesday: { ...defaultHours },
    wednesday: { ...defaultHours },
    thursday: { ...defaultHours },
    friday: { ...defaultHours },
    saturday: { isClosed: false, openTime: '09:00', closeTime: '22:00' },
    sunday: { isClosed: false, openTime: '09:00', closeTime: '15:00' },
    holidayHours: 'Check our social media for specific holiday timings.',
  },
  instagram: 'https://instagram.com/qualitybakers',
  facebook: '',
  youtube: '',
  x: '',
  threads: '',
  linkedin: '',
  seoTitle: 'Quality Bakers | Artisanal Bakery in Mumbai',
  seoDescription:
    'Visit Quality Bakers for fresh bread, pastries, and signature faloodas. Baked fresh daily.',
  keywords: 'bakery, fresh bread, pastries, cakes, falooda, mumbai',
  status: 'published',
  updatedAt: new Date().toISOString(),
  publishedAt: new Date().toISOString(),
};

export const BusinessRepository = {
  getBusiness: async (): Promise<AdminBusiness> => {
    return { ...mockBusiness };
  },

  updateBusiness: async (data: Partial<AdminBusiness>): Promise<AdminBusiness> => {
    mockBusiness = {
      ...mockBusiness,
      ...data,
      updatedAt: new Date().toISOString(),
      ...(data.status === 'published' ? { publishedAt: new Date().toISOString() } : {}),
    };
    return { ...mockBusiness };
  },
};
