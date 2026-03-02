import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  DollarSign,
  Clock,
  ArrowRight,
  TrendingUp,
  Building2,
  BarChart3,
  Plus,
} from 'lucide-react';
import { useRater } from '../context/RaterContext';

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

export default function Dashboard() {
  const { stats, submissions, profile } = useRater();
  const navigate = useNavigate();

  const quotedSubmissions = submissions.filter(s => s.status === 'quoted' || s.status === 'quoting');

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Welcome back, {profile.name}</p>
        </div>
        <button
          onClick={() => navigate('/submissions')}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-3.5 h-3.5" />
          New Submission
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<FileText className="w-4 h-4 text-white" />}
          iconBg="from-indigo-500 to-indigo-600"
          glow="shadow-indigo-500/25"
          label="Active Submissions"
          value={stats.activeSubmissions}
        />
        <StatCard
          icon={<BarChart3 className="w-4 h-4 text-white" />}
          iconBg="from-amber-500 to-orange-500"
          glow="shadow-amber-500/25"
          label="Quotes Received"
          value={stats.quotesReceived}
          subtitle={`Avg. ${stats.avgQuoteTime}`}
        />
        <StatCard
          icon={<CheckCircle className="w-4 h-4 text-white" />}
          iconBg="from-emerald-500 to-green-500"
          glow="shadow-emerald-500/25"
          label="Policies Bound"
          value={stats.policiesBound}
          subtitle={`${Math.round(stats.conversionRate * 100)}% conversion`}
        />
        <StatCard
          icon={<DollarSign className="w-4 h-4 text-white" />}
          iconBg="from-violet-500 to-purple-600"
          glow="shadow-violet-500/25"
          label="Total Premium"
          value={formatCurrency(stats.totalPremium)}
          subtitle="written this year"
        />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Carrier Response Rates */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-semibold text-white">Carrier Response</h2>
          </div>
          <div className="space-y-4">
            {stats.carrierResponseRates.map(({ carrier, rate, avgDays }) => (
              <div key={carrier}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400 truncate">{carrier}</span>
                  <span className="text-slate-400 shrink-0 ml-2 tabular-nums">
                    {Math.round(rate * 100)}%
                    <span className="text-slate-600"> &middot; {avgDays}d</span>
                  </span>
                </div>
                <div className="w-full bg-[#1c1c2a] rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-700 ${
                      rate >= 0.9
                        ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                        : rate >= 0.8
                        ? 'bg-gradient-to-r from-indigo-500 to-blue-400'
                        : 'bg-gradient-to-r from-amber-500 to-orange-400'
                    }`}
                    style={{ width: `${rate * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Monthly Activity */}
        <Card>
          <h2 className="text-sm font-semibold text-white mb-5">Monthly Activity</h2>
          <div className="flex items-end justify-between gap-1.5" style={{ height: '110px' }}>
            {stats.monthlyActivity.map(({ month, submissions: subs, bound }) => {
              const maxCount = Math.max(...stats.monthlyActivity.map(d => d.submissions), 1);
              const subPct = (subs / maxCount) * 100;
              const boundPct = (bound / maxCount) * 100;
              return (
                <div key={month} className="flex flex-col items-center flex-1 h-full">
                  <div className="relative flex-1 w-full flex items-end gap-0.5">
                    <div
                      className="flex-1 bg-indigo-500/25 rounded-t-sm transition-all duration-700"
                      style={{ height: `${subPct}%` }}
                    />
                    <div
                      className="flex-1 bg-emerald-500 rounded-t-sm transition-all duration-700"
                      style={{ height: `${boundPct}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-700 mt-1.5 shrink-0">{month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-indigo-500/40" /> Submitted
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-emerald-500" /> Bound
            </span>
          </div>
        </Card>

        {/* Lines of Business */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <Building2 className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-semibold text-white">Lines of Business</h2>
          </div>
          <div className="space-y-3">
            {stats.lineBreakdown.map(({ line, submissions: subs, bound }) => (
              <div key={line} className="flex items-center gap-2.5">
                <span className="text-xs text-slate-500 truncate" style={{ width: '110px', flexShrink: 0 }}>
                  {line.replace(' / ', '/')}
                </span>
                <div className="flex-1 bg-[#1c1c2a] rounded-full h-1">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-violet-500 h-1 rounded-full"
                    style={{ width: `${subs > 0 ? (bound / subs) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-slate-600 shrink-0 tabular-nums w-8 text-right">
                  {bound}/{subs}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Submissions Needing Attention */}
      {quotedSubmissions.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Submissions Needing Attention</h2>
            <button
              onClick={() => navigate('/submissions')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              View all
            </button>
          </div>
          <div className="space-y-2">
            {quotedSubmissions.slice(0, 4).map(sub => {
              const quotedCount = sub.quotes.filter(q => q.status === 'quoted').length;
              const pendingCount = sub.quotes.filter(q => q.status === 'pending' || q.status === 'referred').length;
              const earliestExpiry = sub.quotes
                .filter(q => q.expiresAt)
                .map(q => new Date(q.expiresAt!))
                .sort((a, b) => a.getTime() - b.getTime())[0];
              const daysUntilExpiry = earliestExpiry
                ? Math.ceil((earliestExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <div
                  key={sub.id}
                  onClick={() => navigate(`/compare/${sub.id}`)}
                  className="flex items-center gap-4 px-4 py-3 rounded-lg bg-[#0f0f19] border border-[#1c1c2a] hover:border-indigo-500/25 hover:bg-indigo-500/[0.04] cursor-pointer transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">
                        {sub.business.name}
                      </p>
                      <StatusBadge status={sub.status} />
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 truncate">
                      {sub.requestedLines.join(' · ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs shrink-0">
                    {quotedCount > 0 && (
                      <span className="text-emerald-400 font-medium">{quotedCount} quoted</span>
                    )}
                    {pendingCount > 0 && (
                      <span className="text-slate-600">{pendingCount} pending</span>
                    )}
                    {daysUntilExpiry !== null && daysUntilExpiry <= 10 && (
                      <span className={`font-medium flex items-center gap-1 ${daysUntilExpiry <= 3 ? 'text-red-400' : 'text-amber-400'}`}>
                        <Clock className="w-3 h-3" />
                        {daysUntilExpiry}d
                      </span>
                    )}
                    <ArrowRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-500 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Recent Quotes */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Recent Quotes</h2>
          <button
            onClick={() => navigate('/history')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            View all
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1c1c2a]">
                <th className="pb-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Carrier</th>
                <th className="pb-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Business</th>
                <th className="pb-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Line</th>
                <th className="pb-2.5 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">Premium</th>
                <th className="pb-2.5 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentQuotes.map((quote, i) => (
                <tr key={i} className="border-b border-[#1c1c2a]/60 hover:bg-white/[0.015] transition-colors">
                  <td className="py-3 text-sm font-medium text-white">{quote.carrier}</td>
                  <td className="py-3 text-sm text-slate-400">{quote.business}</td>
                  <td className="py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#1c1c2a] text-slate-500">
                      {quote.line}
                    </span>
                  </td>
                  <td className="py-3 text-sm font-semibold text-white text-right tabular-nums">
                    {formatCurrency(quote.premium)}
                  </td>
                  <td className="py-3 text-xs text-slate-600 text-right tabular-nums">
                    {new Date(quote.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#13131e] border border-[#1c1c2a] rounded-xl p-5">
      {children}
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  glow,
  label,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  iconBg: string;
  glow: string;
  label: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="bg-[#13131e] border border-[#1c1c2a] rounded-xl p-5 hover:border-[#252535] transition-colors">
      <div className="flex items-start gap-3.5">
        <div className={`bg-gradient-to-br ${iconBg} p-2.5 rounded-lg shadow-lg ${glow} shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-600 truncate">{label}</p>
          <p className="text-2xl font-bold text-white mt-0.5 leading-tight tabular-nums">{value}</p>
          {subtitle && <p className="text-xs text-slate-600 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-slate-800/80 text-slate-400',
    submitted: 'bg-blue-500/10 text-blue-400',
    quoting: 'bg-amber-500/10 text-amber-400',
    quoted: 'bg-emerald-500/10 text-emerald-400',
    bound: 'bg-green-500/10 text-green-400',
    declined: 'bg-red-500/10 text-red-400',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${styles[status] ?? 'bg-slate-800 text-slate-400'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
