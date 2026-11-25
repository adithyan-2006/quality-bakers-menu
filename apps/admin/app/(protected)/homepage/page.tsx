import { getHomepageAction } from '../../../features/homepage/actions/homepage-actions';
import { getCategoriesAction } from '../../../features/categories/actions/category-actions';
import { HomepageEditor } from '../../../features/homepage/components/homepage-editor';

export const dynamic = 'force-dynamic';

export default async function HomepageManagementPage() {
  const [homepage, categories] = await Promise.all([getHomepageAction(), getCategoriesAction()]);

  return <HomepageEditor initialData={homepage} initialCategories={categories} />;
}
