import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Building2, Search, ArrowUpRight } from 'lucide-react';
import { useSignals } from '../context/SignalsContext';
import { StrengthBadge, StatusBadge } from '../components/SignalBadge';
import { SignalStrength, STRENGTH_ORDER, SIGNAL_TYPE_LABELS } from '../types';

interface CompanyRow {
  name: string;
  industry: string;
  signalCount: number;
  highestStrength: SignalStrength;
  latestDate: string;
  newCount: number;
  criticalCount: number;
  recentSignals: { type: string; strength: SignalStrength; status: string; date: string }[];
}

export default function Companies() {
  const { signals } = useSignals();
  const [search, setSearch] = useState('');

  const companies = useMemo((): CompanyRow[] => {
    const map = new Map<string, CompanyRow>();

    signals.forEach((s) => {
      const existing = map.get(s.companyName);
      if (!existing) {
        map.set(s.companyName, {
          name: s.companyName,
          industry: s.industry,
          signalCount: 1,
          highestStrength: s.strength,
          latestDate: s.detectedAt,
          newCount: s.status === 'new' ? 1 : 0,
          criticalCount: s.strength === 'critical' ? 1 : 0,
          recentSignals: [{
            type: SIGNAL_TYPE_LABELS[s.signalType],
            strength: s.strength,
            status: s.status,
            date: s.detectedAt,
          }],
        });
      } else {
        map.set(s.companyName, {
          ...existing,
          signalCount: existing.signalCount + 1,
          highestStrength:
            STRENGTH_ORDER[s.strength] > STRENGTH_ORDER[existing.highestStrength]
              ? s.strength
              : existing.highestStrength,
          latestDate:
            parseISO(s.detectedAt) > parseISO(existing.latestDate) ? s.detectedAt : existing.latestDate,
          newCount: existing.newCount + (s.status === 'new' ? 1 : 0),
          criticalCount: existing.criticalCount + (s.strength === 'critical' ? 1 : 0),
          recentSignals: [
            ...existing.recentSignals,
            { type: SIGNAL_TYPE_LABELS[s.signalType], strength: s.strength, status: s.status, date: s.detectedAt },
          ],
        });
      }
    });

    return Array.from(map.values())
      .map((c) => ({
        ...c,
        recentSignals: c.recentSignals
          .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
          .slice(0, 3),
      }))
      .sort(
        (a, b) =>
          STRENGTH_ORDER[b.highestStrength] - STRENGTH_ORDER[a.highestStrength] ||
          b.signalCount - a.signalCount,
      );
  }, [signals]);

  const filtered = useMemo(() => {
    if (!search) return companies;
    const q = search.toLowerCase();
    return companies.filter((c) => c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q));
  }, [companies, search]);

  const strengthBar: Record<SignalStrength, string> = {
    critical: 'bg-green-500',
    high: 'bg-amber-400',
    medium: 'bg-blue-400',
    low: 'bg-slate-300',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Companies</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {filtered.length} of {companies.length} prospects with buying signals
          </p>
        </div>
        <Link
          to="/signals/add"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Log Signal
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search company or industry…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Company Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Building2 size={32} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No companies found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((company) => (
            <div
              key={company.name}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-slate-300 transition-colors"
            >
              {/* Company header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 size={17} className="text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-slate-900 truncate">{company.name}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{company.industry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StrengthBadge strength={company.highestStrength} />
                  <Link
                    to={`/signals?company=${encodeURIComponent(company.name)}`}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View
                    <ArrowUpRight size={12} />
                  </Link>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-slate-50 rounded-lg px-3 py-2 text-center">
                  <p className="text-lg font-bold text-slate-900">{company.signalCount}</p>
                  <p className="text-xs text-slate-500">Signals</p>
                </div>
                <div className="bg-violet-50 rounded-lg px-3 py-2 text-center">
                  <p className="text-lg font-bold text-violet-700">{company.newCount}</p>
                  <p className="text-xs text-violet-500">New</p>
                </div>
                <div className="bg-green-50 rounded-lg px-3 py-2 text-center">
                  <p className="text-lg font-bold text-green-700">{company.criticalCount}</p>
                  <p className="text-xs text-green-500">Critical</p>
                </div>
              </div>

              {/* Strength bar */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-slate-500 flex-shrink-0">Intensity</span>
                <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${strengthBar[company.highestStrength]}`}
                    style={{ width: `${(STRENGTH_ORDER[company.highestStrength] / 4) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">
                  Latest: {format(parseISO(company.latestDate), 'MMM d')}
                </span>
              </div>

              {/* Recent signals mini list */}
              {company.recentSignals.length > 0 && (
                <div className="space-y-1.5">
                  {company.recentSignals.map((sig, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <StatusBadge status={sig.status as Parameters<typeof StatusBadge>[0]['status']} />
                      <span className="text-xs text-slate-600 truncate flex-1">{sig.type}</span>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {format(parseISO(sig.date), 'MMM d')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400 text-center">
        Sorted by signal strength then volume · RFPs tracked separately
      </p>
    </div>
  );
}
