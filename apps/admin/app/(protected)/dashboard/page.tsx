import { DashboardRepository } from '../../../features/dashboard/repositories/dashboard-repo';
import { StatCard } from '../../../components/cards/stat-card';
import { LayoutGrid, Package, Star, EyeOff, Activity } from 'lucide-react';

export default async function DashboardPage() {
  const stats = await DashboardRepository.getStats();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-stone-500">Overview of your menu performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Categories"
          value={stats.totalCategories}
          icon={LayoutGrid}
          trend={{ value: '2', isPositive: true }}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          trend={{ value: '14', isPositive: true }}
        />
        <StatCard title="Featured Products" value={stats.featuredProducts} icon={Star} />
        <StatCard title="Hidden Categories" value={stats.hiddenCategories} icon={EyeOff} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 shadow-sm min-h-[300px] flex flex-col items-center justify-center text-center">
          <Activity className="w-8 h-8 text-stone-400 mb-4" />
          <h3 className="text-lg font-medium">Recent Activity</h3>
          <p className="text-sm text-stone-500 mt-1">Activity feed placeholder</p>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 shadow-sm min-h-[300px] flex flex-col items-center justify-center text-center">
          <Package className="w-8 h-8 text-stone-400 mb-4" />
          <h3 className="text-lg font-medium">Recently Updated</h3>
          <p className="text-sm text-stone-500 mt-1">Recently updated items placeholder</p>
        </div>
      </div>
    </div>
  );
}
