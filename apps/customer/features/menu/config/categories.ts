import type { MenuCategoryConfig, MenuProduct } from '../types';

/**
 * Default Category Configuration
 *
 * This file acts as the temporary data source for the Menu Engine.
 * It behaves exactly like a future database query would.
 *
 * When the Admin Panel API ships:
 *   Replace this file's export with:
 *   export async function fetchCategories(): Promise<MenuCategoryConfig[]>
 *
 * The MenuEngine only calls getVisibleCategories() — so that function
 * signature is the ONLY thing that changes when the backend is connected.
 *
 * ─── Design-System Properties (developer-controlled) ────────────────────────
 *   layoutType, displayStyle, animationPreset, scrollBehavior
 *
 * ─── Business Properties (future admin-controlled) ──────────────────────────
 *   displayOrder, isVisible, isFeatured, featuredOnHome, name, description
 */
export const CATEGORIES: MenuCategoryConfig[] = [
  {
    id: 'cat-falooda',
    name: 'Falooda',
    slug: 'falooda',
    description:
      'Luxurious, layered towers of rose syrup, creamy vermicelli, sweet basil seeds, and premium ice cream. An indulgence in every spoonful.',
    displayOrder: 1,
    layoutType: 'spotlight',
    displayStyle: 'luxury',
    animationPreset: 'reveal',
    scrollBehavior: 'standard',
    isFeatured: true,
    featuredOnHome: true,
    isVisible: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-nuts-shake',
    name: 'Nuts Shake',
    slug: 'nuts-shake',
    description:
      'Crafted from roasted almonds, cashews, and pistachios blended with Medjool dates and cream. Rich, fulfilling, and exceptional.',
    displayOrder: 2,
    layoutType: 'magazine-split',
    displayStyle: 'warm',
    animationPreset: 'slide',
    scrollBehavior: 'standard',
    isFeatured: true,
    featuredOnHome: true,
    isVisible: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-biscuit-shake',
    name: 'Biscuit Shake',
    slug: 'biscuit-shake',
    description:
      'Crushed premium biscuits blended with thick ice cream and velvet cream. Comfort in a glass.',
    displayOrder: 3,
    layoutType: 'editorial-grid',
    displayStyle: 'cafe',
    animationPreset: 'stagger',
    scrollBehavior: 'standard',
    isFeatured: false,
    featuredOnHome: false,
    isVisible: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-ice-cream-shake',
    name: 'Ice Cream Shake',
    slug: 'ice-cream-shake',
    description: 'Decadent blends of premium ice cream varieties, each shake a small celebration.',
    displayOrder: 4,
    layoutType: 'gallery-wall',
    displayStyle: 'modern',
    animationPreset: 'scale',
    scrollBehavior: 'standard',
    isFeatured: false,
    featuredOnHome: true,
    isVisible: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-milk-shake',
    name: 'Milk Shake',
    slug: 'milk-shake',
    description:
      'Classic shakes made with the finest full-cream milk and seasonal flavours. Timeless and delightful.',
    displayOrder: 5,
    layoutType: 'editorial-grid',
    displayStyle: 'classic',
    animationPreset: 'fade',
    scrollBehavior: 'standard',
    isFeatured: false,
    featuredOnHome: false,
    isVisible: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-smoothies',
    name: 'Smoothies',
    slug: 'smoothies',
    description:
      'Vibrant blends of seasonal fruits, superfoods, and wholesome ingredients. Nourishing, modern, and beautiful.',
    displayOrder: 6,
    layoutType: 'pinterest-grid',
    displayStyle: 'healthy',
    animationPreset: 'stagger',
    scrollBehavior: 'standard',
    isFeatured: false,
    featuredOnHome: true,
    isVisible: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-fresh-juice',
    name: 'Fresh Juice',
    slug: 'fresh-juice',
    description:
      'Pressed daily from hand-selected fruits. Bright, clean, and naturally refreshing.',
    displayOrder: 7,
    layoutType: 'editorial-grid',
    displayStyle: 'fresh',
    animationPreset: 'reveal',
    scrollBehavior: 'standard',
    isFeatured: false,
    featuredOnHome: false,
    isVisible: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-hot-beverages',
    name: 'Hot Beverages',
    slug: 'hot-beverages',
    description:
      'Comforting brews crafted with premium ingredients. From rich coffee to soothing tea, every cup is prepared fresh to warm your day.',
    displayOrder: 8,
    layoutType: 'editorial-grid',
    displayStyle: 'warm',
    animationPreset: 'reveal',
    scrollBehavior: 'standard',
    isFeatured: false,
    featuredOnHome: false,
    isVisible: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-avil-milk',
    name: 'Avil Milk',
    slug: 'avil-milk',
    description:
      'Traditional beaten rice soaked in sweetened chilled milk. A beloved Kerala classic.',
    displayOrder: 9,
    layoutType: 'magazine-split',
    displayStyle: 'classic',
    animationPreset: 'slide',
    scrollBehavior: 'standard',
    isFeatured: false,
    featuredOnHome: false,
    isVisible: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-mojito',
    name: 'Mojito',
    slug: 'mojito',
    description:
      'Muddled fresh mint, lime, and sparkling water. Non-alcoholic, endlessly refreshing.',
    displayOrder: 10,
    layoutType: 'alternating-layout',
    displayStyle: 'fresh',
    animationPreset: 'reveal',
    scrollBehavior: 'standard',
    isFeatured: false,
    featuredOnHome: false,
    isVisible: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-lime',
    name: 'Lime',
    slug: 'lime',
    description: 'Simple, sharp, and refreshing. Fresh lime-based beverages prepared to order.',
    displayOrder: 11,
    layoutType: 'editorial-grid',
    displayStyle: 'minimal',
    animationPreset: 'fade',
    scrollBehavior: 'standard',
    isFeatured: false,
    featuredOnHome: false,
    isVisible: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-fruit-salad',
    name: 'Fruit Salad',
    slug: 'fruit-salad',
    description:
      'Light, colourful, and seasonal. Carefully composed fruit bowls for a clean, refreshing finish.',
    displayOrder: 12,
    layoutType: 'gallery-wall',
    displayStyle: 'fresh',
    animationPreset: 'stagger',
    scrollBehavior: 'standard',
    isFeatured: false,
    featuredOnHome: false,
    isVisible: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-ice-cream-scoops',
    name: 'Ice Cream Scoops',
    slug: 'ice-cream-scoops',
    description:
      'Premium ice cream served one scoop at a time. Rich flavours, smooth textures, and timeless favourites crafted for every dessert lover.',
    displayOrder: 13,
    layoutType: 'editorial-grid',
    displayStyle: 'classic',
    animationPreset: 'reveal',
    scrollBehavior: 'standard',
    isFeatured: true,
    featuredOnHome: true,
    isVisible: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

/**
 * Returns visible categories sorted by displayOrder.
 * This is the ONLY function MenuEngine calls.
 * When the backend is connected, this becomes async and fetches from API.
 */
export function getVisibleCategories(): MenuCategoryConfig[] {
  return CATEGORIES.filter((c) => c.isVisible).sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Returns placeholder products for a category.
 * When the API is connected, replace with fetchProductsByCategory(slug).
 */
export function getPlaceholderProducts(categorySlug: string, count = 6): MenuProduct[] {
  if (categorySlug === 'hot-beverages') {
    return [
      {
        id: 'hot-beverages-0',
        name: 'Coffee',
        slug: 'hot-beverages-coffee',
        description: 'Freshly brewed coffee with a rich aroma and smooth finish.',
        price: '$4.50',
        categorySlug,
        badge: 'Signature',
      },
      {
        id: 'hot-beverages-1',
        name: 'Tea',
        slug: 'hot-beverages-tea',
        description: 'Classic milk tea prepared fresh for everyday comfort.',
        price: '$3.50',
        categorySlug,
      },
      {
        id: 'hot-beverages-2',
        name: 'Lemon Tea',
        slug: 'hot-beverages-lemon-tea',
        description: 'Refreshing lemon-infused tea with a light citrus flavour.',
        price: '$4.00',
        categorySlug,
      },
    ];
  }

  const labels: Record<string, string[]> = {
    falooda: [
      'Royal Falooda',
      'Rose Falooda',
      'Mango Falooda',
      'Pista Falooda',
      'Chocolate Falooda',
      'Kesar Falooda',
    ],
    'nuts-shake': [
      'Almond Shake',
      'Cashew Shake',
      'Pistachio Shake',
      'Mixed Nut Shake',
      'Date Nut Shake',
      'Walnut Shake',
    ],
    'biscuit-shake': [
      'Oreo Shake',
      'Bourbon Shake',
      'Digestive Shake',
      'Choco Chip Shake',
      'Marie Shake',
      'Kit Kat Shake',
    ],
    'ice-cream-shake': [
      'Vanilla Dream',
      'Chocolate Bliss',
      'Strawberry Cloud',
      'Mango Surge',
      'Butterscotch Swirl',
      'Rocky Road',
    ],
    'milk-shake': [
      'Strawberry Shake',
      'Chocolate Shake',
      'Vanilla Shake',
      'Banana Shake',
      'Mango Shake',
      'Rose Milk Shake',
    ],
    smoothies: [
      'Mango Smooth',
      'Berry Burst',
      'Green Detox',
      'Tropical Blend',
      'Papaya Glow',
      'Pomegranate Boost',
    ],
    'fresh-juice': [
      'Orange Juice',
      'Watermelon Juice',
      'Apple Juice',
      'Pineapple Juice',
      'Carrot Juice',
      'Mixed Fruit Juice',
    ],
    'avil-milk': ['Classic Avil Milk', 'Rose Avil Milk', 'Saffron Avil Milk', 'Cardamom Avil Milk'],
    mojito: [
      'Classic Mojito',
      'Watermelon Mojito',
      'Strawberry Mojito',
      'Blue Lagoon Mojito',
      'Pineapple Mojito',
    ],
    lime: ['Salted Lime', 'Sweet Lime', 'Lime Soda', 'Honey Lime', 'Ginger Lime'],
    'fruit-salad': ['Seasonal Bowl', 'Tropical Bowl', 'Berry Bowl', 'Citrus Bowl', 'Mixed Bowl'],
    'ice-cream-scoops': [
      'Vanilla Scoop',
      'Chocolate Scoop',
      'Strawberry Scoop',
      'Butterscotch Scoop',
      'Black Currant Scoop',
      'Mango Scoop',
      'Pistachio Scoop',
      'Cookies & Cream Scoop',
    ],
  };

  const names = labels[categorySlug] ?? Array.from({ length: count }, (_, i) => `Item ${i + 1}`);

  // Display all specific items if defined, otherwise limit to count
  const items = labels[categorySlug] ? names : names.slice(0, count);

  return items.map((name, i) => ({
    id: `${categorySlug}-${i}`,
    name,
    slug: `${categorySlug}-${name.toLowerCase().replace(/\s+/g, '-')}`,
    description: 'A carefully crafted menu item prepared fresh daily with premium ingredients.',
    price: `$${(8 + i * 1.5).toFixed(2)}`,
    categorySlug,
    ...(i === 0 ? { badge: 'Signature' } : {}),
  }));
}
