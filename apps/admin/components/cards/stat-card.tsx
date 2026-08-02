import { LucideIcon } from 'lucide-react';
import { cn } from '@qbm/ui';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 shadow-sm',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400">{title}</h3>
        <div className="p-2 bg-stone-50 dark:bg-stone-800 rounded-lg">
          <Icon className="w-4 h-4 text-stone-600 dark:text-stone-300" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-4">
        <p className="text-3xl font-semibold text-stone-900 dark:text-stone-50">{value}</p>

        {trend && (
          <span
            className={cn(
              'text-sm font-medium',
              trend.isPositive
                ? 'text-emerald-600 dark:text-emerald-500'
                : 'text-rose-600 dark:text-rose-500',
            )}
          >
            {trend.isPositive ? '+' : '-'}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
