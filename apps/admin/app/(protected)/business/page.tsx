import { getBusinessAction } from '../../../features/business/actions/business-actions';
import { BusinessEditor } from '../../../features/business/components/business-editor';

export const dynamic = 'force-dynamic';

export default async function BusinessManagementPage() {
  const business = await getBusinessAction();
  return <BusinessEditor initialData={business} />;
}
