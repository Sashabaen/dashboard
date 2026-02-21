import { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Clock, MessageSquare } from 'lucide-react';
import { useRater } from '../context/RaterContext';
import type { RatingChoice } from '../types';

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

const choiceLabels: Record<RatingChoice, string> = {
  A: 'A wins',
  B: 'B wins',
  tie: 'Tie',
  both_bad: 'Both bad',
};

const choiceStyles: Record<RatingChoice, string> = {
  A: 'bg-blue-50 text-blue-700 border-blue-200',
  B: 'bg-purple-50 text-purple-700 border-purple-200',
  tie: 'bg-amber-50 text-amber-700 border-amber-200',
  both_bad: 'bg-red-50 text-red-700 border-red-200',
};

export default function History() {
  const { ratings, tasks } = useRater();
  const [search, setSearch] = useState('');
  const [filterChoice, setFilterChoice] = useState<RatingChoice | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(false);

  const filteredRatings = useMemo(() => {
    let result = [...ratings];

    if (search) {
      result = result.filter(r => {
        const task = tasks.find(t => t.id === r.taskId);
        return task?.prompt.toLowerCase().includes(search.toLowerCase()) ||
          r.reasoning.toLowerCase().includes(search.toLowerCase());
      });
    }

    if (filterChoice !== 'all') {
      result = result.filter(r => r.choice === filterChoice);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.ratedAt).getTime();
      const dateB = new Date(b.ratedAt).getTime();
      return sortAsc ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [ratings, tasks, search, filterChoice, sortAsc]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rating History</h1>
        <p className="text-gray-500 mt-1">{ratings.length} total ratings</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search prompts or reasoning..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterChoice}
            onChange={e => setFilterChoice(e.target.value as RatingChoice | 'all')}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="all">All Choices</option>
            <option value="A">A wins</option>
            <option value="B">B wins</option>
            <option value="tie">Tie</option>
            <option value="both_bad">Both bad</option>
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

      {/* Ratings List */}
      {filteredRatings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Filter className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No ratings match your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRatings.map(rating => {
            const task = tasks.find(t => t.id === rating.taskId);
            const isExpanded = expandedId === rating.id;

            return (
              <div
                key={rating.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : rating.id)}
                  className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                >
                  <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${choiceStyles[rating.choice]}`}>
                    {choiceLabels[rating.choice]}
                  </span>
                  <span className="flex-1 text-sm text-gray-900 font-medium truncate">
                    {task?.prompt || 'Unknown task'}
                  </span>
                  <div className="flex items-center gap-4 text-xs text-gray-400 shrink-0">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(rating.timeSpentMs)}
                    </span>
                    <span>{new Date(rating.ratedAt).toLocaleDateString()}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            i < rating.confidence ? 'bg-amber-400' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && task && (
                  <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                    <div>
                      <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Prompt</h4>
                      <p className="text-sm text-gray-700">{task.prompt}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`rounded-lg border p-4 ${rating.choice === 'A' ? 'border-blue-300 bg-blue-50/50' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-blue-600">Response A</span>
                          {rating.choice === 'A' && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Winner</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.itemA.content}</p>
                      </div>
                      <div className={`rounded-lg border p-4 ${rating.choice === 'B' ? 'border-purple-300 bg-purple-50/50' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-purple-600">Response B</span>
                          {rating.choice === 'B' && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Winner</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.itemB.content}</p>
                      </div>
                    </div>
                    {rating.reasoning && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-gray-400" />
                          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Reasoning</h4>
                        </div>
                        <p className="text-sm text-gray-700">{rating.reasoning}</p>
                      </div>
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
