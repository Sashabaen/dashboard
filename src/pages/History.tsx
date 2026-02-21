import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Clock,
  Shield,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
} from 'lucide-react';
import { useRater } from '../context/RaterContext';
import type { SubmissionStatus } from '../types';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

const statusConfig: Record<SubmissionStatus, { label: string; style: string; icon: typeof Shield }> = {
  draft: { label: 'Draft', style: 'bg-gray-100 text-gray-600', icon: FileText },
  submitted: { label: 'Submitted', style: 'bg-blue-50 text-blue-700', icon: FileText },
  quoting: { label: 'Quoting', style: 'bg-amber-50 text-amber-700', icon: Clock },
  quoted: { label: 'Quoted', style: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  bound: { label: 'Bound', style: 'bg-green-100 text-green-800', icon: Shield },
  declined: { label: 'Declined', style: 'bg-red-50 text-red-700', icon: XCircle },
};

export default function History() {
  const { submissions } = useRater();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<SubmissionStatus | 'all'>('all');
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...submissions];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        s =>
          s.business.name.toLowerCase().includes(q) ||
          s.business.industry.toLowerCase().includes(q) ||
          s.quotes.some(qo => qo.carrierName.toLowerCase().includes(q)) ||
          s.requestedLines.some(l => l.toLowerCase().includes(q))
      );
    }
    if (filterStatus !== 'all') {
      result = result.filter(s => s.status === filterStatus);
    }
    result.sort((a, b) => {
      const da = new Date(a.updatedAt).getTime();
      const db = new Date(b.updatedAt).getTime();
      return sortAsc ? da - db : db - da;
    });
    return result;
  }, [submissions, search, filterStatus, sortAsc]);

  const totalBoundPremium = submissions
    .filter(s => s.status === 'bound')
    .reduce((sum, s) => {
      return sum + s.quotes
        .filter(q => q.status === 'bound' && q.annualPremium)
        .reduce((qSum, q) => qSum + (q.annualPremium || 0), 0);
    }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">History</h1>
          <p className="text-gray-500 mt-1">{submissions.length} submissions &middot; {formatCurrency(totalBoundPremium)} bound premium</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(['submitted', 'quoting', 'quoted', 'bound', 'declined'] as SubmissionStatus[]).map(status => {
          const count = submissions.filter(s => s.status === status).length;
          const config = statusConfig[status];
          const Icon = config.icon;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
              className={`p-3 rounded-lg border text-left transition-all ${
                filterStatus === status
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <Icon className={`w-4 h-4 mb-1 ${filterStatus === status ? 'text-primary-600' : 'text-gray-400'}`} />
              <p className="text-lg font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500">{config.label}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search business, carrier, line, or industry..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          {sortAsc ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Last Updated
        </button>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Filter className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No submissions match your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(sub => {
            const isExpanded = expandedId === sub.id;
            const config = statusConfig[sub.status];
            const totalQuotedPremium = sub.quotes
              .filter(q => q.annualPremium !== null)
              .reduce((sum, q) => sum + (q.annualPremium || 0), 0);
            const quotedCount = sub.quotes.filter(q => q.status === 'quoted' || q.status === 'bound').length;

            return (
              <div
                key={sub.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                  className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                >
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${config.style}`}>
                    {config.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-gray-900 truncate block">
                      {sub.business.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {sub.business.industry} &middot; {sub.business.city}, {sub.business.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400 shrink-0">
                    {quotedCount > 0 && (
                      <span className="text-gray-600 font-medium">{quotedCount} quote{quotedCount > 1 ? 's' : ''}</span>
                    )}
                    {totalQuotedPremium > 0 && (
                      <span className="flex items-center gap-1 text-gray-600">
                        <DollarSign className="w-3 h-3" />
                        {formatCurrency(totalQuotedPremium)}
                      </span>
                    )}
                    <span>{new Date(sub.updatedAt).toLocaleDateString()}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-400">Effective Date</p>
                        <p className="font-medium text-gray-900">{new Date(sub.effectiveDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Employees</p>
                        <p className="font-medium text-gray-900">{sub.business.employeeCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Revenue</p>
                        <p className="font-medium text-gray-900">{formatCurrency(sub.business.annualRevenue)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Submitted</p>
                        <p className="font-medium text-gray-900">{new Date(sub.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 mb-2">Requested Lines</p>
                      <div className="flex flex-wrap gap-1.5">
                        {sub.requestedLines.map(line => (
                          <span key={line} className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
                            {line}
                          </span>
                        ))}
                      </div>
                    </div>

                    {sub.quotes.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-400 mb-2">Quotes</p>
                        <div className="space-y-2">
                          {sub.quotes.map(q => (
                            <div key={q.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                              <div className="flex items-center gap-3">
                                <span className={`w-2 h-2 rounded-full ${
                                  q.status === 'quoted' || q.status === 'bound' ? 'bg-success-500'
                                  : q.status === 'pending' ? 'bg-gray-300'
                                  : q.status === 'referred' ? 'bg-amber-400'
                                  : 'bg-red-400'
                                }`} />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{q.carrierName}</p>
                                  <p className="text-xs text-gray-500">{q.line} &middot; {q.status}</p>
                                </div>
                              </div>
                              {q.annualPremium && (
                                <span className="text-sm font-semibold text-gray-900">
                                  {formatCurrency(q.annualPremium)}/yr
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {sub.notes && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400 font-medium mb-1">Notes</p>
                        <p className="text-sm text-gray-700">{sub.notes}</p>
                      </div>
                    )}

                    {sub.status !== 'bound' && sub.status !== 'declined' && sub.status !== 'draft' && sub.quotes.some(q => q.status === 'quoted') && (
                      <button
                        onClick={() => navigate(`/compare/${sub.id}`)}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700"
                      >
                        Compare Quotes &rarr;
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
