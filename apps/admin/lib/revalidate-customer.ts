export async function revalidateCustomerApp() {
  const customerUrl = process.env.CUSTOMER_APP_URL;
  const revalidationSecret = process.env.REVALIDATION_SECRET;

  if (!customerUrl || !revalidationSecret) {
    console.warn(
      '[Admin] CUSTOMER_APP_URL or REVALIDATION_SECRET is not set. ' +
        'Customer ISR cache was NOT revalidated.',
    );
    return;
  }

  try {
    const url = `${customerUrl}/api/revalidate?secret=${revalidationSecret}`;
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) {
      const body = await res.text().catch(() => '(unreadable body)');
      console.error(`[Admin] Customer revalidation request failed - status ${res.status}: ${body}`);
    } else {
      console.log('[Admin] Customer ISR cache successfully revalidated.');
    }
  } catch (err) {
    console.error('[Admin] Customer revalidation request threw an error:', err);
  }
}
