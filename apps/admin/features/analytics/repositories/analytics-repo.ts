import {
  AnalyticsSummary,
  DailyVisitStat,
  MonthlyVisitStat,
  PageVisitStat,
  DeviceBreakdown,
} from '@qbm/types';

export interface IAnalyticsRepository {
  getSummary(days?: number): Promise<AnalyticsSummary>;
  getDailyStats(days?: number): Promise<DailyVisitStat[]>;
  getMonthlyStats(months?: number): Promise<MonthlyVisitStat[]>;
  getTopPages(limit?: number): Promise<PageVisitStat[]>;
  getDeviceBreakdown(): Promise<DeviceBreakdown>;
}
