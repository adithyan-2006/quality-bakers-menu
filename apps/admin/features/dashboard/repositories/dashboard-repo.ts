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
      const rows = await prisma.$queryRaw<
        Array<{
          totalCategories: number;
          totalProducts: number;
          featuredProducts: number;
          hiddenCategories: number;
          recentActivityCount: number;
        }>
      >`
        SELECT
          (SELECT COUNT(*)::int FROM "Category") AS "totalCategories",
          (SELECT COUNT(*)::int FROM "Product") AS "totalProducts",
          (SELECT COUNT(*)::int FROM "Product" WHERE "isFeatured" = true) AS "featuredProducts",
          (SELECT COUNT(*)::int FROM "Category" WHERE "isVisible" = false) AS "hiddenCategories",
          (SELECT COUNT(*)::int FROM "AuditLog") AS "recentActivityCount"
      `;

      const row = rows[0];
      return {
        totalCategories: Number(row?.totalCategories ?? 0),
        totalProducts: Number(row?.totalProducts ?? 0),
        featuredProducts: Number(row?.featuredProducts ?? 0),
        hiddenCategories: Number(row?.hiddenCategories ?? 0),
        recentActivityCount: Number(row?.recentActivityCount ?? 0),
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
