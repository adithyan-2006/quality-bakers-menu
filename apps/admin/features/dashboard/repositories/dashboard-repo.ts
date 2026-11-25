import { prisma } from '@qbm/database';

export interface DashboardStats {
  totalCategories: number;
  totalProducts: number;
  featuredProducts: number;
  hiddenCategories: number;
  recentActivityCount: number;
}

export const DashboardRepository = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const [
        totalCategories,
        totalProducts,
        featuredProducts,
        hiddenCategories,
        recentActivityCount,
      ] = await Promise.all([
        prisma.category.count(),
        prisma.product.count(),
        prisma.product.count({ where: { isFeatured: true } }),
        prisma.category.count({ where: { isVisible: false } }),
        prisma.auditLog.count(),
      ]);

      return {
        totalCategories,
        totalProducts,
        featuredProducts,
        hiddenCategories,
        recentActivityCount,
      };
    } catch (error) {
      console.warn('[DashboardRepository] Error fetching dashboard stats, using fallbacks:', error);
      return {
        totalCategories: 0,
        totalProducts: 0,
        featuredProducts: 0,
        hiddenCategories: 0,
        recentActivityCount: 0,
      };
    }
  },
};
