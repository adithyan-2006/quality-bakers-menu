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
        'bg-white/85 backdrop-blur-md border border-black/[0.08] rounded-2xl p-6 shadow-glass hover:shadow-glass-hover hover:bg-white/95 transition-all',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">{title}</h3>
        <div className="p-2.5 bg-black/[0.04] text-black border border-black/[0.06] rounded-xl">
          <Icon className="w-4 h-4 text-black" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-4">
        <p className="text-3xl font-extrabold tracking-tight text-black">{value}</p>

        {trend && (
          <span
            className={cn(
              'text-sm font-medium',
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600',
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
