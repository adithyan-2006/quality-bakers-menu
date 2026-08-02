export interface DashboardStats {
  totalCategories: number;
  totalProducts: number;
  featuredProducts: number;
  hiddenCategories: number;
  recentActivityCount: number;
}

export const DashboardRepository = {
  getStats: async (): Promise<DashboardStats> => {
    // Return mock data for Sprint 3.0 foundation
    return {
      totalCategories: 12,
      totalProducts: 148,
      featuredProducts: 24,
      hiddenCategories: 2,
      recentActivityCount: 15,
    };
  },
};
