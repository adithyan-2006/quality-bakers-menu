'use client';

import * as React from 'react';
import { AnalyticsSummary } from '@qbm/types';
import { AnalyticsStatCard } from './analytics-stat-card';
import { DailyVisitChart } from './daily-visit-chart';
import { MonthlyVisitChart } from './monthly-visit-chart';
import { TopPagesTable } from './top-pages-table';
import { DeviceOSBreakdown } from './device-os-breakdown';
import { RecentVisitsStream } from './recent-visits-stream';
import { LikesAnalyticsView } from './likes-analytics-view';
import {
  Eye,
  Calendar,
  TrendingUp,
  Download,
  RefreshCw,
  BarChart3,
  CalendarDays,
  FileText,
  Smartphone,
  Activity,
  Heart,
} from 'lucide-react';

interface AnalyticsDashboardViewProps {
  initialSummary: AnalyticsSummary;
}

export function AnalyticsDashboardView({ initialSummary }: AnalyticsDashboardViewProps) {
  const [summary, setSummary] = React.useState<AnalyticsSummary>(initialSummary);
  const [activeDays, setActiveDays] = React.useState<number>(30);
  const [activeTab, setActiveTab] = React.useState<
    'daily' | 'monthly' | 'pages' | 'devices' | 'stream' | 'likes'
  >('daily');
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);

  // Fetch updated analytics when days change or on refresh
  const fetchAnalytics = React.useCallback(async (days: number) => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/analytics?days=${days}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.error('Failed to refresh analytics data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleDaysChange = (newDays: number) => {
    setActiveDays(newDays);
    fetchAnalytics(newDays);
  };

  const handleRefresh = () => {
    fetchAnalytics(activeDays);
  };

  // Export Daily Visit stats as CSV.
  // Values are sanitized to prevent CSV injection: strings starting with
  // formula characters (=, +, -, @, TAB, CR) are prefixed with a single-quote
  // so spreadsheet applications treat them as plain text, not formulas.
  const sanitizeCsvCell = (value: string | number): string => {
    const str = String(value);
    // Numeric values are safe as-is
    if (typeof value === 'number') return str;
    // Escape double-quotes by doubling them, then wrap in double-quotes
    const escaped = str.replace(/"/g, '""');
    // Guard against formula injection (Excel, LibreOffice, Google Sheets)
    if (/^[=+\-@\t\r]/.test(escaped)) {
      return `"'${escaped}"`;
    }
    return `"${escaped}"`;
  };

  const handleExportCSV = () => {
    if (!summary.dailyStats || summary.dailyStats.length === 0) return;

    const headers = ['Date', 'Label', 'Total Visits', 'Unique Visitors'];
    const rows = summary.dailyStats.map((d) => [
      sanitizeCsvCell(d.date),
      sanitizeCsvCell(d.label),
      sanitizeCsvCell(d.visits),
      sanitizeCsvCell(d.uniqueVisitors),
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.map(sanitizeCsvCell).join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `quality-bakers-visits-${activeDays}days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-extrabold tracking-tight text-black">
              Website Traffic & Visitor Analytics
            </h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-black text-white shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Tracking
            </span>
          </div>
          <p className="text-sm text-stone-600 mt-1">
            Analyze website visitors per day, per month, and comprehensive visit statistics.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-black bg-white/80 hover:bg-white backdrop-blur-md border border-black/[0.08] rounded-xl transition-all shadow-glass"
            title="Export daily analytics data to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-black hover:bg-neutral-800 rounded-xl transition-all shadow-glass disabled:opacity-50"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Core Website & Engagement Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Total Visits */}
        <AnalyticsStatCard
          title="Total Website Visits"
          value={summary.totalVisits}
          icon={Eye}
          secondaryLabel="Unique Visitors"
          secondaryValue={summary.totalUniqueVisitors}
          badge={{ text: 'All Time', variant: 'stone' }}
          onClick={() => setActiveTab('daily')}
        />

        {/* Today's Visits */}
        <AnalyticsStatCard
          title="Visits Today"
          value={summary.todayVisits}
          icon={Calendar}
          secondaryLabel="Unique Today"
          secondaryValue={summary.todayUniqueVisitors}
          badge={{ text: 'Today', variant: 'emerald' }}
          onClick={() => setActiveTab('daily')}
        />

        {/* This Month's Visits */}
        <AnalyticsStatCard
          title="Visits This Month"
          value={summary.thisMonthVisits}
          icon={CalendarDays}
          secondaryLabel="Unique This Month"
          secondaryValue={summary.thisMonthUniqueVisitors}
          badge={{ text: 'Current Month', variant: 'sky' }}
          onClick={() => setActiveTab('monthly')}
        />

        {/* Daily Average & Peak */}
        <AnalyticsStatCard
          title="Daily Average Visits"
          value={summary.avgDailyVisits}
          icon={TrendingUp}
          secondaryLabel="Peak Day"
          secondaryValue={summary.peakDay ? `${summary.peakDay.visits} visits` : 'N/A'}
          badge={
            summary.peakDay
              ? { text: `Peak: ${summary.peakDay.date}`, variant: 'amber' }
              : undefined
          }
          onClick={() => setActiveTab('daily')}
        />

        {/* Total Product Likes */}
        <AnalyticsStatCard
          title="Total Product Likes"
          value={summary.likesSummary?.totalLikes ?? 0}
          icon={Heart}
          secondaryLabel="Liked Products"
          secondaryValue={
            summary.likesSummary
              ? `${summary.likesSummary.likedProductsCount} / ${summary.likesSummary.totalProductsCount}`
              : '0'
          }
          badge={{
            text:
              summary.likesSummary?.todayLikes && summary.likesSummary.todayLikes > 0
                ? `+${summary.likesSummary.todayLikes} today`
                : 'Customer Love',
            variant: 'rose',
          }}
          className={
            activeTab === 'likes' ? 'ring-2 ring-black border-black shadow-glass-hover' : ''
          }
          onClick={() => setActiveTab('likes')}
        />
      </div>

      {/* Analytics Tabs Navigation */}
      <div className="border-b border-black/[0.08]">
        <nav className="flex space-x-2 sm:space-x-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex items-center gap-2 py-3 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'daily'
                ? 'border-black text-black font-semibold'
                : 'border-transparent text-stone-500 hover:text-black'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Daily Breakdown</span>
          </button>

          <button
            onClick={() => setActiveTab('monthly')}
            className={`flex items-center gap-2 py-3 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'monthly'
                ? 'border-black text-black font-semibold'
                : 'border-transparent text-stone-500 hover:text-black'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Monthly Breakdown</span>
          </button>

          <button
            onClick={() => setActiveTab('likes')}
            className={`flex items-center gap-2 py-3 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'likes'
                ? 'border-rose-500 text-rose-600 font-semibold'
                : 'border-transparent text-stone-500 hover:text-black'
            }`}
          >
            <Heart
              className={`w-4 h-4 ${
                activeTab === 'likes' ? 'text-rose-500 fill-rose-500/20' : 'text-stone-400'
              }`}
            />
            <span>Product Likes ({summary.likesSummary?.totalLikes ?? 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('pages')}
            className={`flex items-center gap-2 py-3 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'pages'
                ? 'border-black text-black font-semibold'
                : 'border-transparent text-stone-500 hover:text-black'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Top Pages ({summary.topPages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('devices')}
            className={`flex items-center gap-2 py-3 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'devices'
                ? 'border-black text-black font-semibold'
                : 'border-transparent text-stone-500 hover:text-black'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Devices & Browsers</span>
          </button>

          <button
            onClick={() => setActiveTab('stream')}
            className={`flex items-center gap-2 py-3 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'stream'
                ? 'border-black text-black font-semibold'
                : 'border-transparent text-stone-500 hover:text-black'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Recent Visitors</span>
          </button>
        </nav>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'daily' && (
          <DailyVisitChart
            data={summary.dailyStats}
            activeDays={activeDays}
            onDaysChange={handleDaysChange}
            isLoading={isRefreshing}
          />
        )}

        {activeTab === 'monthly' && <MonthlyVisitChart data={summary.monthlyStats} />}

        {activeTab === 'likes' && summary.likesSummary && (
          <LikesAnalyticsView
            likesSummary={summary.likesSummary}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        )}

        {activeTab === 'pages' && (
          <TopPagesTable pages={summary.topPages} totalVisits={summary.totalVisits} />
        )}

        {activeTab === 'devices' && (
          <DeviceOSBreakdown
            devices={summary.devices}
            topDevices={summary.topDevices}
            browsers={summary.topBrowsers}
            operatingSystems={summary.topOS}
          />
        )}

        {activeTab === 'stream' && <RecentVisitsStream visits={summary.recentVisits} />}
      </div>
    </div>
  );
}
