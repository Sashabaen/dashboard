import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  ListTodo,
  TrendingUp,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
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
  A: 'Response A',
  B: 'Response B',
  tie: 'Tie',
  both_bad: 'Both Bad',
};

const choiceColors: Record<RatingChoice, string> = {
  A: 'bg-blue-500',
  B: 'bg-purple-500',
  tie: 'bg-amber-500',
  both_bad: 'bg-red-500',
};

export default function Dashboard() {
  const { stats, ratings, tasks, profile } = useRater();
  const navigate = useNavigate();
  const progress = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  const totalChoices = Object.values(stats.choiceDistribution).reduce((a, b) => a + b, 0);

  const recentRatings = [...ratings].reverse().slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {profile.name}</p>
        </div>
        <button
          onClick={() => navigate('/compare')}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          Start Rating
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<ListTodo className="w-5 h-5 text-primary-600" />}
          label="Total Tasks"
          value={stats.totalTasks}
          bgColor="bg-primary-50"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5 text-success-600" />}
          label="Completed"
          value={stats.completedTasks}
          bgColor="bg-success-50"
          subtitle={`${progress}% complete`}
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-warning-500" />}
          label="Pending"
          value={stats.pendingTasks}
          bgColor="bg-warning-50"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-primary-600" />}
          label="Avg. Time"
          value={formatTime(stats.averageTimeMs)}
          bgColor="bg-primary-50"
          subtitle="per comparison"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Choice Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Choice Distribution</h2>
          </div>
          <div className="space-y-4">
            {(Object.entries(stats.choiceDistribution) as [RatingChoice, number][]).map(
              ([choice, count]) => (
                <div key={choice}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{choiceLabels[choice]}</span>
                    <span className="font-medium text-gray-900">
                      {count} {totalChoices > 0 && `(${Math.round((count / totalChoices) * 100)}%)`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`${choiceColors[choice]} h-2.5 rounded-full transition-all duration-500`}
                      style={{ width: `${totalChoices > 0 ? (count / totalChoices) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Weekly Activity</h2>
          <div className="flex items-end justify-between h-40 gap-2">
            {stats.dailyRatings.map(({ date, count }) => {
              const maxCount = Math.max(...stats.dailyRatings.map(d => d.count), 1);
              const height = (count / maxCount) * 100;
              const dayLabel = new Date(date).toLocaleDateString('en', { weekday: 'short' });
              return (
                <div key={date} className="flex flex-col items-center flex-1 gap-1">
                  <span className="text-xs font-medium text-gray-500">{count}</span>
                  <div className="w-full bg-gray-100 rounded-t-md relative" style={{ height: '120px' }}>
                    <div
                      className="absolute bottom-0 w-full bg-primary-500 rounded-t-md transition-all duration-500"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{dayLabel}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Categories</h2>
          <div className="space-y-3">
            {stats.categoryBreakdown.map(({ category, count, completed }) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-sm text-gray-700 truncate">{category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{completed}/{count}</span>
                  <div className="w-16 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-success-500 h-1.5 rounded-full"
                      style={{ width: `${(completed / count) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Ratings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Ratings</h2>
          <button
            onClick={() => navigate('/history')}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View all
          </button>
        </div>
        {recentRatings.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No ratings yet. Start comparing!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Prompt</th>
                  <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Choice</th>
                  <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                  <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentRatings.map(rating => {
                  const task = tasks.find(t => t.id === rating.taskId);
                  return (
                    <tr key={rating.id} className="hover:bg-gray-50">
                      <td className="py-3 text-sm text-gray-900 max-w-xs truncate">
                        {task?.prompt || 'Unknown task'}
                      </td>
                      <td className="py-3">
                        <ChoiceBadge choice={rating.choice} />
                      </td>
                      <td className="py-3">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < rating.confidence ? 'bg-primary-500' : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="py-3 text-sm text-gray-500">
                        {formatTime(rating.timeSpentMs)}
                      </td>
                      <td className="py-3 text-sm text-gray-500">
                        {new Date(rating.ratedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3">
        <div className={`${bgColor} p-2.5 rounded-lg`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function ChoiceBadge({ choice }: { choice: string }) {
  const styles: Record<string, string> = {
    A: 'bg-blue-50 text-blue-700 border-blue-200',
    B: 'bg-purple-50 text-purple-700 border-purple-200',
    tie: 'bg-amber-50 text-amber-700 border-amber-200',
    both_bad: 'bg-red-50 text-red-700 border-red-200',
  };
  const labels: Record<string, string> = {
    A: 'A wins',
    B: 'B wins',
    tie: 'Tie',
    both_bad: 'Both bad',
  };
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${styles[choice] || ''}`}>
      {labels[choice] || choice}
    </span>
  );
}
