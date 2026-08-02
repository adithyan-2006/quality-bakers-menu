import { EditorialIntro } from '../features/home/editorial-intro';
import { FeaturedCategories } from '../features/home/featured-categories';
import { PopularPreview } from '../features/home/popular-preview';
import { SignatureHighlight } from '../features/home/signature-highlight';
import { BrowseCta } from '../features/home/browse-cta';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      <EditorialIntro />
      <FeaturedCategories />
      <PopularPreview />
      <SignatureHighlight />
      <BrowseCta />
    </div>
  );
}
