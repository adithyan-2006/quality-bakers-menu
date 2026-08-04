import { AdminBusiness, BusinessHours, BusinessStatus } from './business-repo';
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
      businessStatus: (biz.businessStatus === 'OPEN'
        ? 'Open'
        : biz.businessStatus === 'CLOSED'
          ? 'Closed'
          : biz.businessStatus === 'HOLIDAY'
            ? 'Holiday'
            : 'Temporarily Closed') as BusinessStatus,
      logo: biz.logo?.optimizedUrl || biz.logo?.originalUrl || '',
      logoId: biz.logoId ?? null,
      favicon: biz.favicon || '',
      coverImage: biz.coverImage?.optimizedUrl || biz.coverImage?.originalUrl || '',
      coverImageId: biz.coverImageId ?? null,
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

  updateBusiness: async (data: Partial<AdminBusiness>): Promise<AdminBusiness> => {
    try {
      const current = await PrismaBusinessRepository.getBusiness();
      const updateData: any = {
        name: data.name,
        tagline: data.tagline,
        description: data.description,
        businessStatus: data.businessStatus
          ? data.businessStatus === 'Open'
            ? 'OPEN'
            : data.businessStatus === 'Closed'
              ? 'CLOSED'
              : data.businessStatus === 'Holiday'
                ? 'HOLIDAY'
                : 'TEMPORARILY_CLOSED'
          : undefined,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        website: data.website,
        street: data.street,
        city: data.city,
        state: data.state,
        country: data.country,
        postalCode: data.postalCode,
        googleMapsUrl: data.googleMapsUrl,
        latitude: data.latitude,
        longitude: data.longitude,
        hours: data.hours as any,
        instagram: data.instagram,
        facebook: data.facebook,
        youtube: data.youtube,
        x: data.x,
        threads: data.threads,
        linkedin: data.linkedin,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        keywords: data.keywords,
        status: data.status ? (data.status === 'published' ? 'PUBLISHED' : 'DRAFT') : undefined,
      };

      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key],
      );

      const updated = await prisma.business.update({
        where: { id: current.id },
        data: updateData,
      });

      const result = await PrismaBusinessRepository.getBusiness();

      // We don't have a specific logged in user yet since auth isn't integrated, so we use 'system'
      import('../../audit/services/audit-service').then((m) => {
        m.AuditService.logAction('system', 'UPDATE', 'BUSINESS', updated.id, current, result);
      });

      return result;
    } catch (error: any) {
      const { RepositoryError } = await import('../../../lib/errors');
      throw new RepositoryError('Failed to update business', error);
    }
  },
};
