import { AdminBusiness, BusinessHours } from './business-repo';
import { prisma } from '@qbm/database';

export const PrismaBusinessRepository = {
  getBusiness: async (): Promise<AdminBusiness> => {
    const biz = await prisma.business.findFirst({
      include: {
        logo: true,
        coverImage: true,
      },
    });

    if (!biz) {
      throw new Error('Business not found');
    }

    return {
      id: biz.id,
      name: biz.name,
      tagline: biz.tagline,
      description: biz.description,
      businessStatus: biz.businessStatus as any, // Typecast to UI type
      logo: biz.logo?.optimizedUrl || biz.logo?.originalUrl || '',
      favicon: biz.favicon || '',
      coverImage: biz.coverImage?.optimizedUrl || biz.coverImage?.originalUrl || '',
      phone: biz.phone,
      whatsapp: biz.whatsapp,
      email: biz.email,
      website: biz.website,
      street: biz.street,
      city: biz.city,
      state: biz.state,
      country: biz.country,
      postalCode: biz.postalCode,
      googleMapsUrl: biz.googleMapsUrl,
      latitude: biz.latitude,
      longitude: biz.longitude,
      hours: biz.hours as unknown as BusinessHours,
      instagram: biz.instagram || '',
      facebook: biz.facebook || '',
      youtube: biz.youtube || '',
      x: biz.x || '',
      threads: biz.threads || '',
      linkedin: biz.linkedin || '',
      seoTitle: biz.seoTitle || '',
      seoDescription: biz.seoDescription || '',
      keywords: biz.keywords || '',
      status: biz.status === 'PUBLISHED' ? 'published' : 'draft',
      updatedAt: biz.updatedAt.toISOString(),
      publishedAt: biz.publishedAt?.toISOString() || null,
    };
  },

  updateBusiness: async (_data: Partial<AdminBusiness>): Promise<AdminBusiness> => {
    // This will be implemented fully in Sprint 4.1
    // For now, it satisfies the interface
    throw new Error('Not implemented in Prisma yet');
  },
};
