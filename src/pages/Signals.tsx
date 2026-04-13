import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Search, PlusCircle, X, SlidersHorizontal } from 'lucide-react';
import { useSignals } from '../context/SignalsContext';
import { StrengthBadge, StatusBadge, CategoryBadge } from '../components/SignalBadge';
import {
  SIGNAL_TYPE_LABELS,
  SIGNAL_CATEGORY_LABELS,
  SignalCategory,
  SignalStrength,
  SignalStatus,
} from '../types';

export default function Signals() {
  const { signals } = useSignals();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<SignalCategory | ''>((searchParams.get('category') as SignalCategory) || '');
  const [filterStrength, setFilterStrength] = useState<SignalStrength | ''>('');
  const [filterStatus, setFilterStatus] = useState<SignalStatus | ''>('');
  const [filterCompany, setFilterCompany] = useState(searchParams.get('company') || '');

  const companies = useMemo(() => [...new Set(signals.map((s) => s.companyName))].sort(), [signals]);

  const filtered = useMemo(() => {
    return [...signals]
      .filter((s) => {
        if (search) {
          const q = search.toLowerCase();
          if (!s.companyName.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q)) return false;
        }
        if (filterCategory && s.category !== filterCategory) return false;
        if (filterStrength && s.strength !== filterStrength) return false;
        if (filterStatus && s.status !== filterStatus) return false;
        if (filterCompany && s.companyName !== filterCompany) return false;
        return true;
      })
      .sort((a, b) => parseISO(b.detectedAt).getTime() - parseISO(a.detectedAt).getTime());
  }, [signals, search, filterCategory, filterStrength, filterStatus, filterCompany]);

  const hasFilters = search || filterCategory || filterStrength || filterStatus || filterCompany;

  function clearFilters() {
    setSearch('');
    setFilterCategory('');
    setFilterStrength('');
    setFilterStatus('');
    setFilterCompany('');
    setSearchParams({});
  }

  const categories: SignalCategory[] = [
    'website_engagement', 'digital_activity', 'intent_data', 'event_triggers', 'relationship_signals',
  ];
  const strengths: SignalStrength[] = ['critical', 'high', 'medium', 'low'];
  const statuses: SignalStatus[] = ['new', 'in_progress', 'acted_upon', 'closed'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Buying Signals</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {filtered.length} of {signals.length} signals · RFPs excluded
          </p>
        </div>
        <button
          onClick={() => navigate('/signals/add')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <PlusCircle size={16} />
          Log Signal
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={16} className="text-slate-400 flex-shrink-0" />

          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search company or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Company */}
          <select
            value={filterCompany}
            onChange={(e) => { setFilterCompany(e.target.value); setSearchParams(e.target.value ? { company: e.target.value } : {}); }}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
          >
            <option value="">All Companies</option>
            {companies.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Category */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as SignalCategory | '')}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{SIGNAL_CATEGORY_LABELS[c]}</option>
            ))}
          </select>

          {/* Strength */}
          <select
            value={filterStrength}
            onChange={(e) => setFilterStrength(e.target.value as SignalStrength | '')}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
          >
            <option value="">All Strengths</option>
            {strengths.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as SignalStatus | '')}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
          >
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === 'in_progress' ? 'In Progress' : s === 'acted_upon' ? 'Acted Upon' : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-2 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={13} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Search size={32} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No signals match your filters</p>
            <p className="text-sm mt-1">Try adjusting your search or clear the filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Company</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Signal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Strength</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Assigned</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Detected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((signal) => (
                  <tr key={signal.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{signal.companyName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{signal.industry}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-800">{SIGNAL_TYPE_LABELS[signal.signalType]}</div>
                      {signal.contactName && (
                        <div className="text-xs text-slate-400 mt-0.5">{signal.contactName}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <CategoryBadge category={signal.category} />
                    </td>
                    <td className="px-4 py-3">
                      <StrengthBadge strength={signal.strength} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={signal.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{signal.assignedTo}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {format(parseISO(signal.detectedAt), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend note */}
      <p className="text-xs text-slate-400 text-center">
        RFPs are tracked in a separate system and are excluded from this view.
      </p>
    </div>
  );
}
