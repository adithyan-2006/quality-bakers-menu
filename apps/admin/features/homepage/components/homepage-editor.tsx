'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminHomepage } from '../repositories/homepage-repo';
import { AdminCategory } from '../../categories/repositories/category-repo';
import { getHomepageAction, updateHomepageAction } from '../actions/homepage-actions';
import { CollapsibleSection } from '../../../components/ui/collapsible-section';
import { MediaPicker } from '../../media/components/media-picker';
import { SortableCategoryList } from './sortable-category-list';

interface HomepageEditorProps {
  initialData?: AdminHomepage | undefined;
  initialCategories?: AdminCategory[] | undefined;
}

export function HomepageEditor({ initialData, initialCategories }: HomepageEditorProps) {
  const router = useRouter();
  const [data, setData] = useState<AdminHomepage | null>(initialData ?? null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) return;
    let cancelled = false;
    getHomepageAction().then((res) => {
      if (!cancelled) {
        setData(res);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [initialData]);

  const handleSave = async (status: 'draft' | 'published' = 'published') => {
    if (!data) return;
    setIsSaving(true);
    try {
      await updateHomepageAction({ ...data, status });
      router.refresh();
      alert(`Homepage saved as ${status}`);
    } catch (error) {
      console.error(error);
      alert('Failed to save homepage');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !data) {
    return <div className="p-8 text-center text-stone-500">Loading Homepage Editor...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      {/* Header Actions */}
      <div className="flex items-center justify-between sticky top-0 bg-white/70 backdrop-blur-xl z-20 py-4 border-b border-black/[0.06] -mx-4 px-4 sm:mx-0 sm:px-0">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Homepage Settings</h2>
          <p className="text-sm text-stone-500">Manage all customer-facing homepage content.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/homepage/preview')}
            className="px-4 py-2 text-sm font-medium text-stone-700 hover:text-black hover:bg-black/5 rounded-lg transition-colors"
          >
            Preview
          </button>
          <button
            onClick={() => handleSave('draft')}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-stone-700 bg-white/80 backdrop-blur-sm border border-black/10 hover:bg-white rounded-lg transition-colors shadow-sm"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={isSaving}
            className="px-4 py-2 bg-black text-white rounded-lg font-medium text-sm hover:bg-stone-800 transition-all shadow-sm"
          >
            {isSaving ? 'Publishing...' : 'Publish Live'}
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <CollapsibleSection title="Hero Section" defaultOpen={true}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Headline</label>
            <input
              value={data.hero.title}
              onChange={(e) => setData({ ...data, hero: { ...data.hero, title: e.target.value } })}
              className="w-full rounded-xl border border-black/[0.08] bg-white/80 text-black px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black shadow-sm transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Subtitle</label>
            <textarea
              value={data.hero.subtitle}
              onChange={(e) =>
                setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })
              }
              rows={2}
              className="w-full rounded-xl border border-black/[0.08] bg-white/80 text-black px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black shadow-sm transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">CTA Text</label>
              <input
                value={data.hero.ctaText}
                onChange={(e) =>
                  setData({ ...data, hero: { ...data.hero, ctaText: e.target.value } })
                }
                className="w-full rounded-xl border border-black/[0.08] bg-white/80 text-black px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black shadow-sm transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">CTA Link</label>
              <input
                value={data.hero.ctaLink}
                onChange={(e) =>
                  setData({ ...data, hero: { ...data.hero, ctaLink: e.target.value } })
                }
                className="w-full rounded-xl border border-black/[0.08] bg-white/80 text-black px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black shadow-sm transition-all"
              />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium">Background Image</label>
            <MediaPicker
              value={data.hero.imageId || ''}
              onChange={(val) =>
                setData({ ...data, hero: { ...data.hero, imageId: val as string } })
              }
              multiple={false}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Featured Categories */}
      <CollapsibleSection title="Featured Categories">
        <p className="text-sm text-stone-500 mb-4">
          Select and order categories that will appear in the quick navigation grid.
        </p>
        <SortableCategoryList
          items={data.featuredCategories}
          initialCategories={initialCategories}
          onChange={(items) => setData({ ...data, featuredCategories: items })}
        />
      </CollapsibleSection>

      {/* About Section */}
      <CollapsibleSection title="About Section">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input
              value={data.about.title}
              onChange={(e) =>
                setData({ ...data, about: { ...data.about, title: e.target.value } })
              }
              className="w-full rounded-xl border border-black/[0.08] bg-white/80 text-black px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black shadow-sm transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={data.about.description}
              onChange={(e) =>
                setData({ ...data, about: { ...data.about, description: e.target.value } })
              }
              rows={4}
              className="w-full rounded-xl border border-black/[0.08] bg-white/80 text-black px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black shadow-sm transition-all"
            />
          </div>
          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium">About Image</label>
            <MediaPicker
              value={data.about.imageId || ''}
              onChange={(val) =>
                setData({ ...data, about: { ...data.about, imageId: val as string } })
              }
              multiple={false}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Story Section */}
      <CollapsibleSection title="Story Section">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input
              value={data.story.title}
              onChange={(e) =>
                setData({ ...data, story: { ...data.story, title: e.target.value } })
              }
              className="w-full rounded-xl border border-black/[0.08] bg-white/80 text-black px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black shadow-sm transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={data.story.description}
              onChange={(e) =>
                setData({ ...data, story: { ...data.story, description: e.target.value } })
              }
              rows={4}
              className="w-full rounded-xl border border-black/[0.08] bg-white/80 text-black px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black shadow-sm transition-all"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Seasonal Banner */}
      <CollapsibleSection title="Seasonal Banner">
        <div className="space-y-4">
          <label className="flex items-center gap-3 p-4 border border-black/[0.08] bg-white/60 rounded-xl cursor-pointer hover:bg-white/90 transition-all">
            <input
              type="checkbox"
              checked={data.seasonalBanner.enabled}
              onChange={(e) =>
                setData({
                  ...data,
                  seasonalBanner: { ...data.seasonalBanner, enabled: e.target.checked },
                })
              }
              className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Enable Seasonal Banner</span>
              <span className="text-xs text-stone-500">Show this banner above the footer.</span>
            </div>
          </label>

          {data.seasonalBanner.enabled && (
            <div className="pt-4 space-y-4 border-t border-black/[0.06]">
              <div className="space-y-2">
                <label className="text-sm font-medium">Banner Title</label>
                <input
                  value={data.seasonalBanner.title}
                  onChange={(e) =>
                    setData({
                      ...data,
                      seasonalBanner: { ...data.seasonalBanner, title: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-black/[0.08] bg-white/80 text-black px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black shadow-sm transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={data.seasonalBanner.description}
                  onChange={(e) =>
                    setData({
                      ...data,
                      seasonalBanner: { ...data.seasonalBanner, description: e.target.value },
                    })
                  }
                  rows={2}
                  className="w-full rounded-xl border border-black/[0.08] bg-white/80 text-black px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black shadow-sm transition-all"
                />
              </div>
              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium">Background Image</label>
                <MediaPicker
                  value={data.seasonalBanner.imageId || ''}
                  onChange={(val) =>
                    setData({
                      ...data,
                      seasonalBanner: { ...data.seasonalBanner, imageId: val as string },
                    })
                  }
                  multiple={false}
                />
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Promotion Banner */}
      <CollapsibleSection title="Promotion Banner">
        <div className="space-y-4">
          <label className="flex items-center gap-3 p-4 border border-black/[0.08] bg-white/60 rounded-xl cursor-pointer hover:bg-white/90 transition-all">
            <input
              type="checkbox"
              checked={data.promotionBanner.enabled}
              onChange={(e) =>
                setData({
                  ...data,
                  promotionBanner: { ...data.promotionBanner, enabled: e.target.checked },
                })
              }
              className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Enable Promotion Banner</span>
              <span className="text-xs text-stone-500">
                Show a promotional bar on the homepage.
              </span>
            </div>
          </label>

          {data.promotionBanner.enabled && (
            <div className="pt-4 space-y-4 border-t border-black/[0.06]">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Banner Title</label>
                  <input
                    value={data.promotionBanner.title}
                    onChange={(e) =>
                      setData({
                        ...data,
                        promotionBanner: { ...data.promotionBanner, title: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-black/[0.08] bg-white/80 text-black px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black shadow-sm transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subtitle/Description</label>
                  <input
                    value={data.promotionBanner.description}
                    onChange={(e) =>
                      setData({
                        ...data,
                        promotionBanner: { ...data.promotionBanner, description: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-black/[0.08] bg-white/80 text-black px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black shadow-sm transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Button Text</label>
                  <input
                    value={data.promotionBanner.buttonText || ''}
                    onChange={(e) =>
                      setData({
                        ...data,
                        promotionBanner: { ...data.promotionBanner, buttonText: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-black/[0.08] bg-white/80 text-black px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black shadow-sm transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Background Color (Hex)</label>
                  <input
                    value={data.promotionBanner.backgroundColor || ''}
                    onChange={(e) =>
                      setData({
                        ...data,
                        promotionBanner: {
                          ...data.promotionBanner,
                          backgroundColor: e.target.value,
                        },
                      })
                    }
                    placeholder="#fff0e6"
                    className="w-full rounded-xl border border-black/[0.08] bg-white/80 text-black px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black shadow-sm transition-all"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Image Picker Modal */}
    </div>
  );
}
