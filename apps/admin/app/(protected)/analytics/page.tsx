import { AnalyticsRepository } from '../../../features/analytics/repositories/prisma-analytics-repo';
import { AnalyticsDashboardView } from '../../../features/analytics/components/analytics-dashboard-view';
import { requireAdminUser } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  await requireAdminUser();
  const analyticsSummary = await AnalyticsRepository.getSummary(30);

  return (
    <div className="space-y-6">
      <AnalyticsDashboardView initialSummary={analyticsSummary} />
    </div>
  );
}
