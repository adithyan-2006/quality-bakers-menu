'use client';

import * as React from 'react';
import { LikesAnalyticsSummary } from '@qbm/types';
import {
  Heart,
  Trophy,
  Tag,
  Search,
  Download,
  Layers,
  Crown,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';

interface LikesAnalyticsViewProps {
  likesSummary: LikesAnalyticsSummary;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

type SortOption = 'likes-desc' | 'likes-asc' | 'name-asc' | 'price-desc' | 'price-asc';

export function LikesAnalyticsView({ likesSummary }: LikesAnalyticsViewProps) {
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<SortOption>('likes-desc');

  const {
    totalLikes = 0,
    todayLikes = 0,
    thisMonthLikes = 0,
    likedProductsCount = 0,
    totalProductsCount = 0,
    topCategoryName,
    topProductName,
    categories = [],
    products = [],
  } = likesSummary;

  // Filter & sort products
  const filteredProducts = React.useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory =
          selectedCategory === 'all' ||
          p.categoryId === selectedCategory ||
          p.categorySlug === selectedCategory;
        const matchesSearch =
          searchTerm.trim() === '' ||
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.slug.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'likes-desc':
            return b.likes - a.likes || a.name.localeCompare(b.name);
          case 'likes-asc':
            return a.likes - b.likes || a.name.localeCompare(b.name);
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'price-desc':
            return b.price - a.price || b.likes - a.likes;
          case 'price-asc':
            return a.price - b.price || b.likes - a.likes;
          default:
            return b.likes - a.likes;
        }
      });
  }, [products, selectedCategory, searchTerm, sortBy]);

  // CSV Export for Likes Report
  const sanitizeCsvCell = (value: string | number): string => {
    const str = String(value);
    if (typeof value === 'number') return str;
    const escaped = str.replace(/"/g, '""');
    if (/^[=+\-@\t\r]/.test(escaped)) {
      return `"'${escaped}"`;
    }
    return `"${escaped}"`;
  };

  const handleExportCSV = () => {
    const headers = [
      'Rank',
      'Product Name',
      'Category',
      'Price (INR)',
      'Likes Count',
      'Share of Total Likes (%)',
      'Availability Status',
      'Publish Status',
    ];

    const rows = filteredProducts.map((p, idx) => [
      sanitizeCsvCell(idx + 1),
      sanitizeCsvCell(p.name),
      sanitizeCsvCell(p.categoryName),
      sanitizeCsvCell(p.price),
      sanitizeCsvCell(p.likes),
      sanitizeCsvCell(`${p.percentage}%`),
      sanitizeCsvCell(p.isAvailable ? 'Available' : 'Out of Stock'),
      sanitizeCsvCell(p.status),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.map(sanitizeCsvCell).join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `quality-bakers-product-likes-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const coveragePercent =
    totalProductsCount > 0 ? Math.round((likedProductsCount / totalProductsCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 4 Mini KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Likes */}
        <div className="bg-white/85 backdrop-blur-md border border-black/[0.08] rounded-2xl p-6 shadow-glass">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-stone-500 uppercase">
              Total Product Likes
            </span>
            <div className="p-2.5 bg-black/[0.04] text-black border border-black/[0.06] rounded-xl">
              <Heart className="w-4 h-4 fill-black text-black" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold tracking-tight text-black">
              {totalLikes.toLocaleString()}
            </span>
            {todayLikes > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-black text-white shadow-sm">
                +{todayLikes} today
              </span>
            )}
          </div>
          <div className="mt-3 text-xs text-stone-500 flex items-center justify-between border-t border-black/[0.06] pt-2.5">
            <span>Customer Favorites</span>
            <span className="font-semibold text-black">
              This Month: <strong>{thisMonthLikes.toLocaleString()}</strong>
            </span>
          </div>
        </div>

        {/* Top Liked Category */}
        <div className="bg-white/85 backdrop-blur-md border border-black/[0.08] rounded-2xl p-6 shadow-glass">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-stone-500 uppercase">
              Top Liked Category
            </span>
            <div className="p-2.5 bg-black/[0.04] text-black border border-black/[0.06] rounded-xl">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className="text-xl font-bold tracking-tight text-black truncate max-w-[200px]"
              title={topCategoryName || 'None yet'}
            >
              {topCategoryName || 'None yet'}
            </span>
          </div>
          <div className="mt-3 text-xs text-stone-500 flex items-center justify-between border-t border-black/[0.06] pt-2.5">
            <span>Leading Collection</span>
            {categories[0] && categories[0].likes > 0 ? (
              <span className="font-semibold text-black">
                <strong>{categories[0].likes}</strong> likes ({categories[0].percentage}%)
              </span>
            ) : (
              <span className="text-stone-400">0 likes</span>
            )}
          </div>
        </div>

        {/* Top Liked Product */}
        <div className="bg-white/85 backdrop-blur-md border border-black/[0.08] rounded-2xl p-6 shadow-glass">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-stone-500 uppercase">
              Most Loved Product
            </span>
            <div className="p-2.5 bg-black/[0.04] text-black border border-black/[0.06] rounded-xl">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className="text-xl font-bold tracking-tight text-black truncate max-w-[200px]"
              title={topProductName || 'None yet'}
            >
              {topProductName || 'None yet'}
            </span>
          </div>
          <div className="mt-3 text-xs text-stone-500 flex items-center justify-between border-t border-black/[0.06] pt-2.5">
            <span>#1 Customer Pick</span>
            {products[0] && products[0].likes > 0 ? (
              <span className="font-semibold text-black">
                <strong>{products[0].likes}</strong> likes ({products[0].percentage}%)
              </span>
            ) : (
              <span className="text-stone-400">0 likes</span>
            )}
          </div>
        </div>

        {/* Catalog Liked Coverage */}
        <div className="bg-white/85 backdrop-blur-md border border-black/[0.08] rounded-2xl p-6 shadow-glass">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-stone-500 uppercase">
              Catalog Liked
            </span>
            <div className="p-2.5 bg-black/[0.04] text-black border border-black/[0.06] rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-black">
              {coveragePercent}%
            </span>
            <span className="text-xs font-medium text-stone-500">of menu items</span>
          </div>
          <div className="mt-3 text-xs text-stone-500 flex items-center justify-between border-t border-black/[0.06] pt-2.5">
            <span>Engagement Coverage</span>
            <span className="font-semibold text-black">
              <strong>{likedProductsCount}</strong> / {totalProductsCount} products
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: LIKES IN EACH CATEGORY */}
      <div className="bg-white/85 backdrop-blur-md border border-black/[0.08] rounded-2xl p-6 shadow-glass">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-black" />
              <h3 className="text-lg font-bold text-black tracking-tight">Likes by Category</h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Aggregate customer likes and popularity share across each menu category
            </p>
          </div>
          <span className="text-xs font-semibold text-white bg-black px-3 py-1 rounded-full self-start sm:self-auto shadow-sm">
            {categories.length} Categories Total
          </span>
        </div>

        {categories.length === 0 ? (
          <div className="py-10 text-center text-sm text-stone-400">
            No categories available yet.
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, idx) => {
              const isSelected = selectedCategory === cat.id || selectedCategory === cat.slug;
              const hasLikes = cat.likes > 0;

              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
                  className={`group relative p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-black ring-2 ring-black/20 shadow-glass-hover'
                      : 'bg-white/90 backdrop-blur-md border-black/[0.08] hover:border-black/30 hover:shadow-glass-hover shadow-glass'
                  }`}
                  title={`Click to filter products by ${cat.name}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-stone-400">#{idx + 1}</span>
                        <h4 className="text-base font-bold text-black truncate">{cat.name}</h4>
                      </div>
                      <span className="text-xs text-stone-500 font-mono block mt-0.5">
                        {cat.slug} · {cat.productCount} {cat.productCount === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white font-bold text-xs shrink-0 shadow-sm">
                      <Heart className="w-3.5 h-3.5 fill-white text-white" />
                      <span>{cat.likes}</span>
                    </div>
                  </div>

                  {/* Progress bar representing share of total likes */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-stone-600">Share of Likes</span>
                      <span className="text-black font-bold">{cat.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-black/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(hasLikes ? 4 : 0, cat.percentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Top liked product in this category */}
                  <div className="mt-4 pt-3 border-t border-black/[0.06] flex items-center justify-between text-xs">
                    <span className="text-stone-500 font-medium">Top item:</span>
                    <span className="font-semibold text-black truncate max-w-[170px]">
                      {cat.topProductName ? (
                        <>
                          {cat.topProductName}{' '}
                          <span className="text-black font-extrabold">({cat.topProductLikes})</span>
                        </>
                      ) : (
                        <span className="text-stone-400 italic">No likes yet</span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: LIKES IN EACH PRODUCT */}
      <div className="bg-white/85 backdrop-blur-md border border-black/[0.08] rounded-2xl p-6 shadow-glass">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-black/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-black" />
              <h3 className="text-lg font-bold text-black tracking-tight">
                Product Likes Leaderboard
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Rankings and like counts for every individual product in the catalog
            </p>
          </div>

          {/* Search, Filter, Sort and Export Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-7 py-2 text-xs rounded-xl border border-black/[0.08] bg-white/80 text-black placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-black"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-2 pl-3 pr-8 text-xs font-semibold rounded-xl border border-black/[0.08] bg-white/80 text-black focus:outline-none focus:ring-2 focus:ring-black transition-all cursor-pointer"
              >
                <option value="all">All Categories ({products.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.productCount})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="py-2 pl-3 pr-8 text-xs font-semibold rounded-xl border border-black/[0.08] bg-white/80 text-black focus:outline-none focus:ring-2 focus:ring-black transition-all cursor-pointer"
              >
                <option value="likes-desc">Most Liked (#1 first)</option>
                <option value="likes-asc">Least Liked</option>
                <option value="name-asc">Product Name (A-Z)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="price-asc">Price (Low to High)</option>
              </select>
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-black hover:bg-neutral-800 rounded-xl transition-all shadow-sm"
              title="Export product likes to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Active Filter Pill indicator */}
        {(selectedCategory !== 'all' || searchTerm.trim() !== '') && (
          <div className="mt-3 flex items-center gap-2 text-xs text-stone-500">
            <span>Filtering by:</span>
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black text-white font-semibold">
                Category:{' '}
                {categories.find((c) => c.id === selectedCategory || c.slug === selectedCategory)
                  ?.name || selectedCategory}
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="hover:text-stone-300 ml-0.5"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {searchTerm.trim() !== '' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black text-white font-semibold">
                Keyword: &quot;{searchTerm}&quot;
                <button onClick={() => setSearchTerm('')} className="hover:text-stone-300 ml-0.5">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchTerm('');
              }}
              className="text-stone-500 hover:text-black font-semibold underline text-xs ml-1"
            >
              Reset all
            </button>
          </div>
        )}

        {/* Product Table */}
        {filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-sm text-stone-400">
            No products match the selected filters.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-stone-600 font-bold uppercase tracking-wider border-b border-black/[0.08]">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">Rank</th>
                  <th className="py-3 px-3">Product Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Likes</th>
                  <th className="py-3 px-3 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {filteredProducts.map((product, idx) => {
                  const rank = idx + 1;
                  const hasLikes = product.likes > 0;

                  return (
                    <tr key={product.id} className="hover:bg-black/[0.02] transition-colors">
                      {/* Rank */}
                      <td className="py-3.5 px-3 text-center">
                        {rank === 1 && hasLikes ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black text-white font-bold text-xs shadow-sm">
                            <Crown className="w-3.5 h-3.5 fill-white text-white" />
                          </span>
                        ) : rank <= 3 && hasLikes ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black text-white font-bold text-xs">
                            #{rank}
                          </span>
                        ) : (
                          <span className="text-stone-400 font-bold">#{rank}</span>
                        )}
                      </td>

                      {/* Product Name & Thumbnail */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-10 h-10 rounded-xl object-cover border border-black/[0.08] shadow-sm shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-black/[0.04] border border-black/[0.06] flex items-center justify-center text-stone-400 shrink-0">
                              <Heart className="w-4 h-4 opacity-40" />
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-sm text-black truncate">
                                {product.name}
                              </span>
                              {product.isFeatured && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black text-white shadow-xs">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  Featured
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-xs text-stone-500 truncate">
                              /{product.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => setSelectedCategory(product.categoryId)}
                          className="px-3 py-1 rounded-full bg-black/[0.04] hover:bg-black hover:text-white border border-black/[0.08] text-black font-semibold text-xs transition-all"
                          title={`Filter by ${product.categoryName}`}
                        >
                          {product.categoryName}
                        </button>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-3 font-bold text-sm text-black">
                        ₹{product.price.toLocaleString()}
                      </td>

                      {/* Status / Availability */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col gap-0.5">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold ${
                              product.isAvailable ? 'text-emerald-700' : 'text-stone-400'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                product.isAvailable ? 'bg-emerald-600' : 'bg-stone-400'
                              }`}
                            />
                            {product.isAvailable ? 'Available' : 'Out of Stock'}
                          </span>
                        </div>
                      </td>

                      {/* Likes Count */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5 font-extrabold text-sm text-black">
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              hasLikes ? 'fill-black text-black' : 'text-stone-300'
                            }`}
                          />
                          <span>{product.likes.toLocaleString()}</span>
                        </div>
                      </td>

                      {/* Like Share % */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-bold text-xs text-black min-w-[32px] text-right">
                            {product.percentage}%
                          </span>
                          <div className="w-16 h-2 rounded-full bg-black/[0.06] overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.max(hasLikes ? 4 : 0, product.percentage)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
