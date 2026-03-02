import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GitCompareArrows,
  History,
  Settings,
  FileText,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { useRater } from '../context/RaterContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/submissions', icon: FileText, label: 'Submissions' },
  { to: '/compare', icon: GitCompareArrows, label: 'Compare Quotes' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { submissions, stats, profile } = useRater();
  const activeCount = submissions.filter(
    s => s.status === 'quoting' || s.status === 'quoted'
  ).length;
  const urgentCount = submissions.filter(s => {
    if (s.status !== 'quoted') return false;
    return s.quotes.some(q => {
      if (!q.expiresAt) return false;
      const daysLeft = Math.ceil(
        (new Date(q.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return daysLeft <= 7 && daysLeft >= 0;
    });
  }).length;

  const initials = profile.name.split(' ').map(n => n[0]).join('');

  return (
    <aside className="w-60 bg-[#0d0d17] border-r border-[#1c1c2a] min-h-screen flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#1c1c2a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">RaterPro</p>
            <p className="text-xs text-slate-600">Commercial Insurance</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{label}</span>
            {label === 'Compare Quotes' && activeCount > 0 && (
              <span className="ml-auto bg-indigo-500/15 text-indigo-400 text-xs font-semibold px-1.5 py-0.5 rounded-full shrink-0">
                {activeCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Urgent alert */}
      {urgentCount > 0 && (
        <div className="px-3 pb-3">
          <div className="bg-amber-500/8 border border-amber-500/20 rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {urgentCount} quote{urgentCount > 1 ? 's' : ''} expiring soon
            </div>
          </div>
        </div>
      )}

      {/* Conversion rate */}
      <div className="px-3 pb-3">
        <div className="bg-[#13131e] border border-[#1c1c2a] rounded-lg px-3 py-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-600">Conversion Rate</span>
            <span className="text-xs font-semibold text-white">
              {Math.round(stats.conversionRate * 100)}%
            </span>
          </div>
          <div className="w-full bg-[#1c1c2a] rounded-full h-1">
            <div
              className="bg-gradient-to-r from-indigo-500 to-violet-500 h-1 rounded-full transition-all duration-700"
              style={{ width: `${stats.conversionRate * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-700 mt-1.5">
            {stats.policiesBound} of {stats.policiesBound + stats.activeSubmissions} bound
          </p>
        </div>
      </div>

      {/* User profile */}
      <div className="px-3 pb-4 border-t border-[#1c1c2a] pt-3">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer group">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{profile.name}</p>
            <p className="text-xs text-slate-600 truncate">{profile.agency}</p>
          </div>
          <Settings className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-500 transition-colors shrink-0" />
        </div>
      </div>
    </aside>
  );
}
