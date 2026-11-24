import { DashboardRepository } from '../../../features/dashboard/repositories/dashboard-repo';
import { AnalyticsRepository } from '../../../features/analytics/repositories/prisma-analytics-repo';
import { AnalyticsDashboardView } from '../../../features/analytics/components/analytics-dashboard-view';
import { StatCard } from '../../../components/cards/stat-card';
import { LayoutGrid, Package, Star, EyeOff } from 'lucide-react';
import { requireAdminUser } from '../../../lib/auth';
import { MaintenanceAlertBanner } from '../../../components/maintenance/maintenance-alert-banner';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  await requireAdminUser();

  const [stats, analyticsSummary] = await Promise.all([
    DashboardRepository.getStats(),
    AnalyticsRepository.getSummary(30),
  ]);

  return (
    <div className="space-y-8">
      {/* Maintenance Mode Alert Banner (Visible when active) */}
      <MaintenanceAlertBanner />

      {/* Website Traffic & Visitor Analytics Section (Primary) */}
      <section>
        <AnalyticsDashboardView initialSummary={analyticsSummary} />
      </section>

      {/* Menu Inventory Overview Section */}
      <section className="space-y-4 pt-6 border-t border-black/[0.08]">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-black">Menu & Inventory Overview</h3>
          <p className="text-sm text-stone-600 mt-1">
            Summary of active menu items and catalog status.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Categories" value={stats.totalCategories} icon={LayoutGrid} />
          <StatCard title="Total Products" value={stats.totalProducts} icon={Package} />
          <StatCard title="Featured Products" value={stats.featuredProducts} icon={Star} />
          <StatCard title="Hidden Categories" value={stats.hiddenCategories} icon={EyeOff} />
        </div>
      </section>
    </div>
  );
}
