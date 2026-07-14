'use client';

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  color?: 'blue' | 'indigo' | 'emerald' | 'orange' | 'purple' | 'green' | 'rose' | 'amber';
  loading?: boolean;
}

const colorConfigs: Record<string, { bg: string; text: string; iconBg: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', iconBg: 'bg-blue-100 text-blue-600' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', iconBg: 'bg-indigo-100 text-indigo-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-100 text-emerald-600' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', iconBg: 'bg-orange-100 text-orange-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', iconBg: 'bg-purple-100 text-purple-600' },
  green: { bg: 'bg-green-50', text: 'text-green-700', iconBg: 'bg-green-100 text-green-600' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-700', iconBg: 'bg-rose-100 text-rose-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', iconBg: 'bg-amber-100 text-amber-600' },
};

export const StatCard = memo(function StatCard({
  title,
  value,
  description,
  icon,
  color = 'blue',
  loading = false,
}: StatCardProps) {
  const config = colorConfigs[color] || colorConfigs.blue;

  return (
    <Card className={cn('border-gray-200', config.bg)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
            {loading ? (
              <div className="h-7 w-16 bg-gray-200 rounded animate-pulse" />
            ) : (
              <p className={cn('text-2xl font-bold', config.text)}>{value}</p>
            )}
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>
          <div className={cn('p-2 rounded-lg', config.iconBg)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
