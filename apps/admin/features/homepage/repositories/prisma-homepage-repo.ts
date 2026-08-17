import { AdminHomepage } from './homepage-repo';
import { prisma, Prisma } from '@qbm/database';
import { RepositoryError } from '../../../lib/errors';
import { AuditService } from '../../audit/services/audit-service';

function mapPrismaHomepage(hp: any): AdminHomepage {
  const sections = hp.sections || [];

  const seasonalSec = sections.find((s: any) => s.type === 'BANNER');
  const promoSec = sections.find((s: any) => s.type === 'PROMOTION');

  return {
    id: hp.id,
    hero: {
      title: hp.heroTitle,
      subtitle: hp.heroSubtitle,
      image: hp.heroImage?.optimizedUrl || hp.heroImage?.originalUrl || '',
      imageId: hp.heroImageId || undefined,
      ctaText: hp.heroCtaText || '',
      ctaLink: hp.heroCtaLink || '',
    },

    // Featured Categories now use the junction table, we mapped it to return categoryId
    featuredCategories: hp.featuredCategories?.map((fc: any) => fc.categoryId) || [],
    about: {
      title: hp.aboutTitle || '',
      description: hp.aboutDescription || '',
    },
    story: {
      title: hp.storyTitle || '',
      description: hp.storyDescription || '',
    },
    seasonalBanner: {
      enabled: seasonalSec?.enabled || false,
      title: seasonalSec?.title || '',
      description: seasonalSec?.description || '',
      image: seasonalSec?.image?.optimizedUrl || seasonalSec?.image?.originalUrl || '',
      imageId: seasonalSec?.imageId || undefined,
      buttonText: seasonalSec?.buttonText || undefined,
      buttonLink: seasonalSec?.buttonLink || undefined,
      backgroundColor: seasonalSec?.backgroundColor || undefined,
    },
    promotionBanner: {
      enabled: promoSec?.enabled || false,
      title: promoSec?.title || '',
      description: promoSec?.description || '',
      image: promoSec?.image?.optimizedUrl || promoSec?.image?.originalUrl || '',
      imageId: promoSec?.imageId || undefined,
      buttonText: promoSec?.buttonText || undefined,
      buttonLink: promoSec?.buttonLink || undefined,
      backgroundColor: promoSec?.backgroundColor || undefined,
    },
    status: hp.status === 'PUBLISHED' ? 'published' : 'draft',
    updatedAt: hp.updatedAt.toISOString(),
    publishedAt: hp.publishedAt?.toISOString() || null,
  };
}

export const PrismaHomepageRepository = {
  getHomepage: async (): Promise<AdminHomepage> => {
    try {
      const hp = await prisma.homepage.findFirst({
        include: {
          heroImage: true,
          aboutImage: true,
          featuredCategories: {
            orderBy: { displayOrder: 'asc' },
            select: { categoryId: true },
          },
          sections: {
            include: { image: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      if (!hp) {
        throw new RepositoryError('Homepage not found');
      }

      return mapPrismaHomepage(hp);
    } catch (error: any) {
      if (error instanceof RepositoryError) throw error;
      throw new RepositoryError('Failed to fetch homepage', error);
    }
  },

  updateHomepage: async (data: Partial<AdminHomepage>): Promise<AdminHomepage> => {
    let attempts = 0;
    while (attempts < 2) {
      attempts++;
      try {
        const currentHp = await prisma.homepage.findFirst();
        if (!currentHp) {
          throw new RepositoryError('Homepage not found');
        }

        const updateData: any = {};

        if (data.hero) {
          updateData.heroTitle = data.hero.title;
          updateData.heroSubtitle = data.hero.subtitle;
          updateData.heroCtaText = data.hero.ctaText;
          updateData.heroCtaLink = data.hero.ctaLink;
          // Fix hero image removal bug: convert empty string to null
          updateData.heroImageId = data.hero.imageId === '' ? null : data.hero.imageId;
        }

        if (data.about) {
          updateData.aboutTitle = data.about.title;
          updateData.aboutDescription = data.about.description;
        }

        if (data.story) {
          updateData.storyTitle = data.story.title;
          updateData.storyDescription = data.story.description;
        }

        if (data.status) {
          updateData.status = data.status === 'published' ? 'PUBLISHED' : 'DRAFT';
          if (data.status === 'published') {
            updateData.publishedAt = new Date();
          }
        }

        const updated = await prisma.$transaction(
          async (tx: any) => {
            const hp = await tx.homepage.update({
              where: { id: currentHp.id },
              data: updateData,
            });

            // 1. Reconcile Featured Categories
            if (data.featuredCategories) {
              await tx.homepageFeaturedCategory.deleteMany({
                where: { homepageId: currentHp.id },
              });
              if (data.featuredCategories.length > 0) {
                await tx.homepageFeaturedCategory.createMany({
                  data: data.featuredCategories.map((categoryId: string, index: number) => ({
                    homepageId: currentHp.id,
                    categoryId,
                    displayOrder: index,
                  })),
                });
              }
            }

            if (data.seasonalBanner) {
              const banner = await tx.homepageSection.findFirst({
                where: { homepageId: hp.id, type: 'BANNER' },
              });
              if (banner) {
                const bannerData: any = {
                  enabled: data.seasonalBanner.enabled,
                  title: data.seasonalBanner.title,
                  description: data.seasonalBanner.description,
                  buttonText: data.seasonalBanner.buttonText,
                  buttonLink: data.seasonalBanner.buttonLink,
                  backgroundColor: data.seasonalBanner.backgroundColor,
                  imageId: data.seasonalBanner.imageId === '' ? null : data.seasonalBanner.imageId,
                };
                Object.keys(bannerData).forEach(
                  (key) => bannerData[key] === undefined && delete bannerData[key],
                );

                await tx.homepageSection.update({
                  where: { id: banner.id },
                  data: bannerData,
                });
              }
            }

            if (data.promotionBanner) {
              const promo = await tx.homepageSection.findFirst({
                where: { homepageId: hp.id, type: 'PROMOTION' },
              });
              if (promo) {
                const promoData: any = {
                  enabled: data.promotionBanner.enabled,
                  title: data.promotionBanner.title,
                  description: data.promotionBanner.description,
                  buttonText: data.promotionBanner.buttonText,
                  buttonLink: data.promotionBanner.buttonLink,
                  backgroundColor: data.promotionBanner.backgroundColor,
                  imageId:
                    data.promotionBanner.imageId === '' ? null : data.promotionBanner.imageId,
                };
                Object.keys(promoData).forEach(
                  (key) => promoData[key] === undefined && delete promoData[key],
                );

                await tx.homepageSection.update({
                  where: { id: promo.id },
                  data: promoData,
                });
              }
            }

            return tx.homepage.findUnique({
              where: { id: currentHp.id },
              include: {
                heroImage: true,
                aboutImage: true,
                featuredCategories: {
                  orderBy: { displayOrder: 'asc' },
                  select: { categoryId: true },
                },
                sections: {
                  include: { image: true },
                  orderBy: { displayOrder: 'asc' },
                },
              },
            });
          },
          {
            maxWait: 5000,
            timeout: 15000,
          },
        );

        const result = mapPrismaHomepage(updated);
        await AuditService.logAction('system', 'UPDATE', 'HOMEPAGE', result.id, null, result);
        return result;
      } catch (error: any) {
        if (error instanceof RepositoryError && error.message === 'Homepage not found') {
          throw error;
        }

        // Only retry transient connection/transaction errors, not permanent constraint/data errors.
        const isTransient =
          (error instanceof Prisma.PrismaClientKnownRequestError &&
            ['P2024', 'P2028', 'P2034'].includes(error.code)) ||
          error instanceof Prisma.PrismaClientInitializationError;

        if (attempts >= 2 || !isTransient) {
          throw new RepositoryError('Failed to update homepage', error);
        }
        console.warn(
          `[PrismaHomepageRepository] Update attempt ${attempts} failed with transient error, retrying...`,
          error.message || error,
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    throw new RepositoryError('Failed to update homepage');
  },
};
