'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminHomepage } from '../repositories/homepage-repo';
import { getHomepageAction, updateHomepageAction } from '../actions/homepage-actions';
import { CollapsibleSection } from '../../../components/ui/collapsible-section';
import { MediaPicker } from '../../media/components/media-picker';
import { SortableCategoryList } from './sortable-category-list';

export function HomepageEditor() {
  const router = useRouter();
  const [data, setData] = useState<AdminHomepage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getHomepageAction().then((res) => {
      setData(res);
      setIsLoading(false);
    });
  }, []);

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
      <div className="flex items-center justify-between sticky top-0 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-md z-20 py-4 border-b border-stone-200 dark:border-stone-800 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Homepage Settings</h2>
          <p className="text-sm text-stone-500">Manage all customer-facing homepage content.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/homepage/preview')}
            className="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md transition-colors"
          >
            Preview
          </button>
          <button
            onClick={() => handleSave('draft')}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-md transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={isSaving}
            className="px-4 py-2 bg-stone-900 dark:bg-stone-50 text-stone-50 dark:text-stone-900 rounded-md font-medium text-sm hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
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
              className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
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
              className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm resize-none"
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
                className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">CTA Link</label>
              <input
                value={data.hero.ctaLink}
                onChange={(e) =>
                  setData({ ...data, hero: { ...data.hero, ctaLink: e.target.value } })
                }
                className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
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
              className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
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
              className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm resize-none"
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
              className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
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
              className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm resize-none"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Seasonal Banner */}
      <CollapsibleSection title="Seasonal Banner">
        <div className="space-y-4">
          <label className="flex items-center gap-3 p-4 border border-stone-200 dark:border-stone-800 rounded-lg cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50">
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
            <div className="pt-4 space-y-4 border-t border-stone-100 dark:border-stone-800">
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
                  className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
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
                  className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm resize-none"
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
          <label className="flex items-center gap-3 p-4 border border-stone-200 dark:border-stone-800 rounded-lg cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50">
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
            <div className="pt-4 space-y-4 border-t border-stone-100 dark:border-stone-800">
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
                    className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
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
                    className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
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
                    className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
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
                    className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
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
