import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GitCompareArrows,
  History,
  Settings,
  Shield,
  FileText,
  AlertCircle,
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
  const { submissions, stats } = useRater();
  const activeCount = submissions.filter(
    s => s.status === 'quoting' || s.status === 'quoted'
  ).length;
  const urgentCount = submissions.filter(s => {
    if (s.status !== 'quoted') return false;
    const hasExpiring = s.quotes.some(q => {
      if (!q.expiresAt) return false;
      const daysLeft = Math.ceil(
        (new Date(q.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return daysLeft <= 7 && daysLeft >= 0;
    });
    return hasExpiring;
  }).length;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">RaterPro</h1>
            <p className="text-xs text-gray-500">Commercial Insurance</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
            {label === 'Compare Quotes' && activeCount > 0 && (
              <span className="ml-auto bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {activeCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {urgentCount > 0 && (
        <div className="px-4 pb-2">
          <div className="bg-warning-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              {urgentCount} quote{urgentCount > 1 ? 's' : ''} expiring soon
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Conversion Rate</span>
            <span className="font-semibold text-gray-900">
              {Math.round(stats.conversionRate * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-success-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.conversionRate * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.policiesBound} of {stats.policiesBound + stats.activeSubmissions} bound
          </p>
        </div>
      </div>
    </aside>
  );
}
