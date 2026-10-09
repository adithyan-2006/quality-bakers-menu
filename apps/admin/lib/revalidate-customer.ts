export interface CustomerRevalidationResult {
  revalidated: boolean;
  error?: string;
}

export async function revalidateCustomerApp(): Promise<CustomerRevalidationResult> {
  const customerUrl = process.env.CUSTOMER_APP_URL;
  const revalidationSecret = process.env.REVALIDATION_SECRET;

  if (!customerUrl || !revalidationSecret) {
    const errorMsg =
      '[Admin] CUSTOMER_APP_URL or REVALIDATION_SECRET is not set. ' +
      'Database write succeeded, but customer ISR cache was NOT revalidated.';
    console.warn(errorMsg);
    return {
      revalidated: false,
      error:
        'Revalidation credentials not configured (CUSTOMER_APP_URL or REVALIDATION_SECRET missing)',
    };
  }

  try {
    const url = `${customerUrl}/api/revalidate?secret=${revalidationSecret}`;
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) {
      const body = await res.text().catch(() => '(unreadable body)');
      const errorMsg = `[Admin] Database write succeeded, but customer revalidation request failed - status ${res.status}: ${body}`;
      console.error(errorMsg);
      return {
        revalidated: false,
        error: `Customer revalidation failed with status ${res.status}: ${body}`,
      };
    } else {
      console.log(
        '[Admin] Database write succeeded and customer ISR cache successfully revalidated.',
      );
      return { revalidated: true };
    }
  } catch (err) {
    const errDetail = err instanceof Error ? err.message : String(err);
    const errorMsg = `[Admin] Database write succeeded, but customer revalidation request threw an error: ${errDetail}`;
    console.error(errorMsg);
    return {
      revalidated: false,
      error: `Customer revalidation network error: ${errDetail}`,
    };
  }
}
