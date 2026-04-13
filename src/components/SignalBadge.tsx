import { SignalStrength, SignalStatus, SignalCategory } from '../types';

// ── Strength ──────────────────────────────────────────────────────────────────
const strengthCfg: Record<SignalStrength, { label: string; cls: string; dot: string }> = {
  low: { label: 'Low', cls: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  medium: { label: 'Medium', cls: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  high: { label: 'High', cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  critical: { label: 'Critical', cls: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
};

export function StrengthBadge({ strength }: { strength: SignalStrength }) {
  const cfg = strengthCfg[strength];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ── Status ────────────────────────────────────────────────────────────────────
const statusCfg: Record<SignalStatus, { label: string; cls: string }> = {
  new: { label: 'New', cls: 'bg-violet-100 text-violet-700' },
  in_progress: { label: 'In Progress', cls: 'bg-blue-100 text-blue-700' },
  acted_upon: { label: 'Acted Upon', cls: 'bg-teal-100 text-teal-700' },
  closed: { label: 'Closed', cls: 'bg-slate-100 text-slate-500' },
};

export function StatusBadge({ status }: { status: SignalStatus }) {
  const cfg = statusCfg[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ── Category ──────────────────────────────────────────────────────────────────
const categoryCfg: Record<SignalCategory, { label: string; cls: string }> = {
  website_engagement: { label: 'Website', cls: 'bg-indigo-100 text-indigo-700' },
  digital_activity: { label: 'Digital', cls: 'bg-cyan-100 text-cyan-700' },
  intent_data: { label: 'Intent', cls: 'bg-orange-100 text-orange-700' },
  event_triggers: { label: 'Event', cls: 'bg-rose-100 text-rose-700' },
  relationship_signals: { label: 'Relationship', cls: 'bg-emerald-100 text-emerald-700' },
};

export function CategoryBadge({ category }: { category: SignalCategory }) {
  const cfg = categoryCfg[category];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}
