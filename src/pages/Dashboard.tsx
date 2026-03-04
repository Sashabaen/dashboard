import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  DollarSign,
  Clock,
  ArrowRight,
  BarChart3,
  TrendingUp,
  Building2,
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {profile.name}</p>
        </div>
        <button
          onClick={() => navigate('/submissions')}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          <FileText className="w-4 h-4" />
          New Submission
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<FileText className="w-5 h-5 text-primary-400" />}
          label="Active Submissions"
          value={stats.activeSubmissions}
          bgColor="bg-primary-900/40"
        />
        <StatCard
          icon={<BarChart3 className="w-5 h-5 text-amber-400" />}
          label="Quotes Received"
          value={stats.quotesReceived}
          bgColor="bg-amber-900/40"
          subtitle={`Avg. ${stats.avgQuoteTime}`}
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5 text-success-500" />}
          label="Policies Bound"
          value={stats.policiesBound}
          bgColor="bg-green-900/40"
          subtitle={`${Math.round(stats.conversionRate * 100)}% conversion`}
        />
        <StatCard
          icon={<DollarSign className="w-5 h-5 text-primary-400" />}
          label="Total Premium"
          value={formatCurrency(stats.totalPremium)}
          bgColor="bg-primary-900/40"
          subtitle="written this year"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carrier Response Rates */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 lg:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-100">Carrier Response</h2>
          </div>
          <div className="space-y-4">
            {stats.carrierResponseRates.map(({ carrier, rate, avgDays }) => (
              <div key={carrier}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400 truncate">{carrier}</span>
                  <span className="font-medium text-gray-200 shrink-0 ml-2">
                    {Math.round(rate * 100)}% &middot; {avgDays}d
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      rate >= 0.9 ? 'bg-success-500' : rate >= 0.8 ? 'bg-primary-500' : 'bg-warning-500'
                    }`}
                    style={{ width: `${rate * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Activity */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-100 mb-6">Monthly Activity</h2>
          <div className="flex items-end justify-between h-40 gap-2">
            {stats.monthlyActivity.map(({ month, submissions: subs, bound }) => {
              const maxCount = Math.max(...stats.monthlyActivity.map(d => d.submissions), 1);
              const subHeight = (subs / maxCount) * 100;
              const boundHeight = (bound / maxCount) * 100;
              return (
                <div key={month} className="flex flex-col items-center flex-1 gap-1">
                  <span className="text-xs font-medium text-gray-500">{subs}</span>
                  <div className="w-full relative" style={{ height: '120px' }}>
                    <div className="absolute bottom-0 w-full flex gap-0.5">
                      <div
                        className="flex-1 bg-primary-800 rounded-t-md transition-all duration-500"
                        style={{ height: `${subHeight}%` }}
                      />
                      <div
                        className="flex-1 bg-success-500 rounded-t-md transition-all duration-500"
                        style={{ height: `${boundHeight}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-primary-800 rounded" /> Submitted
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-success-500 rounded" /> Bound
            </span>
          </div>
        </div>

        {/* Lines of Business */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 lg:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-100">Lines of Business</h2>
          </div>
          <div className="space-y-3">
            {stats.lineBreakdown.map(({ line, submissions: subs, bound }) => (
              <div key={line} className="flex items-center justify-between">
                <span className="text-sm text-gray-300 truncate flex-1 min-w-0">
                  {line.replace(' / ', '/')}
                </span>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-xs text-gray-500">{bound}/{subs}</span>
                  <div className="w-16 bg-gray-800 rounded-full h-1.5">
                    <div
                      className="bg-primary-500 h-1.5 rounded-full"
                      style={{ width: `${subs > 0 ? (bound / subs) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Items: Submissions needing attention */}
      {quotedSubmissions.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-100">Submissions Needing Attention</h2>
            <button
              onClick={() => navigate('/submissions')}
              className="text-sm text-primary-400 hover:text-primary-300 font-medium"
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
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
                  className="flex items-center gap-4 p-4 rounded-lg border border-gray-800 hover:border-primary-700 hover:bg-primary-900/20 cursor-pointer transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-100 truncate">
                        {sub.business.name}
                      </p>
                      <StatusBadge status={sub.status} />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {sub.requestedLines.join(' · ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs shrink-0">
                    {quotedCount > 0 && (
                      <span className="text-success-500 font-medium">{quotedCount} quoted</span>
                    )}
                    {pendingCount > 0 && (
                      <span className="text-gray-500">{pendingCount} pending</span>
                    )}
                    {daysUntilExpiry !== null && daysUntilExpiry <= 10 && (
                      <span className={`font-medium ${daysUntilExpiry <= 3 ? 'text-danger-500' : 'text-warning-500'}`}>
                        <Clock className="w-3 h-3 inline mr-1" />
                        {daysUntilExpiry}d left
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Quotes */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-100">Recent Quotes</h2>
          <button
            onClick={() => navigate('/history')}
            className="text-sm text-primary-400 hover:text-primary-300 font-medium"
          >
            View all
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-800">
                <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Carrier</th>
                <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Line</th>
                <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Premium</th>
                <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {stats.recentQuotes.map((quote, i) => (
                <tr key={i} className="hover:bg-gray-800/50">
                  <td className="py-3 text-sm font-medium text-gray-200">{quote.carrier}</td>
                  <td className="py-3 text-sm text-gray-400">{quote.business}</td>
                  <td className="py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                      {quote.line}
                    </span>
                  </td>
                  <td className="py-3 text-sm font-semibold text-gray-200 text-right">
                    {formatCurrency(quote.premium)}
                  </td>
                  <td className="py-3 text-sm text-gray-500 text-right">
                    {new Date(quote.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  bgColor,
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  bgColor: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex items-center gap-3">
        <div className={`${bgColor} p-2.5 rounded-lg`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-100">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-gray-800 text-gray-400',
    submitted: 'bg-blue-900/50 text-blue-400',
    quoting: 'bg-amber-900/50 text-amber-400',
    quoted: 'bg-green-900/50 text-green-400',
    bound: 'bg-green-900/60 text-green-300',
    declined: 'bg-red-900/50 text-red-400',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] || ''}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
