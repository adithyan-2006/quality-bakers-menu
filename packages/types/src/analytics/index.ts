export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'other';

export interface WebsiteVisitRecord {
  id: string;
  path: string;
  referrer?: string | null;
  visitorId: string;
  sessionId?: string | null;
  deviceType?: string | null;
  deviceName?: string | null;
  browser?: string | null;
  os?: string | null;
  ipHash?: string | null;
  country?: string | null;
  createdAt: string | Date;
}

export interface DailyVisitStat {
  date: string; // 'YYYY-MM-DD'
  label: string; // e.g., 'Oct 17'
  visits: number;
  uniqueVisitors: number;
}

export interface MonthlyVisitStat {
  month: string; // 'YYYY-MM'
  label: string; // e.g., 'October 2026'
  visits: number;
  uniqueVisitors: number;
}

export interface PageVisitStat {
  path: string;
  visits: number;
  uniqueVisitors: number;
  percentage: number;
}

export interface DeviceBreakdown {
  desktop: number;
  mobile: number;
  tablet: number;
  other: number;
  uniqueDesktop: number;
  uniqueMobile: number;
  uniqueTablet: number;
  uniqueOther: number;
  totalUniqueDevices: number;
}

export interface DeviceModelStat {
  name: string; // Specific device name e.g., "Apple iPhone", "Windows PC", "Apple Mac", "Android Phone", "Apple iPad"
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'other';
  uniqueDevices: number; // UNIQUE COUNT OF PHYSICAL/VIRTUAL DEVICES
  visits: number; // Total page views from this device
  percentage: number; // Percentage of all unique devices
}

export interface BrowserStat {
  name: string;
  visits: number;
  percentage: number;
}

export interface OSStat {
  name: string;
  visits: number;
  percentage: number;
}

export interface ProductLikeStat {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  price: number;
  likes: number;
  percentage: number;
  imageUrl?: string | null;
  status: string;
  isAvailable: boolean;
  isFeatured: boolean;
}

export interface CategoryLikeStat {
  id: string;
  name: string;
  slug: string;
  likes: number;
  percentage: number;
  productCount: number;
  topProductName?: string | null;
  topProductLikes?: number;
}

export interface LikesAnalyticsSummary {
  totalLikes: number;
  todayLikes: number;
  thisMonthLikes: number;
  likedProductsCount: number;
  totalProductsCount: number;
  topCategoryName?: string | null;
  topProductName?: string | null;
  categories: CategoryLikeStat[];
  products: ProductLikeStat[];
}

export interface AnalyticsSummary {
  totalVisits: number;
  totalUniqueVisitors: number;
  todayVisits: number;
  todayUniqueVisitors: number;
  thisMonthVisits: number;
  thisMonthUniqueVisitors: number;
  avgDailyVisits: number;
  peakDay: { date: string; visits: number } | null;
  dailyStats: DailyVisitStat[];
  monthlyStats: MonthlyVisitStat[];
  topPages: PageVisitStat[];
  devices: DeviceBreakdown;
  topDevices: DeviceModelStat[];
  topBrowsers: BrowserStat[];
  topOS: OSStat[];
  recentVisits: Array<{
    id: string;
    path: string;
    deviceType: string | null;
    deviceName: string | null;
    browser: string | null;
    os: string | null;
    createdAt: string;
  }>;
  likesSummary: LikesAnalyticsSummary;
}

export interface TrackVisitPayload {
  path: string;
  referrer?: string;
  visitorId: string;
  sessionId?: string;
  deviceType?: string;
  deviceName?: string;
  browser?: string;
  os?: string;
  screenWidth?: number;
}
