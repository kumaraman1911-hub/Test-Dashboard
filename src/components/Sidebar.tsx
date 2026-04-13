import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Zap, Building2, PlusCircle } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/signals', label: 'All Signals', icon: Zap },
  { to: '/companies', label: 'Companies', icon: Building2 },
];

export default function Sidebar() {
  return (
    <aside className="w-60 bg-slate-900 flex flex-col flex-shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-500 rounded-md flex items-center justify-center flex-shrink-0">
            <Zap size={14} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">CaseXellence</div>
            <div className="text-slate-400 text-xs">Buying Signals</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-3 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Log Signal CTA */}
      <div className="px-3 pb-4">
        <NavLink
          to="/signals/add"
          className={({ isActive }) =>
            `flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              isActive
                ? 'bg-blue-400 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`
          }
        >
          <PlusCircle size={16} />
          Log Signal
        </NavLink>
      </div>

      <div className="px-5 py-3 border-t border-slate-700/60">
        <p className="text-slate-600 text-xs">RFPs tracked separately</p>
      </div>
    </aside>
  );
}
