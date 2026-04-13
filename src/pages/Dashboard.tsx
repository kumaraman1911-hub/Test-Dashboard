import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { subDays, subWeeks, startOfWeek, endOfWeek, format, parseISO } from 'date-fns';
import { Zap, Building2, TrendingUp, AlertTriangle } from 'lucide-react';
import { useSignals } from '../context/SignalsContext';
import StatCard from '../components/StatCard';
import { StrengthBadge, StatusBadge } from '../components/SignalBadge';
import { SIGNAL_TYPE_LABELS, SignalStrength, STRENGTH_ORDER } from '../types';

const STRENGTH_COLORS: Record<SignalStrength, string> = {
  critical: '#16a34a',
  high: '#f59e0b',
  medium: '#3b82f6',
  low: '#94a3b8',
};

export default function Dashboard() {
  const { signals } = useSignals();
  const now = new Date();

  const stats = useMemo(() => {
    const sevenDaysAgo = subDays(now, 7);
    return {
      total: signals.length,
      newThisWeek: signals.filter((s) => parseISO(s.detectedAt) >= sevenDaysAgo).length,
      critical: signals.filter((s) => s.strength === 'critical').length,
      companies: new Set(signals.map((s) => s.companyName)).size,
    };
  }, [signals]);

  // Weekly bar chart — last 8 weeks
  const trendData = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const weekStart = startOfWeek(subWeeks(now, 7 - i), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const count = signals.filter((s) => {
        const d = parseISO(s.detectedAt);
        return d >= weekStart && d <= weekEnd;
      }).length;
      return { week: format(weekStart, 'MMM d'), count };
    });
  }, [signals]);

  // Strength donut
  const strengthData = useMemo(() => {
    const strengths: SignalStrength[] = ['critical', 'high', 'medium', 'low'];
    return strengths
      .map((s) => ({ name: s.charAt(0).toUpperCase() + s.slice(1), value: signals.filter((sig) => sig.strength === s).length, color: STRENGTH_COLORS[s] }))
      .filter((d) => d.value > 0);
  }, [signals]);

  // Recent 6 signals
  const recentSignals = useMemo(
    () =>
      [...signals]
        .sort((a, b) => parseISO(b.detectedAt).getTime() - parseISO(a.detectedAt).getTime())
        .slice(0, 6),
    [signals],
  );

  // Top 5 companies by signal count (then highest strength)
  const topCompanies = useMemo(() => {
    const map = new Map<string, { count: number; highest: SignalStrength; industry: string }>();
    signals.forEach((s) => {
      const existing = map.get(s.companyName);
      if (!existing) {
        map.set(s.companyName, { count: 1, highest: s.strength, industry: s.industry });
      } else {
        map.set(s.companyName, {
          count: existing.count + 1,
          highest: STRENGTH_ORDER[s.strength] > STRENGTH_ORDER[existing.highest] ? s.strength : existing.highest,
          industry: existing.industry,
        });
      }
    });
    return Array.from(map.entries())
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.count - a.count || STRENGTH_ORDER[b.highest] - STRENGTH_ORDER[a.highest])
      .slice(0, 5);
  }, [signals]);

  // Category distribution for the mini breakdown
  const categoryBreakdown = useMemo(() => {
    const cats = ['website_engagement', 'event_triggers', 'intent_data', 'digital_activity', 'relationship_signals'] as const;
    return cats.map((c) => ({
      label: c.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      count: signals.filter((s) => s.category === c).length,
      pct: Math.round((signals.filter((s) => s.category === c).length / (signals.length || 1)) * 100),
    }));
  }, [signals]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Buying Signals Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Track intent and engagement signals across your prospect base · RFPs excluded
          </p>
        </div>
        <Link
          to="/signals/add"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Zap size={15} />
          Log Signal
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Signals"
          value={stats.total}
          subtext="All time"
          color="blue"
          icon={<Zap size={20} />}
        />
        <StatCard
          label="New This Week"
          value={stats.newThisWeek}
          subtext="Last 7 days"
          color="green"
          icon={<TrendingUp size={20} />}
        />
        <StatCard
          label="Critical Signals"
          value={stats.critical}
          subtext="Highest priority"
          color="amber"
          icon={<AlertTriangle size={20} />}
        />
        <StatCard
          label="Companies Tracked"
          value={stats.companies}
          subtext="Unique prospects"
          color="purple"
          icon={<Building2 size={20} />}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Trend */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Signal Trend — Last 8 Weeks</h2>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={trendData} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="count" name="Signals" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Strength donut */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-1">By Strength</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={strengthData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                dataKey="value"
                paddingAngle={2}
                strokeWidth={0}
              >
                {strengthData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                formatter={(v, name) => [v, name]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {strengthData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-slate-600 flex-1">{d.name}</span>
                <span className="font-semibold text-slate-800">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Signal Categories</h2>
        <div className="space-y-2.5">
          {categoryBreakdown.map((c) => (
            <div key={c.label} className="flex items-center gap-3">
              <span className="text-xs text-slate-600 w-40 flex-shrink-0">{c.label}</span>
              <div className="flex-1 bg-slate-100 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${c.pct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-700 w-8 text-right">{c.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent signals + Top companies */}
      <div className="grid grid-cols-2 gap-4">
        {/* Recent */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Recent Signals</h2>
            <Link to="/signals" className="text-xs text-blue-600 hover:underline font-medium">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentSignals.map((signal) => (
              <div key={signal.id} className="py-2.5 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{signal.companyName}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{SIGNAL_TYPE_LABELS[signal.signalType]}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <StrengthBadge strength={signal.strength} />
                  <span className="text-xs text-slate-400">{format(parseISO(signal.detectedAt), 'MMM d')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top companies */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Top Companies</h2>
            <Link to="/companies" className="text-xs text-blue-600 hover:underline font-medium">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {topCompanies.map((company) => (
              <div key={company.name} className="py-2.5 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{company.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{company.industry}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StrengthBadge strength={company.highest} />
                  <span className="text-xs text-slate-500">{company.count} signals</span>
                </div>
              </div>
            ))}
          </div>

          {/* Action items */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Needs Action</p>
            {signals
              .filter((s) => s.status === 'new')
              .slice(0, 3)
              .map((s) => (
                <div key={s.id} className="flex items-center gap-2 py-1">
                  <StatusBadge status={s.status} />
                  <span className="text-xs text-slate-700 truncate">{s.companyName}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
