import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getMaintenanceStatus } from '@/lib/maintenance-store';
import { ADMIN_SESSION_COOKIE } from '@/lib/auth';
import { MAINTENANCE_HTML } from '@qbm/config';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const cookieStore = await cookies();
  const hasSession = Boolean(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  const maintenance = await getMaintenanceStatus();

  // When maintenance mode is active, unauthenticated visitors to root see the fallback maintenance page
  if (maintenance.enabled && !hasSession) {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: MAINTENANCE_HTML }}
        style={{ width: '100%', minHeight: '100vh', margin: 0, padding: 0 }}
      />
    );
  }

  // Authenticated administrators are routed to the dashboard
  redirect(hasSession ? '/dashboard' : '/login');
}
