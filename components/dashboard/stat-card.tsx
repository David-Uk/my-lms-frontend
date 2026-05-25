'use client';

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  color?: 'blue' | 'indigo' | 'emerald' | 'orange' | 'purple' | 'green' | 'rose' | 'amber';
  loading?: boolean;
  variant?: 'simple' | 'gradient';
}

const colorConfigs: Record<string, { bg: string; text: string; gradient: string; shadow: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-100' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', gradient: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-100' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', gradient: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-100' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', gradient: 'from-orange-500 to-orange-600', shadow: 'shadow-orange-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', gradient: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-100' },
  green: { bg: 'bg-green-50', text: 'text-green-600', gradient: 'from-green-500 to-green-600', shadow: 'shadow-green-100' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', gradient: 'from-rose-500 to-rose-600', shadow: 'shadow-rose-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', gradient: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-100' },
};

const GradientCard = memo(function GradientCard({ title, value, description, icon, config, loading }: StatCardProps & { config: typeof colorConfigs['blue'] }) {
  return (
    <Card className="border-none shadow-lg shadow-gray-100 rounded-3xl overflow-hidden hover:scale-[1.02] transition-transform duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn('p-3 rounded-2xl text-white shadow-lg', config.gradient, config.shadow)}>
            {icon}
          </div>
        </div>
        <div>
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse mb-1" />
          ) : (
            <div className="text-3xl font-black text-gray-900">{value}</div>
          )}
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mt-1">{title}</p>
          <p className="text-xs text-gray-400 mt-2 font-medium">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
});

const SimpleCard = memo(function SimpleCard({ title, value, description, icon, config, loading }: StatCardProps & { config: typeof colorConfigs['blue'] }) {
  return (
    <Card className="border-none shadow-lg shadow-gray-100 rounded-3xl overflow-hidden hover:scale-[1.02] transition-transform duration-300">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={cn('p-3 rounded-2xl', config.bg, config.text)}>
            {icon}
          </div>
          <div>
            {loading ? (
              <div className="h-6 w-16 bg-gray-100 rounded animate-pulse" />
            ) : (
              <div className="text-2xl font-black text-gray-900">{value}</div>
            )}
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">{title}</p>
            <p className="text-[10px] text-gray-400 font-medium mt-1">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export const StatCard = memo(function StatCard({
  title,
  value,
  description,
  icon,
  color = 'blue',
  loading = false,
  variant = 'simple',
}: StatCardProps) {
  const config = colorConfigs[color] || colorConfigs.blue;

  if (variant === 'gradient') {
    return <GradientCard title={title} value={value} description={description} icon={icon} config={config} loading={loading} />;
  }

  return <SimpleCard title={title} value={value} description={description} icon={icon} config={config} loading={loading} />;
});
