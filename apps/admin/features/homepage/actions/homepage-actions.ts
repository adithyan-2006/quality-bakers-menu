'use server';

import { revalidatePath } from 'next/cache';
import { RepositoryFactory } from '../../../lib/repository-factory';
import { AdminHomepage } from '../repositories/homepage-repo';

export async function getHomepageAction() {
  const repo = RepositoryFactory.getHomepageRepository();
  return await repo.getHomepage();
}

export async function updateHomepageAction(data: AdminHomepage) {
  const repo = RepositoryFactory.getHomepageRepository();

  // 1. Write to the database first. If this throws, it propagates to the caller.
  const result = await repo.updateHomepage(data);

  // 2. Revalidate the Admin app's own cache.
  revalidatePath('/homepage');
  revalidatePath('/', 'layout');

  // 3. If this was a publish operation, also revalidate the Customer app's ISR cache.
  //    Awaited so the server action does not terminate before the request completes.
  //    Failure here is NON-FATAL — the publish is already committed to the database.
  if (data.status === 'published') {
    const customerUrl = process.env.CUSTOMER_APP_URL;
    const revalidationSecret = process.env.REVALIDATION_SECRET;

    if (!customerUrl || !revalidationSecret) {
      console.warn(
        '[Admin] CUSTOMER_APP_URL or REVALIDATION_SECRET is not set. ' +
          'Customer homepage ISR cache was NOT revalidated.',
      );
    } else {
      try {
        const url = `${customerUrl}/api/revalidate?secret=${revalidationSecret}`;
        const res = await fetch(url, { method: 'POST' });
        if (!res.ok) {
          const body = await res.text().catch(() => '(unreadable body)');
          console.error(
            `[Admin] Customer revalidation request failed — status ${res.status}: ${body}`,
          );
        } else {
          console.log('[Admin] Customer homepage ISR cache successfully revalidated.');
        }
      } catch (err) {
        console.error('[Admin] Customer revalidation request threw an error:', err);
      }
    }
  }

  return result;
}
