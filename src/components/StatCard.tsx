import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  color?: 'blue' | 'green' | 'amber' | 'purple' | 'slate';
  icon?: ReactNode;
}

const iconBg: Record<NonNullable<StatCardProps['color']>, string> = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  amber: 'bg-amber-50 text-amber-600',
  purple: 'bg-purple-50 text-purple-600',
  slate: 'bg-slate-100 text-slate-600',
};

export default function StatCard({ label, value, subtext, color = 'slate', icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1.5 leading-none">{value}</p>
          {subtext && <p className="text-xs text-slate-400 mt-1.5">{subtext}</p>}
        </div>
        {icon && (
          <div className={`p-2.5 rounded-lg flex-shrink-0 ${iconBg[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
