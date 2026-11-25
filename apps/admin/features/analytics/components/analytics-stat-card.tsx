import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@qbm/ui';

interface AnalyticsStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string | undefined;
  secondaryValue?: string | number | undefined;
  secondaryLabel?: string | undefined;
  icon: LucideIcon;
  badge?:
    | {
        text: string;
        variant?: 'emerald' | 'amber' | 'sky' | 'stone' | 'rose' | undefined;
      }
    | undefined;
  className?: string | undefined;
  onClick?: (() => void) | undefined;
}

export function AnalyticsStatCard({
  title,
  value,
  subtitle,
  secondaryValue,
  secondaryLabel,
  icon: Icon,
  badge,
  className,
  onClick,
}: AnalyticsStatCardProps) {
  const badgeColors = {
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    amber: 'bg-amber-50 text-amber-900 border-amber-200',
    sky: 'bg-sky-50 text-sky-900 border-sky-200',
    stone: 'bg-black/[0.05] text-black border-black/10',
    rose: 'bg-rose-50 text-rose-900 border-rose-200',
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        'bg-white/85 backdrop-blur-md border border-black/[0.08] rounded-2xl p-6 shadow-glass hover:shadow-glass-hover hover:bg-white/95 transition-all',
        onClick && 'cursor-pointer select-none',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-wider text-stone-500 uppercase">{title}</span>
        <div className="p-2.5 bg-black/[0.04] text-black border border-black/[0.06] rounded-xl">
          <Icon className="w-4 h-4 text-black" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-3">
        <span className="text-3xl font-extrabold tracking-tight text-black">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {badge && (
          <span
            className={cn(
              'text-xs font-bold px-2.5 py-0.5 rounded-full border',
              badgeColors[badge.variant || 'stone'],
            )}
          >
            {badge.text}
          </span>
        )}
      </div>

      {(subtitle || (secondaryValue !== undefined && secondaryLabel)) && (
        <div className="mt-3 text-xs text-stone-500 flex items-center justify-between border-t border-black/[0.06] pt-2.5">
          {subtitle && <span className="font-medium">{subtitle}</span>}
          {secondaryValue !== undefined && secondaryLabel && (
            <span className="font-medium text-stone-600">
              {secondaryLabel}:{' '}
              <strong className="text-black font-bold">
                {typeof secondaryValue === 'number'
                  ? secondaryValue.toLocaleString()
                  : secondaryValue}
              </strong>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
