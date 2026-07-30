/**
 * Route constants for the Customer and Admin applications.
 * Intended to be used by front-end applications for navigation and routing.
 */
export const ROUTES = {
  customer: {
    home: '/',
    category: '/category',
    product: '/product',
    search: '/search',
  },
  admin: {
    login: '/admin/login',
    dashboard: '/admin',
    categories: '/admin/categories',
    products: '/admin/products',
    settings: '/admin/settings',
  },
  api: {
    v1: '/api/v1',
  },
} as const;
