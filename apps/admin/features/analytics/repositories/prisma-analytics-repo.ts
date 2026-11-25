import { prisma } from '@qbm/database';
import {
  AnalyticsSummary,
  DailyVisitStat,
  MonthlyVisitStat,
  PageVisitStat,
  DeviceBreakdown,
  DeviceModelStat,
  BrowserStat,
  OSStat,
  ProductLikeStat,
  CategoryLikeStat,
  LikesAnalyticsSummary,
} from '@qbm/types';
import { IAnalyticsRepository } from './analytics-repo';

const REPORTING_TIMEZONE = 'Asia/Kolkata';

function getISTDateComponents(date: Date = new Date()): {
  year: number;
  month: number;
  day: number;
} {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: REPORTING_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.format(date).split('-').map(Number);
  const year = parts[0] ?? date.getFullYear();
  const month = parts[1] ?? date.getMonth() + 1;
  const day = parts[2] ?? date.getDate();
  return { year, month, day };
}

function getStartOfISTDay(date: Date = new Date()): Date {
  const { year, month, day } = getISTDateComponents(date);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0) - 5.5 * 3600 * 1000);
}

function getStartOfISTMonth(date: Date = new Date()): Date {
  const { year, month } = getISTDateComponents(date);
  return new Date(Date.UTC(year, month - 1, 1, 0, 0, 0) - 5.5 * 3600 * 1000);
}

function getStartOfISTDaysAgo(daysAgo: number): Date {
  const startToday = getStartOfISTDay();
  return new Date(startToday.getTime() - daysAgo * 24 * 3600 * 1000);
}

function getStartOfISTMonthsAgo(monthsAgo: number): Date {
  const { year, month } = getISTDateComponents();
  let targetMonth = month - monthsAgo;
  let targetYear = year;
  while (targetMonth < 1) {
    targetMonth += 12;
    targetYear -= 1;
  }
  return new Date(Date.UTC(targetYear, targetMonth - 1, 1, 0, 0, 0) - 5.5 * 3600 * 1000);
}

function formatISTDateKey(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: REPORTING_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

function formatISTDateLabel(date: Date): string {
  return date.toLocaleDateString('en-US', {
    timeZone: REPORTING_TIMEZONE,
    month: 'short',
    day: 'numeric',
  });
}

function formatISTMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', {
    timeZone: REPORTING_TIMEZONE,
    month: 'short',
    year: 'numeric',
  });
}

export class PrismaAnalyticsRepository implements IAnalyticsRepository {
  async getSummary(days: number = 30): Promise<AnalyticsSummary> {
    const startOfToday = getStartOfISTDay();
    const startOfMonth = getStartOfISTMonth();
    const startDate = getStartOfISTDaysAgo(days - 1);
    const start12MonthsAgo = getStartOfISTMonthsAgo(11);

    // Filter out internal admin routes and referrers so customer analytics strictly reflect customer traffic
    const [
      totalsRaw,
      dailyRaw,
      monthlyRaw,
      topPageRaw,
      deviceRaw,
      deviceModelRaw,
      browserRaw,
      osRaw,
      recentVisitsRaw,
      likeTotalsRaw,
      productsLikesRaw,
      categoriesRaw,
    ] = await Promise.all([
      // Consolidated scalar totals query (combines 6 queries into 1 to preserve database connection pool)
      prisma.$queryRaw<
        Array<{
          totalVisits: bigint;
          totalUniqueVisitors: bigint;
          todayVisits: bigint;
          todayUniqueVisitors: bigint;
          thisMonthVisits: bigint;
          thisMonthUniqueVisitors: bigint;
        }>
      >`
        SELECT
          COUNT(*)::bigint AS "totalVisits",
          COUNT(DISTINCT "visitorId")::bigint AS "totalUniqueVisitors",
          COUNT(*) FILTER (WHERE "createdAt" >= ${startOfToday})::bigint AS "todayVisits",
          COUNT(DISTINCT CASE WHEN "createdAt" >= ${startOfToday} THEN "visitorId" END)::bigint AS "todayUniqueVisitors",
          COUNT(*) FILTER (WHERE "createdAt" >= ${startOfMonth})::bigint AS "thisMonthVisits",
          COUNT(DISTINCT CASE WHEN "createdAt" >= ${startOfMonth} THEN "visitorId" END)::bigint AS "thisMonthUniqueVisitors"
        FROM "WebsiteVisit"
        WHERE "path" NOT LIKE '/dashboard%' 
          AND "path" NOT LIKE '/login%' 
          AND "path" NOT LIKE '/analytics%' 
          AND "path" NOT LIKE '/api/%' 
          AND ("referrer" IS NULL OR "referrer" NOT LIKE '%:3001%')
          AND "visitorId" NOT LIKE 'test_%'
          AND "visitorId" NOT LIKE 'mock_%'
      `.catch(() => [
        {
          totalVisits: BigInt(0),
          totalUniqueVisitors: BigInt(0),
          todayVisits: BigInt(0),
          todayUniqueVisitors: BigInt(0),
          thisMonthVisits: BigInt(0),
          thisMonthUniqueVisitors: BigInt(0),
        },
      ]),
      // Daily breakdown grouped by Asia/Kolkata date
      prisma.$queryRaw<Array<{ day: string; visits: bigint; unique_visitors: bigint }>>`
        SELECT 
          TO_CHAR("createdAt" AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD') AS day,
          COUNT(*)::bigint AS visits,
          COUNT(DISTINCT "visitorId")::bigint AS unique_visitors
        FROM "WebsiteVisit"
        WHERE "createdAt" >= ${startDate}
          AND "path" NOT LIKE '/dashboard%' 
          AND "path" NOT LIKE '/login%' 
          AND "path" NOT LIKE '/analytics%' 
          AND "path" NOT LIKE '/api/%' 
          AND ("referrer" IS NULL OR "referrer" NOT LIKE '%:3001%')
          AND "visitorId" NOT LIKE 'test_%'
          AND "visitorId" NOT LIKE 'mock_%'
        GROUP BY day
        ORDER BY day ASC
      `.catch(() => []),
      // Monthly breakdown grouped by Asia/Kolkata month
      prisma.$queryRaw<Array<{ month: string; visits: bigint; unique_visitors: bigint }>>`
        SELECT 
          TO_CHAR("createdAt" AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM') AS month,
          COUNT(*)::bigint AS visits,
          COUNT(DISTINCT "visitorId")::bigint AS unique_visitors
        FROM "WebsiteVisit"
        WHERE "createdAt" >= ${start12MonthsAgo}
          AND "path" NOT LIKE '/dashboard%' 
          AND "path" NOT LIKE '/login%' 
          AND "path" NOT LIKE '/analytics%' 
          AND "path" NOT LIKE '/api/%' 
          AND ("referrer" IS NULL OR "referrer" NOT LIKE '%:3001%')
          AND "visitorId" NOT LIKE 'test_%'
          AND "visitorId" NOT LIKE 'mock_%'
        GROUP BY month
        ORDER BY month ASC
      `.catch(() => []),
      // Top pages (filtered by selected timeframe)
      prisma.$queryRaw<Array<{ path: string; visits: bigint; unique_visitors: bigint }>>`
        SELECT 
          path,
          COUNT(*)::bigint AS visits,
          COUNT(DISTINCT "visitorId")::bigint AS unique_visitors
        FROM "WebsiteVisit"
        WHERE "createdAt" >= ${startDate}
          AND "path" NOT LIKE '/dashboard%' 
          AND "path" NOT LIKE '/login%' 
          AND "path" NOT LIKE '/analytics%' 
          AND "path" NOT LIKE '/api/%' 
          AND ("referrer" IS NULL OR "referrer" NOT LIKE '%:3001%')
          AND "visitorId" NOT LIKE 'test_%'
          AND "visitorId" NOT LIKE 'mock_%'
        GROUP BY path
        ORDER BY visits DESC
        LIMIT 10
      `.catch(() => []),
      // Device category breakdown (filtered by selected timeframe)
      prisma.$queryRaw<Array<{ device: string | null; visits: bigint; unique_devices: bigint }>>`
        SELECT 
          LOWER(COALESCE("deviceType", 'other')) AS device,
          COUNT(*)::bigint AS visits,
          COUNT(DISTINCT "visitorId")::bigint AS unique_devices
        FROM "WebsiteVisit"
        WHERE "createdAt" >= ${startDate}
          AND "path" NOT LIKE '/dashboard%' 
          AND "path" NOT LIKE '/login%' 
          AND "path" NOT LIKE '/analytics%' 
          AND "path" NOT LIKE '/api/%' 
          AND ("referrer" IS NULL OR "referrer" NOT LIKE '%:3001%')
          AND "visitorId" NOT LIKE 'test_%'
          AND "visitorId" NOT LIKE 'mock_%'
        GROUP BY device
      `.catch(() => []),
      // Specific Device Model breakdown (filtered by selected timeframe)
      prisma.$queryRaw<
        Array<{
          name: string | null;
          device_type: string | null;
          visits: bigint;
          unique_devices: bigint;
        }>
      >`
        SELECT 
          COALESCE("deviceName", CASE 
            WHEN "os" = 'iOS' AND "deviceType" = 'tablet' THEN 'Apple iPad'
            WHEN "os" = 'iOS' THEN 'Apple iPhone'
            WHEN "os" = 'Android' AND "deviceType" = 'tablet' THEN 'Android Tablet'
            WHEN "os" = 'Android' THEN 'Android Phone'
            WHEN "os" = 'macOS' THEN 'Apple Mac'
            WHEN "os" = 'Windows' THEN 'Windows PC'
            WHEN "deviceType" = 'mobile' THEN 'Mobile Device'
            ELSE 'Desktop PC'
          END) AS name,
          LOWER(COALESCE("deviceType", 'desktop')) AS device_type,
          COUNT(*)::bigint AS visits,
          COUNT(DISTINCT "visitorId")::bigint AS unique_devices
        FROM "WebsiteVisit"
        WHERE "createdAt" >= ${startDate}
          AND "path" NOT LIKE '/dashboard%' 
          AND "path" NOT LIKE '/login%' 
          AND "path" NOT LIKE '/analytics%' 
          AND "path" NOT LIKE '/api/%' 
          AND ("referrer" IS NULL OR "referrer" NOT LIKE '%:3001%')
          AND "visitorId" NOT LIKE 'test_%'
          AND "visitorId" NOT LIKE 'mock_%'
        GROUP BY name, device_type
        ORDER BY unique_devices DESC, visits DESC
        LIMIT 10
      `.catch(() => []),
      // Browser breakdown (filtered by selected timeframe)
      prisma.$queryRaw<Array<{ browser: string | null; count: bigint }>>`
        SELECT 
          COALESCE("browser", 'Other') AS browser,
          COUNT(*)::bigint AS count
        FROM "WebsiteVisit"
        WHERE "createdAt" >= ${startDate}
          AND "path" NOT LIKE '/dashboard%' 
          AND "path" NOT LIKE '/login%' 
          AND "path" NOT LIKE '/analytics%' 
          AND "path" NOT LIKE '/api/%' 
          AND ("referrer" IS NULL OR "referrer" NOT LIKE '%:3001%')
          AND "visitorId" NOT LIKE 'test_%'
          AND "visitorId" NOT LIKE 'mock_%'
        GROUP BY browser
        ORDER BY count DESC
        LIMIT 5
      `.catch(() => []),
      // OS breakdown (filtered by selected timeframe)
      prisma.$queryRaw<Array<{ os: string | null; count: bigint }>>`
        SELECT 
          COALESCE("os", 'Other') AS os,
          COUNT(*)::bigint AS count
        FROM "WebsiteVisit"
        WHERE "createdAt" >= ${startDate}
          AND "path" NOT LIKE '/dashboard%' 
          AND "path" NOT LIKE '/login%' 
          AND "path" NOT LIKE '/analytics%' 
          AND "path" NOT LIKE '/api/%' 
          AND ("referrer" IS NULL OR "referrer" NOT LIKE '%:3001%')
          AND "visitorId" NOT LIKE 'test_%'
          AND "visitorId" NOT LIKE 'mock_%'
        GROUP BY os
        ORDER BY count DESC
        LIMIT 5
      `.catch(() => []),
      // Recent visits with accurate deviceName
      prisma.$queryRaw<
        Array<{
          id: string;
          path: string;
          deviceType: string | null;
          deviceName: string | null;
          browser: string | null;
          os: string | null;
          createdAt: Date;
        }>
      >`
        SELECT 
          id,
          path,
          COALESCE("deviceName", CASE 
            WHEN "os" = 'iOS' AND "deviceType" = 'tablet' THEN 'Apple iPad'
            WHEN "os" = 'iOS' THEN 'Apple iPhone'
            WHEN "os" = 'Android' AND "deviceType" = 'tablet' THEN 'Android Tablet'
            WHEN "os" = 'Android' THEN 'Android Phone'
            WHEN "os" = 'macOS' THEN 'Apple Mac'
            WHEN "os" = 'Windows' THEN 'Windows PC'
            WHEN "deviceType" = 'mobile' THEN 'Mobile Device'
            ELSE 'Desktop PC'
          END) AS "deviceName",
          LOWER(COALESCE("deviceType", 'desktop')) AS "deviceType",
          COALESCE(browser, 'Other') AS browser,
          COALESCE(os, 'Other') AS os,
          "createdAt"
        FROM "WebsiteVisit"
        WHERE "path" NOT LIKE '/dashboard%' 
          AND "path" NOT LIKE '/login%' 
          AND "path" NOT LIKE '/analytics%' 
          AND "path" NOT LIKE '/api/%' 
          AND ("referrer" IS NULL OR "referrer" NOT LIKE '%:3001%')
          AND "visitorId" NOT LIKE 'test_%'
          AND "visitorId" NOT LIKE 'mock_%'
        ORDER BY "createdAt" DESC
        LIMIT 12
      `.catch(() => []),
      // Like Totals query (strictly scoped to active products in active categories)
      prisma.$queryRaw<
        Array<{
          totalLikes: bigint;
          todayLikes: bigint;
          thisMonthLikes: bigint;
          likedProductsCount: bigint;
        }>
      >`
        SELECT
          COUNT(pl.id)::bigint AS "totalLikes",
          COUNT(pl.id) FILTER (WHERE pl."createdAt" >= ${startOfToday})::bigint AS "todayLikes",
          COUNT(pl.id) FILTER (WHERE pl."createdAt" >= ${startOfMonth})::bigint AS "thisMonthLikes",
          COUNT(DISTINCT pl."productId")::bigint AS "likedProductsCount"
        FROM "ProductLike" pl
        JOIN "Product" p ON pl."productId" = p.id
        JOIN "Category" c ON p."categoryId" = c.id
        WHERE p."deletedAt" IS NULL AND c."deletedAt" IS NULL
      `.catch(() => [
        {
          totalLikes: BigInt(0),
          todayLikes: BigInt(0),
          thisMonthLikes: BigInt(0),
          likedProductsCount: BigInt(0),
        },
      ]),
      // Like count for every product with category and media info
      prisma.$queryRaw<
        Array<{
          id: string;
          name: string;
          slug: string;
          price: number;
          status: string;
          isAvailable: boolean;
          isFeatured: boolean;
          categoryId: string;
          categoryName: string;
          categorySlug: string;
          imageUrl: string | null;
          likes: number;
        }>
      >`
        SELECT 
          p.id,
          p.name,
          p.slug,
          p.price,
          p.status::text AS status,
          p."isAvailable",
          p."isFeatured",
          c.id AS "categoryId",
          c.name AS "categoryName",
          c.slug AS "categorySlug",
          COALESCE(m."thumbnailUrl", m."optimizedUrl", m."originalUrl") AS "imageUrl",
          COALESCE(GREATEST(plc.count, COUNT(pl.id)::int), COUNT(pl.id)::int, 0) AS "likes"
        FROM "Product" p
        JOIN "Category" c ON p."categoryId" = c.id
        LEFT JOIN "Media" m ON p."imageId" = m.id
        LEFT JOIN "ProductLikeCount" plc ON p.id = plc."productId"
        LEFT JOIN "ProductLike" pl ON p.id = pl."productId"
        WHERE p."deletedAt" IS NULL AND c."deletedAt" IS NULL
        GROUP BY p.id, p.name, p.slug, p.price, p.status, p."isAvailable", p."isFeatured", c.id, c.name, c.slug, m."thumbnailUrl", m."optimizedUrl", m."originalUrl", plc.count
        ORDER BY "likes" DESC, p.name ASC
      `.catch(() => []),
      // All active categories
      prisma.category
        .findMany({
          where: { deletedAt: null },
          select: { id: true, name: true, slug: true, displayOrder: true },
          orderBy: { displayOrder: 'asc' },
        })
        .catch(() => []),
    ]);

    const totals = totalsRaw[0] || {
      totalVisits: BigInt(0),
      totalUniqueVisitors: BigInt(0),
      todayVisits: BigInt(0),
      todayUniqueVisitors: BigInt(0),
      thisMonthVisits: BigInt(0),
      thisMonthUniqueVisitors: BigInt(0),
    };
    const totalVisits = Number(totals.totalVisits);
    const totalUniqueVisitors = Number(totals.totalUniqueVisitors);
    const todayVisits = Number(totals.todayVisits);
    const todayUniqueVisitors = Number(totals.todayUniqueVisitors);
    const thisMonthVisits = Number(totals.thisMonthVisits);
    const thisMonthUniqueVisitors = Number(totals.thisMonthUniqueVisitors);

    // Build continuous map for Daily Stats
    const dailyMap = new Map<string, { visits: number; uniqueVisitors: number }>();
    for (const row of dailyRaw) {
      dailyMap.set(row.day, {
        visits: Number(row.visits),
        uniqueVisitors: Number(row.unique_visitors),
      });
    }

    const dailyStats: DailyVisitStat[] = [];
    let loopTime = startDate.getTime();
    const todayTime = startOfToday.getTime();
    while (loopTime <= todayTime) {
      const loopDate = new Date(loopTime);
      const key = formatISTDateKey(loopDate);
      const data = dailyMap.get(key) || { visits: 0, uniqueVisitors: 0 };
      dailyStats.push({
        date: key,
        label: formatISTDateLabel(loopDate),
        visits: data.visits,
        uniqueVisitors: data.uniqueVisitors,
      });
      loopTime += 24 * 3600 * 1000;
    }

    // Build continuous map for Monthly Stats (last 12 months)
    const monthlyMap = new Map<string, { visits: number; uniqueVisitors: number }>();
    for (const row of monthlyRaw) {
      monthlyMap.set(row.month, {
        visits: Number(row.visits),
        uniqueVisitors: Number(row.unique_visitors),
      });
    }

    const monthlyStats: MonthlyVisitStat[] = [];
    const nowComponents = getISTDateComponents();
    const currentYear = nowComponents.year;
    const currentMonth = nowComponents.month;
    for (let i = 11; i >= 0; i--) {
      let m = currentMonth - i;
      let y = currentYear;
      while (m < 1) {
        m += 12;
        y -= 1;
      }
      const key = `${y}-${String(m).padStart(2, '0')}`;
      const sampleDate = new Date(Date.UTC(y, m - 1, 15, 0, 0, 0));
      const data = monthlyMap.get(key) || { visits: 0, uniqueVisitors: 0 };
      monthlyStats.push({
        month: key,
        label: formatISTMonthLabel(sampleDate),
        visits: data.visits,
        uniqueVisitors: data.uniqueVisitors,
      });
    }

    // Calculate Average Daily Visits and Peak Day
    let peakDay: { date: string; visits: number } | null = null;
    let sumDailyVisits = 0;
    for (const d of dailyStats) {
      sumDailyVisits += d.visits;
      if (d.visits > 0 && (!peakDay || d.visits > peakDay.visits)) {
        peakDay = { date: d.label, visits: d.visits };
      }
    }
    const avgDailyVisits =
      dailyStats.length > 0 ? Math.round((sumDailyVisits / dailyStats.length) * 10) / 10 : 0;

    // Period visits for accurate percentage calculations
    const periodVisits = dailyStats.reduce((sum, d) => sum + d.visits, 0);

    // Top Pages
    const pageDenominator = periodVisits > 0 ? periodVisits : totalVisits;
    const topPages: PageVisitStat[] = topPageRaw.map((p) => {
      const v = Number(p.visits);
      return {
        path: p.path,
        visits: v,
        uniqueVisitors: Number(p.unique_visitors),
        percentage: pageDenominator > 0 ? Math.round((v / pageDenominator) * 100) : 0,
      };
    });

    // Device category breakdown (Visits + Unique Devices)
    const devices: DeviceBreakdown = {
      desktop: 0,
      mobile: 0,
      tablet: 0,
      other: 0,
      uniqueDesktop: 0,
      uniqueMobile: 0,
      uniqueTablet: 0,
      uniqueOther: 0,
      totalUniqueDevices: 0,
    };
    for (const dev of deviceRaw) {
      const dName = (dev.device || 'other').toLowerCase();
      const vCount = Number(dev.visits);
      const uCount = Number(dev.unique_devices);
      if (dName === 'desktop') {
        devices.desktop += vCount;
        devices.uniqueDesktop += uCount;
      } else if (dName === 'mobile') {
        devices.mobile += vCount;
        devices.uniqueMobile += uCount;
      } else if (dName === 'tablet') {
        devices.tablet += vCount;
        devices.uniqueTablet += uCount;
      } else {
        devices.other += vCount;
        devices.uniqueOther += uCount;
      }
    }
    devices.totalUniqueDevices =
      devices.uniqueDesktop + devices.uniqueMobile + devices.uniqueTablet + devices.uniqueOther;

    // Specific Device Models
    const topDevicesRaw = deviceModelRaw.map((d) => {
      const uCount = Number(d.unique_devices);
      const vCount = Number(d.visits);
      const dType = (d.device_type || 'desktop').toLowerCase();
      const validDeviceType =
        dType === 'mobile' || dType === 'tablet' || dType === 'desktop' ? dType : 'other';
      return {
        name: d.name || 'Desktop PC',
        deviceType: validDeviceType as 'desktop' | 'mobile' | 'tablet' | 'other',
        uniqueDevices: uCount,
        visits: vCount,
        percentage: 0,
      };
    });
    const totalModelUniqueCount = topDevicesRaw.reduce((sum, d) => sum + d.uniqueDevices, 0);
    const topDevices: DeviceModelStat[] = topDevicesRaw.map((d) => ({
      ...d,
      percentage:
        totalModelUniqueCount > 0 ? Math.round((d.uniqueDevices / totalModelUniqueCount) * 100) : 0,
    }));

    // Top Browsers
    const totalBrowserCount = browserRaw.reduce((sum, b) => sum + Number(b.count), 0);
    const topBrowsers: BrowserStat[] = browserRaw.map((b) => ({
      name: b.browser || 'Other',
      visits: Number(b.count),
      percentage:
        totalBrowserCount > 0 ? Math.round((Number(b.count) / totalBrowserCount) * 100) : 0,
    }));

    // Top OS
    const totalOSCount = osRaw.reduce((sum, o) => sum + Number(o.count), 0);
    const topOS: OSStat[] = osRaw.map((o) => ({
      name: o.os || 'Other',
      visits: Number(o.count),
      percentage: totalOSCount > 0 ? Math.round((Number(o.count) / totalOSCount) * 100) : 0,
    }));

    // Recent visits
    const recentVisits = recentVisitsRaw.map((r) => ({
      id: r.id,
      path: r.path,
      deviceType: r.deviceType,
      deviceName: r.deviceName,
      browser: r.browser,
      os: r.os,
      createdAt:
        r.createdAt instanceof Date
          ? r.createdAt.toISOString()
          : new Date(r.createdAt).toISOString(),
    }));

    // ─── Process Likes Summary ───────────────────────────────────────────
    const likeTotals = likeTotalsRaw[0] || {
      totalLikes: BigInt(0),
      todayLikes: BigInt(0),
      thisMonthLikes: BigInt(0),
      likedProductsCount: BigInt(0),
    };

    const sumProductLikes = productsLikesRaw.reduce((acc, p) => acc + Number(p.likes), 0);
    const totalLikes = Math.max(Number(likeTotals.totalLikes), sumProductLikes);
    const todayLikes = Number(likeTotals.todayLikes);
    const thisMonthLikes = Number(likeTotals.thisMonthLikes);

    const productLikeStats: ProductLikeStat[] = productsLikesRaw.map((p) => {
      const likes = Number(p.likes);
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        categoryId: p.categoryId,
        categoryName: p.categoryName,
        categorySlug: p.categorySlug,
        price: Number(p.price) || 0,
        likes,
        percentage: totalLikes > 0 ? Math.round((likes / totalLikes) * 100) : 0,
        imageUrl: p.imageUrl,
        status: p.status,
        isAvailable: Boolean(p.isAvailable),
        isFeatured: Boolean(p.isFeatured),
      };
    });

    const likedProductsCount = productLikeStats.filter((p) => p.likes > 0).length;
    const totalProductsCount = productLikeStats.length;

    // Group by Category
    const categoryMap = new Map<
      string,
      {
        id: string;
        name: string;
        slug: string;
        likes: number;
        productCount: number;
        topProductName?: string | null;
        topProductLikes?: number;
      }
    >();

    for (const cat of categoriesRaw) {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        likes: 0,
        productCount: 0,
        topProductName: null,
        topProductLikes: 0,
      });
    }

    for (const p of productLikeStats) {
      const cat = categoryMap.get(p.categoryId);
      if (cat) {
        cat.productCount += 1;
        cat.likes += p.likes;
        if (p.likes > 0 && (!cat.topProductLikes || p.likes > cat.topProductLikes)) {
          cat.topProductLikes = p.likes;
          cat.topProductName = p.name;
        }
      } else {
        categoryMap.set(p.categoryId, {
          id: p.categoryId,
          name: p.categoryName,
          slug: p.categorySlug,
          likes: p.likes,
          productCount: 1,
          topProductName: p.likes > 0 ? p.name : null,
          topProductLikes: p.likes,
        });
      }
    }

    const categoryLikeStats: CategoryLikeStat[] = Array.from(categoryMap.values())
      .map((cat) => ({
        ...cat,
        percentage: totalLikes > 0 ? Math.round((cat.likes / totalLikes) * 100) : 0,
      }))
      .sort(
        (a, b) =>
          b.likes - a.likes || b.productCount - a.productCount || a.name.localeCompare(b.name),
      );

    const topCategoryName =
      categoryLikeStats.length > 0 && categoryLikeStats[0]?.likes
        ? categoryLikeStats[0].name
        : null;
    const topProductName =
      productLikeStats.length > 0 && productLikeStats[0]?.likes ? productLikeStats[0].name : null;

    const likesSummary: LikesAnalyticsSummary = {
      totalLikes,
      todayLikes,
      thisMonthLikes,
      likedProductsCount,
      totalProductsCount,
      topCategoryName,
      topProductName,
      categories: categoryLikeStats,
      products: productLikeStats,
    };

    return {
      totalVisits,
      totalUniqueVisitors,
      todayVisits,
      todayUniqueVisitors,
      thisMonthVisits,
      thisMonthUniqueVisitors,
      avgDailyVisits,
      peakDay,
      dailyStats,
      monthlyStats,
      topPages,
      devices,
      topDevices,
      topBrowsers,
      topOS,
      recentVisits,
      likesSummary,
    };
  }

  async getDailyStats(days: number = 30): Promise<DailyVisitStat[]> {
    const summary = await this.getSummary(days);
    return summary.dailyStats;
  }

  async getMonthlyStats(months: number = 12): Promise<MonthlyVisitStat[]> {
    const summary = await this.getSummary();
    return summary.monthlyStats.slice(-months);
  }

  async getTopPages(limit: number = 10): Promise<PageVisitStat[]> {
    const summary = await this.getSummary();
    return summary.topPages.slice(0, limit);
  }

  async getDeviceBreakdown(): Promise<DeviceBreakdown> {
    const summary = await this.getSummary();
    return summary.devices;
  }
}

export const AnalyticsRepository = new PrismaAnalyticsRepository();
