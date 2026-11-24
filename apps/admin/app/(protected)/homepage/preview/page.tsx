import { getHomepageAction } from '../../../../features/homepage/actions/homepage-actions';
import { getCategoriesAction } from '../../../../features/categories/actions/category-actions';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@qbm/ui';

export default async function HomepagePreviewPage() {
  const homepage = await getHomepageAction();
  const allCategories = await getCategoriesAction();

  const featuredCategories = homepage.featuredCategories
    .map((id) => allCategories.find((c) => c.id === id))
    .filter(
      Boolean,
    ) as import('../../../../features/categories/repositories/category-repo').AdminCategory[];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      {/* Admin Preview Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/[0.08] px-4 py-3 flex items-center justify-between shadow-glass">
        <div className="flex items-center gap-4">
          <Link
            href="/homepage"
            className="p-2 hover:bg-black/5 rounded-xl transition-colors text-black"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-sm text-black">Live Preview Mode</h1>
            <p className="text-xs text-stone-600">Viewing '{homepage.status}' state</p>
          </div>
        </div>
        <div className="text-xs font-semibold bg-black text-white px-3 py-1 rounded-full shadow-sm">
          Preview Active
        </div>
      </div>

      {/* Customer UI Assembly */}
      <div className="w-full bg-white font-sans">
        {/* Promotion Banner */}
        {homepage.promotionBanner.enabled && (
          <div
            className="w-full text-center py-3 px-4 shadow-sm relative z-40 flex flex-col sm:flex-row items-center justify-center gap-3"
            style={{ backgroundColor: homepage.promotionBanner.backgroundColor || '#fff0e6' }}
          >
            <div>
              <span className="font-bold text-stone-900 text-sm tracking-tight">
                {homepage.promotionBanner.title}
              </span>
              <span className="text-stone-700 text-sm ml-2 hidden sm:inline">
                — {homepage.promotionBanner.description}
              </span>
            </div>
            {homepage.promotionBanner.buttonText && (
              <button className="text-xs font-bold uppercase tracking-wider bg-stone-900 text-white px-3 py-1.5 rounded hover:bg-stone-800 transition-colors">
                {homepage.promotionBanner.buttonText}
              </button>
            )}
          </div>
        )}

        {/* Hero Section */}
        <div className="relative min-h-[85vh] flex items-center justify-center pt-16 pb-16 overflow-hidden">
          {homepage.hero.image && (
            <div className="absolute inset-0 z-0">
              <img
                src={homepage.hero.image}
                className="w-full h-full object-cover"
                alt="Hero Background"
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          )}

          <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto px-4 mt-[-5vh]">
            <h1
              className={cn(
                'text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]',
                homepage.hero.image ? 'text-white' : 'text-black',
              )}
            >
              {homepage.hero.title}
            </h1>
            <p
              className={cn(
                'text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto leading-relaxed',
                homepage.hero.image ? 'text-stone-200' : 'text-stone-700',
              )}
            >
              {homepage.hero.subtitle}
            </p>
            {homepage.hero.ctaText && (
              <button className="px-10 py-5 bg-white text-stone-900 text-lg rounded-full font-medium tracking-wide shadow-xl hover:scale-105 transition-all duration-300">
                {homepage.hero.ctaText}
              </button>
            )}
          </div>
        </div>

        {/* Featured Categories (Grid) */}
        {featuredCategories.length > 0 && (
          <section className="py-24 px-4 bg-[#F8F9FA]">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-12 text-black">Quick Browse</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {featuredCategories.map(
                  (
                    cat: import('../../../../features/categories/repositories/category-repo').AdminCategory,
                  ) => (
                    <div key={cat.id} className="group cursor-pointer text-center">
                      <div className="w-full aspect-square rounded-full overflow-hidden mb-4 bg-white shadow-sm border border-stone-200 group-hover:shadow-md transition-all">
                        <img
                          src={cat.coverImage}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <h4 className="font-semibold text-black">{cat.name}</h4>
                    </div>
                  ),
                )}
              </div>
            </div>
          </section>
        )}

        {/* About Section */}
        {homepage.about && (
          <section className="py-24 px-4 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="rounded-2xl overflow-hidden shadow-xl aspect-square md:aspect-[4/5] bg-stone-100 relative">
                {homepage.about.image && (
                  <img
                    src={homepage.about.image}
                    alt={homepage.about.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold text-black tracking-tight">
                  {homepage.about.title}
                </h2>
                <p className="text-lg text-stone-700 leading-relaxed whitespace-pre-wrap">
                  {homepage.about.description}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Story Section */}
        {homepage.story && (
          <section className="py-24 px-4 bg-stone-900 text-stone-50 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                {homepage.story.title}
              </h2>
              <p className="text-xl md:text-2xl font-light text-stone-300 leading-relaxed italic whitespace-pre-wrap">
                "{homepage.story.description}"
              </p>
            </div>
          </section>
        )}

        {/* Seasonal Banner */}
        {homepage.seasonalBanner.enabled && (
          <section className="py-24 px-4 max-w-7xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row items-center bg-stone-100">
              {homepage.seasonalBanner.image && (
                <div className="w-full md:w-1/2 h-64 md:h-[400px]">
                  <img
                    src={homepage.seasonalBanner.image}
                    alt={homepage.seasonalBanner.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                <span className="text-sm font-bold uppercase tracking-wider text-rose-600 mb-2">
                  Seasonal Special
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
                  {homepage.seasonalBanner.title}
                </h2>
                <p className="text-stone-600 text-lg mb-8 leading-relaxed">
                  {homepage.seasonalBanner.description}
                </p>
                <button className="self-start px-8 py-3 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
