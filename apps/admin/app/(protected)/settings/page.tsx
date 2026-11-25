import { MaintenanceToggle } from '@/components/maintenance/maintenance-toggle';
import { requireAdminUser } from '@/lib/auth';
import { getMaintenanceStatus } from '@/lib/maintenance-store';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  await requireAdminUser();
  const maintenanceConfig = await getMaintenanceStatus();

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900">System Settings</h2>
        <p className="text-sm text-stone-500">
          Manage platform availability, maintenance status, and store configurations.
        </p>
      </div>

      {/* Maintenance Mode & Availability Section */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-stone-900">Platform Availability</h3>
          <p className="text-xs text-stone-500">
            Control public access to the bakery menu and customer storefront during deployments or
            updates.
          </p>
        </div>

        <MaintenanceToggle variant="full" initialConfig={maintenanceConfig} />
      </section>
    </div>
  );
}
