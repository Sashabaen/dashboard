import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Shield,
  DollarSign,
  AlertTriangle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Building2,
  MapPin,
  Zap,
  FileCheck,
} from 'lucide-react';
import { useRater } from '../context/RaterContext';
import type { CarrierQuote, InsuranceLine } from '../types';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

const appetiteColors = {
  preferred: 'bg-green-100 text-green-800',
  standard: 'bg-blue-100 text-blue-800',
  limited: 'bg-amber-100 text-amber-800',
};

const quoteStatusIcons: Record<string, typeof CheckCircle2> = {
  quoted: CheckCircle2,
  pending: Clock,
  referred: AlertTriangle,
  declined: XCircle,
  bound: Shield,
};

const quoteStatusColors: Record<string, string> = {
  quoted: 'text-success-600',
  pending: 'text-gray-400',
  referred: 'text-amber-500',
  declined: 'text-danger-500',
  bound: 'text-green-700',
};

export default function Compare() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const { submissions, selectQuote, bindQuote } = useRater();
  const navigate = useNavigate();
  const [selectedLine, setSelectedLine] = useState<InsuranceLine | 'all'>('all');
  const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>(null);
  const [bindingId, setBindingId] = useState<string | null>(null);

  // If no submissionId, show selection view
  if (!submissionId) {
    const quotable = submissions.filter(
      s => s.quotes.length > 0 && s.status !== 'bound' && s.status !== 'declined' && s.status !== 'draft'
    );
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compare Quotes</h1>
          <p className="text-gray-500 mt-1">Select a submission to compare carrier quotes</p>
        </div>
        {quotable.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <FileCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg font-medium">No submissions with quotes to compare</p>
            <p className="text-gray-400 text-sm mt-1">Submit new risks to carriers to start receiving quotes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quotable.map(sub => {
              const quotedCount = sub.quotes.filter(q => q.status === 'quoted').length;
              const lowestPremium = sub.quotes
                .filter(q => q.annualPremium !== null)
                .reduce((min, q) => (q.annualPremium! < min ? q.annualPremium! : min), Infinity);

              return (
                <button
                  key={sub.id}
                  onClick={() => navigate(`/compare/${sub.id}`)}
                  className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:border-primary-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{sub.business.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {sub.business.industry} &middot; {sub.business.city}, {sub.business.state}
                      </p>
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success-50 text-success-600">
                      {quotedCount} quote{quotedCount > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {sub.requestedLines.map(line => (
                      <span key={line} className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {line}
                      </span>
                    ))}
                  </div>
                  {lowestPremium < Infinity && (
                    <p className="text-sm text-gray-500">
                      From <span className="font-semibold text-gray-900">{formatCurrency(lowestPremium)}</span>/yr
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const submission = submissions.find(s => s.id === submissionId);
  if (!submission) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Submission not found.</p>
        <button onClick={() => navigate('/compare')} className="text-primary-600 mt-2 text-sm">
          Go back
        </button>
      </div>
    );
  }

  const linesWithQuotes = [...new Set(submission.quotes.map(q => q.line))];
  const allLines: (InsuranceLine | 'all')[] = ['all', ...linesWithQuotes];

  const filteredQuotes = selectedLine === 'all'
    ? submission.quotes
    : submission.quotes.filter(q => q.line === selectedLine);

  const quotedQuotes = filteredQuotes.filter(q => q.status === 'quoted' || q.status === 'bound');
  const otherQuotes = filteredQuotes.filter(q => q.status !== 'quoted' && q.status !== 'bound');

  const handleBind = (quoteId: string) => {
    setBindingId(quoteId);
    selectQuote(submission.id, quoteId);
    setTimeout(() => {
      bindQuote(submission.id, quoteId);
      setBindingId(null);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/compare')}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Compare Quotes</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {submission.business.name}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {submission.business.city}, {submission.business.state}
            </span>
            <span>Eff. {new Date(submission.effectiveDate).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-primary-600 bg-primary-50 border border-primary-200 px-3 py-1.5 rounded-lg">
          <Zap className="w-3.5 h-3.5" />
          AI-deduplicated fields — only unique UW questions shown
        </div>
      </div>

      {/* Line Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {allLines.map(line => (
          <button
            key={line}
            onClick={() => setSelectedLine(line)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedLine === line
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {line === 'all' ? 'All Lines' : line}
            {line !== 'all' && (
              <span className="ml-1.5 opacity-75">
                ({submission.quotes.filter(q => q.line === line && q.status === 'quoted').length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Quoted Quotes — Side-by-Side Cards */}
      {quotedQuotes.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Available Quotes ({quotedQuotes.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {quotedQuotes
              .sort((a, b) => (a.annualPremium || 0) - (b.annualPremium || 0))
              .map((quote, index) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  isBestPrice={index === 0 && quotedQuotes.length > 1}
                  isExpanded={expandedQuoteId === quote.id}
                  isSelected={submission.selectedQuoteId === quote.id}
                  isBinding={bindingId === quote.id}
                  onToggleExpand={() => setExpandedQuoteId(expandedQuoteId === quote.id ? null : quote.id)}
                  onBind={() => handleBind(quote.id)}
                />
              ))}
          </div>
        </div>
      )}

      {/* Other statuses (pending, referred, declined) */}
      {otherQuotes.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Pending & Other ({otherQuotes.length})
          </h2>
          <div className="space-y-2">
            {otherQuotes.map(quote => {
              const StatusIcon = quoteStatusIcons[quote.status] || Clock;
              return (
                <div
                  key={quote.id}
                  className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4"
                >
                  <StatusIcon className={`w-5 h-5 ${quoteStatusColors[quote.status]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{quote.carrierName}</span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {quote.line}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${appetiteColors[quote.carrierAppetite]}`}>
                        {quote.carrierAppetite}
                      </span>
                    </div>
                    {quote.declineReason && (
                      <p className="text-xs text-red-500 mt-1">{quote.declineReason}</p>
                    )}
                    {quote.uwNotes && (
                      <p className="text-xs text-amber-600 mt-1">{quote.uwNotes}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 font-medium uppercase">
                    {quote.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filteredQuotes.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-lg font-medium">No quotes for this line yet</p>
          <p className="text-gray-400 text-sm mt-1">Quotes will appear here as carriers respond.</p>
        </div>
      )}
    </div>
  );
}

function QuoteCard({
  quote,
  isBestPrice,
  isExpanded,
  isSelected,
  isBinding,
  onToggleExpand,
  onBind,
}: {
  quote: CarrierQuote;
  isBestPrice: boolean;
  isExpanded: boolean;
  isSelected: boolean;
  isBinding: boolean;
  onToggleExpand: () => void;
  onBind: () => void;
}) {
  const daysUntilExpiry = quote.expiresAt
    ? Math.ceil((new Date(quote.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div
      className={`bg-white rounded-xl border-2 transition-all ${
        isSelected
          ? 'border-success-500 ring-2 ring-green-200'
          : quote.status === 'bound'
            ? 'border-green-400 bg-green-50/30'
            : isBestPrice
              ? 'border-primary-300'
              : 'border-gray-200'
      }`}
    >
      {/* Card Header */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start justify-between mb-1">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900">{quote.carrierName}</h3>
              {isBestPrice && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                  Best Price
                </span>
              )}
              {quote.status === 'bound' && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                  Bound
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              AM Best: {quote.amBestRating}
            </p>
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${appetiteColors[quote.carrierAppetite]}`}>
            {quote.carrierAppetite}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
            {quote.line}
          </span>
          {daysUntilExpiry !== null && (
            <span className={`text-xs font-medium ${daysUntilExpiry <= 5 ? 'text-danger-500' : 'text-gray-400'}`}>
              <Clock className="w-3 h-3 inline mr-0.5" />
              Expires in {daysUntilExpiry}d
            </span>
          )}
        </div>
      </div>

      {/* Premium */}
      <div className="px-5 py-4 border-t border-gray-100">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(quote.annualPremium!)}
              </span>
              <span className="text-sm text-gray-400">/yr</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 ml-6">
              {formatCurrency(quote.monthlyPremium!)}/mo
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Deductible</p>
            <p className="text-sm font-semibold text-gray-700">
              {quote.deductible ? formatCurrency(quote.deductible) : 'N/A'}
            </p>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xs text-gray-400">Coverage Limit</p>
          <p className="text-sm font-semibold text-gray-700">{quote.coverageLimit}</p>
        </div>
      </div>

      {/* Expandable Details */}
      <div className="border-t border-gray-100">
        <button
          onClick={onToggleExpand}
          className="w-full flex items-center justify-between px-5 py-2.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium">Coverage Details ({quote.coverageDetails.length})</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        {isExpanded && (
          <div className="px-5 pb-4 space-y-2">
            {quote.coverageDetails.map((detail, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{detail.label}</span>
                <span className="font-medium text-gray-900">{detail.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bind Action */}
      {quote.bindable && quote.status !== 'bound' && (
        <div className="px-5 pb-4">
          <button
            onClick={onBind}
            disabled={isBinding}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              isBinding
                ? 'bg-success-500 text-white'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {isBinding ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Binding...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Select & Bind
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
