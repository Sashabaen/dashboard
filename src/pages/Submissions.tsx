import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Building2,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  ArrowRight,
  Clock,
  Sparkles,
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

const statusStyles: Record<SubmissionStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  quoting: 'bg-amber-50 text-amber-700 border-amber-200',
  quoted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  bound: 'bg-green-100 text-green-800 border-green-300',
  declined: 'bg-red-50 text-red-700 border-red-200',
};

export default function Submissions() {
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
          s.business.state.toLowerCase().includes(q) ||
          s.requestedLines.some(l => l.toLowerCase().includes(q))
      );
    }
    if (filterStatus !== 'all') {
      result = result.filter(s => s.status === filterStatus);
    }
    result.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortAsc ? da - db : db - da;
    });
    return result;
  }, [submissions, search, filterStatus, sortAsc]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
          <p className="text-gray-500 mt-1">{submissions.length} total submissions</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-white border border-gray-200 px-3 py-2 rounded-lg">
          <Sparkles className="w-3.5 h-3.5 text-primary-500" />
          <span>AI-powered pre-fill from third-party data</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search business name, industry, state, or line..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as SubmissionStatus | 'all')}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="quoting">Quoting</option>
            <option value="quoted">Quoted</option>
            <option value="bound">Bound</option>
            <option value="declined">Declined</option>
          </select>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            {sortAsc ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Date
          </button>
        </div>
      </div>

      {/* Submissions List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Filter className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No submissions match your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(sub => {
            const isExpanded = expandedId === sub.id;
            const quotedCount = sub.quotes.filter(q => q.status === 'quoted').length;
            const pendingCount = sub.quotes.filter(q => q.status === 'pending' || q.status === 'referred').length;
            const declinedCount = sub.quotes.filter(q => q.status === 'declined').length;
            const lowestPremium = sub.quotes
              .filter(q => q.annualPremium !== null)
              .sort((a, b) => (a.annualPremium || 0) - (b.annualPremium || 0))[0];

            return (
              <div
                key={sub.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                  className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {sub.business.name}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusStyles[sub.status]}`}>
                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {sub.business.industry} &middot; {sub.business.city}, {sub.business.state} &middot; {sub.requestedLines.length} line{sub.requestedLines.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs shrink-0">
                    {quotedCount > 0 && (
                      <span className="text-success-600 font-medium">{quotedCount} quoted</span>
                    )}
                    {pendingCount > 0 && (
                      <span className="text-amber-600 font-medium">{pendingCount} pending</span>
                    )}
                    {declinedCount > 0 && (
                      <span className="text-gray-400">{declinedCount} declined</span>
                    )}
                    <span className="text-gray-400">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                    {/* Business Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <InfoItem icon={Building2} label="Industry" value={sub.business.industry} />
                      <InfoItem icon={MapPin} label="Location" value={`${sub.business.city}, ${sub.business.state} ${sub.business.zipCode}`} />
                      <InfoItem icon={Users} label="Employees" value={sub.business.employeeCount.toString()} />
                      <InfoItem icon={DollarSign} label="Revenue" value={formatCurrency(sub.business.annualRevenue)} />
                      <InfoItem icon={Calendar} label="Effective Date" value={new Date(sub.effectiveDate).toLocaleDateString()} />
                      <InfoItem icon={Clock} label="Years in Business" value={sub.business.yearsInBusiness.toString()} />
                    </div>

                    {/* Requested Lines */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Requested Lines</h4>
                      <div className="flex flex-wrap gap-2">
                        {sub.requestedLines.map(line => (
                          <span key={line} className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
                            {line}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Best Quote */}
                    {lowestPremium && (
                      <div className="bg-success-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-green-600 font-medium">Best Available Quote</p>
                          <p className="text-sm font-semibold text-green-800">
                            {lowestPremium.carrierName} — {lowestPremium.line}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-green-800">
                          {formatCurrency(lowestPremium.annualPremium!)}/yr
                        </p>
                      </div>
                    )}

                    {sub.notes && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400 font-medium mb-1">Notes</p>
                        <p className="text-sm text-gray-700">{sub.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                      {sub.quotes.length > 0 && sub.status !== 'bound' && (
                        <button
                          onClick={() => navigate(`/compare/${sub.id}`)}
                          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                        >
                          Compare Quotes
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
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

function InfoItem({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-900 font-medium">{value}</p>
      </div>
    </div>
  );
}
