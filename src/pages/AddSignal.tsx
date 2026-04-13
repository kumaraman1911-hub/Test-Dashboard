import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import { useSignals } from '../context/SignalsContext';
import {
  BuyingSignal,
  SignalType,
  SignalStrength,
  SignalStatus,
  SIGNAL_TYPE_LABELS,
  SIGNAL_CATEGORY_LABELS,
  SIGNAL_TYPES_BY_CATEGORY,
  CATEGORY_BY_TYPE,
  SignalCategory,
} from '../types';
import { TEAM_MEMBERS, INDUSTRIES } from '../data/mockData';

interface FormState {
  companyName: string;
  industry: string;
  contactName: string;
  contactTitle: string;
  signalType: SignalType | '';
  strength: SignalStrength | '';
  source: string;
  description: string;
  detectedAt: string;
  status: SignalStatus;
  assignedTo: string;
  notes: string;
  tags: string;
}

const initialForm: FormState = {
  companyName: '',
  industry: '',
  contactName: '',
  contactTitle: '',
  signalType: '',
  strength: '',
  source: '',
  description: '',
  detectedAt: new Date().toISOString().split('T')[0],
  status: 'new',
  assignedTo: '',
  notes: '',
  tags: '',
};

const strengthOptions: { value: SignalStrength; label: string; hint: string }[] = [
  { value: 'low', label: 'Low', hint: 'Early awareness, weak intent' },
  { value: 'medium', label: 'Medium', hint: 'Genuine interest, researching options' },
  { value: 'high', label: 'High', hint: 'Active evaluation, strong indicators' },
  { value: 'critical', label: 'Critical', hint: 'Ready to buy, act now' },
];

const categories: SignalCategory[] = [
  'website_engagement', 'digital_activity', 'intent_data', 'event_triggers', 'relationship_signals',
];

export default function AddSignal() {
  const { signals, addSignal } = useSignals();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const existingCompanies = [...new Set(signals.map((s) => s.companyName))].sort();

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.companyName.trim()) e.companyName = 'Company name is required';
    if (!form.industry) e.industry = 'Industry is required';
    if (!form.signalType) e.signalType = 'Signal type is required';
    if (!form.strength) e.strength = 'Strength is required';
    if (!form.source.trim()) e.source = 'Source is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.assignedTo) e.assignedTo = 'Assigned to is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const signal: BuyingSignal = {
      id: crypto.randomUUID(),
      companyName: form.companyName.trim(),
      industry: form.industry,
      contactName: form.contactName.trim() || undefined,
      contactTitle: form.contactTitle.trim() || undefined,
      signalType: form.signalType as SignalType,
      category: CATEGORY_BY_TYPE[form.signalType as SignalType],
      strength: form.strength as SignalStrength,
      source: form.source.trim(),
      description: form.description.trim(),
      detectedAt: new Date(form.detectedAt + 'T12:00:00Z').toISOString(),
      status: form.status,
      assignedTo: form.assignedTo,
      notes: form.notes.trim() || undefined,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    addSignal(signal);
    navigate('/signals');
  }

  const fieldCls = (err?: string) =>
    `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      err ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
    }`;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Log Buying Signal</h1>
        <p className="text-slate-500 text-sm mt-0.5">Record a new intent or engagement signal for a CaseXellence prospect.</p>
      </div>

      {/* RFP notice */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
        <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <strong>RFPs are excluded from this tracker.</strong> If you received an RFP, please log it in the RFP Management system instead.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">

          {/* Section: Company */}
          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Company Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  list="companies-list"
                  value={form.companyName}
                  onChange={(e) => set('companyName', e.target.value)}
                  placeholder="e.g. Meridian Legal Partners"
                  className={fieldCls(errors.companyName)}
                />
                <datalist id="companies-list">
                  {existingCompanies.map((c) => <option key={c} value={c} />)}
                </datalist>
                {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Industry <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.industry}
                  onChange={(e) => set('industry', e.target.value)}
                  className={fieldCls(errors.industry)}
                >
                  <option value="">Select industry…</option>
                  {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                </select>
                {errors.industry && <p className="text-xs text-red-500 mt-1">{errors.industry}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Name <span className="text-slate-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={form.contactName}
                  onChange={(e) => set('contactName', e.target.value)}
                  placeholder="e.g. Sarah Chen"
                  className={fieldCls()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Title <span className="text-slate-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={form.contactTitle}
                  onChange={(e) => set('contactTitle', e.target.value)}
                  placeholder="e.g. VP Operations"
                  className={fieldCls()}
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section: Signal */}
          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Signal Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Signal Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.signalType}
                  onChange={(e) => set('signalType', e.target.value as SignalType)}
                  className={fieldCls(errors.signalType)}
                >
                  <option value="">Select type…</option>
                  {categories.map((cat) => (
                    <optgroup key={cat} label={SIGNAL_CATEGORY_LABELS[cat]}>
                      {SIGNAL_TYPES_BY_CATEGORY[cat].map((t) => (
                        <option key={t} value={t}>{SIGNAL_TYPE_LABELS[t]}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {errors.signalType && <p className="text-xs text-red-500 mt-1">{errors.signalType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Signal Strength <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.strength}
                  onChange={(e) => set('strength', e.target.value as SignalStrength)}
                  className={fieldCls(errors.strength)}
                >
                  <option value="">Select strength…</option>
                  {strengthOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label} — {o.hint}</option>
                  ))}
                </select>
                {errors.strength && <p className="text-xs text-red-500 mt-1">{errors.strength}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Source <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.source}
                  onChange={(e) => set('source', e.target.value)}
                  placeholder="e.g. LinkedIn, G2, Website Analytics"
                  className={fieldCls(errors.source)}
                />
                {errors.source && <p className="text-xs text-red-500 mt-1">{errors.source}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Date Detected</label>
                <input
                  type="date"
                  value={form.detectedAt}
                  onChange={(e) => set('detectedAt', e.target.value)}
                  className={fieldCls()}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="What specifically happened? Include context that makes this signal meaningful…"
                rows={3}
                className={fieldCls(errors.description)}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section: Assignment */}
          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Assignment & Status</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Assigned To <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.assignedTo}
                  onChange={(e) => set('assignedTo', e.target.value)}
                  className={fieldCls(errors.assignedTo)}
                >
                  <option value="">Select owner…</option>
                  {TEAM_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                {errors.assignedTo && <p className="text-xs text-red-500 mt-1">{errors.assignedTo}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => set('status', e.target.value as SignalStatus)}
                  className={fieldCls()}
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="acted_upon">Acted Upon</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Notes <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Next steps, follow-up actions, key context for the team…"
                rows={2}
                className={fieldCls()}
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Tags <span className="text-slate-400 font-normal">(optional, comma-separated)</span>
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => set('tags', e.target.value)}
                placeholder="e.g. priority, q2-target, enterprise"
                className={fieldCls()}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-5">
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Log Signal
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg border border-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
