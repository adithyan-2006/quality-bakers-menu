'use client';

import { useState, useMemo } from 'react';
import { AdminProduct } from '../repositories/product-repo';
import {
  duplicateProductAction,
  updateProductAction,
  deleteProductAction,
} from '../actions/product-actions';
import { AdminCategory } from '../../categories/repositories/category-repo';
import { Edit2, Eye, EyeOff, Search, Copy, LayoutTemplate, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { cn, Dialog, Button, formatBadge } from '@qbm/ui';

interface ProductListProps {
  initialProducts: AdminProduct[];
  categories: AdminCategory[];
}

export function ProductList({ initialProducts, categories }: ProductListProps) {
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');

  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Filters
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAvailability, setFilterAvailability] = useState<string>('all');
  const [filterHighlight, setFilterHighlight] = useState<string>('all');

  // Sort
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price' | 'alphabetical'>('newest');

  const categoryMap = useMemo(() => {
    return categories.reduce(
      (acc, cat) => {
        acc[cat.id] = cat.name;
        return acc;
      },
      {} as Record<string, string>,
    );
  }, [categories]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          (categoryMap[p.categoryId] || '').toLowerCase().includes(q),
      );
    }

    // Filter
    if (filterCategory !== 'all') {
      result = result.filter((p) => p.categoryId === filterCategory);
    }
    if (filterStatus !== 'all') {
      result = result.filter((p) => p.status === filterStatus);
    }
    if (filterAvailability !== 'all') {
      result = result.filter((p) => p.availabilityStatus === filterAvailability);
    }
    if (filterHighlight !== 'all') {
      if (filterHighlight === 'featured') {
        result = result.filter((p) => p.isFeatured);
      } else if (filterHighlight === 'signature') {
        result = result.filter((p) => p.isSignature);
      }
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'oldest':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case 'price':
          return a.price - b.price;
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [
    products,
    searchQuery,
    filterCategory,
    filterStatus,
    filterAvailability,
    filterHighlight,
    sortBy,
    categoryMap,
  ]);

  const handleDuplicate = async (id: string) => {
    try {
      const newProduct = await duplicateProductAction(id);
      setProducts((prev) => [newProduct, ...prev]);
    } catch (e) {
      console.error('Failed to duplicate product', e);
    }
  };

  const handleToggleVisibility = async (id: string) => {
    try {
      const product = products.find((p) => p.id === id);
      if (!product) return;
      const newVisibility = !product.isVisible;
      await updateProductAction(id, { isVisible: newVisibility });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isVisible: newVisibility } : p)),
      );
    } catch (e) {
      console.error('Failed to toggle visibility', e);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    setDeleteError('');
    const result = await deleteProductAction(productToDelete.id);
    if (result.success) {
      setProducts(products.filter((p) => p.id !== productToDelete.id));
      setProductToDelete(null);
    } else {
      setDeleteError(result.error || 'Failed to delete product');
    }
    setIsDeleting(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products, descriptions, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500 dark:focus:ring-stone-400"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            className="px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-500"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            className="px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="hidden">Hidden</option>
          </select>
          <select
            className="px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-500"
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
          >
            <option value="all">All Availability</option>
            <option value="available">Available</option>
            <option value="out-of-stock">Out of Stock</option>
            <option value="seasonal">Seasonal</option>
          </select>
          <select
            className="px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-500"
            value={filterHighlight}
            onChange={(e) => setFilterHighlight(e.target.value)}
          >
            <option value="all">All Highlights</option>
            <option value="featured">Featured</option>
            <option value="signature">Signature</option>
          </select>
          <select
            className="px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="price">Sort: Price</option>
            <option value="alphabetical">Sort: A-Z</option>
          </select>
        </div>
      </div>

      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm">
          <p className="text-stone-500">No products found matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="px-6 py-4 font-medium text-stone-500 dark:text-stone-400">
                    Product
                  </th>
                  <th className="px-6 py-4 font-medium text-stone-500 dark:text-stone-400">
                    Category
                  </th>
                  <th className="px-6 py-4 font-medium text-stone-500 dark:text-stone-400">
                    Price
                  </th>
                  <th className="px-6 py-4 font-medium text-stone-500 dark:text-stone-400">
                    Status
                  </th>
                  <th className="px-6 py-4 font-medium text-stone-500 dark:text-stone-400 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {filteredAndSortedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className={cn(
                      'hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors',
                      !product.isVisible && 'opacity-60',
                    )}
                  >
                    <td className="px-6 py-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded-md overflow-hidden flex-shrink-0 border border-stone-200 dark:border-stone-700">
                        {product.image ? (
                          /* eslint-disable-next-line */
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <LayoutTemplate className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-stone-900 dark:text-stone-50">
                          {product.name}
                        </div>
                        {product.badge !== 'none' && formatBadge(product.badge) && (
                          <div className="text-xs text-stone-500">{formatBadge(product.badge)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone-600 dark:text-stone-300">
                      {categoryMap[product.categoryId] || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 font-medium text-stone-900 dark:text-stone-50">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={cn(
                            'inline-flex w-fit items-center px-2 py-0.5 rounded text-xs font-medium',
                            product.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : product.status === 'draft'
                                ? 'bg-stone-100 text-stone-800'
                                : 'bg-rose-100 text-rose-800',
                          )}
                        >
                          {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                        </span>
                        <span
                          className={cn(
                            'inline-flex w-fit items-center px-2 py-0.5 rounded text-xs font-medium',
                            product.availabilityStatus === 'available'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : product.availabilityStatus === 'seasonal'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200',
                          )}
                        >
                          {product.availabilityStatus.replace('-', ' ')}
                        </span>
                        {product.isFeatured && (
                          <span className="inline-flex w-fit items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                            ★ Featured
                          </span>
                        )}
                        {product.isSignature && (
                          <span className="inline-flex w-fit items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
                            ✦ Signature
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleVisibility(product.id)}
                          className="p-2 text-stone-500 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 dark:hover:text-stone-50 rounded-md transition-colors"
                          title={product.isVisible ? 'Hide Product' : 'Show Product'}
                        >
                          {product.isVisible ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDuplicate(product.id)}
                          className="p-2 text-stone-500 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 dark:hover:text-stone-50 rounded-md transition-colors"
                          title="Duplicate Product"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/products/${product.id}/preview`}
                          className="p-2 text-stone-500 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 dark:hover:text-stone-50 rounded-md transition-colors"
                          title="Preview Product"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/products/${product.id}/edit`}
                          className="p-2 text-stone-500 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 dark:hover:text-stone-50 rounded-md transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setProductToDelete(product)}
                          className="p-2 text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-md transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-stone-200 dark:divide-stone-800">
            {filteredAndSortedProducts.map((product) => (
              <div
                key={product.id}
                className={cn('p-4 space-y-4', !product.isVisible && 'opacity-60')}
              >
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-md overflow-hidden flex-shrink-0 border border-stone-200 dark:border-stone-700">
                    {product.image ? (
                      /* eslint-disable-next-line */
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                        <LayoutTemplate className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-stone-900 dark:text-stone-50 truncate">
                      {product.name}
                    </h4>
                    <p className="text-sm text-stone-500">
                      {categoryMap[product.categoryId] || 'Uncategorized'}
                    </p>
                    <p className="font-semibold text-stone-900 dark:text-stone-50 mt-1">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                      product.status === 'published'
                        ? 'bg-emerald-100 text-emerald-800'
                        : product.status === 'draft'
                          ? 'bg-stone-100 text-stone-800'
                          : 'bg-rose-100 text-rose-800',
                    )}
                  >
                    {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                      product.availabilityStatus === 'available'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : product.availabilityStatus === 'seasonal'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200',
                    )}
                  >
                    {product.availabilityStatus.replace('-', ' ')}
                  </span>
                  {product.isFeatured && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                      ★ Featured
                    </span>
                  )}
                  {product.isSignature && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
                      ✦ Signature
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <button
                    onClick={() => handleToggleVisibility(product.id)}
                    className="flex-1 p-2 flex justify-center items-center text-stone-500 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-md transition-colors"
                  >
                    {product.isVisible ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDuplicate(product.id)}
                    className="flex-1 p-2 flex justify-center items-center text-stone-500 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-md transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <Link
                    href={`/products/${product.id}/preview`}
                    className="flex-1 p-2 flex justify-center items-center text-stone-500 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-md transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/products/${product.id}/edit`}
                    className="flex-1 p-2 flex justify-center items-center text-stone-500 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-md transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setProductToDelete(product)}
                    className="flex-1 p-2 flex justify-center items-center text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={!!productToDelete} onClose={() => setProductToDelete(null)}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Delete product?</Dialog.Title>
            <Dialog.Description>
              You are about to permanently delete '{productToDelete?.name}'. This action cannot be
              undone.
            </Dialog.Description>
          </Dialog.Header>
          {deleteError && <div className="text-sm text-red-500 mt-2">{deleteError}</div>}
          <Dialog.Footer className="mt-4">
            <Button
              variant="outline"
              onClick={() => setProductToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete permanently'}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  );
}
