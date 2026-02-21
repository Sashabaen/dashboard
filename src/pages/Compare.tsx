import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SkipForward,
  Send,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { useRater } from '../context/RaterContext';
import type { RatingChoice } from '../types';

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

const ratingOptions: { value: RatingChoice; label: string; description: string; color: string }[] = [
  { value: 'A', label: 'A is Better', description: 'Response A is the better answer', color: 'border-blue-300 bg-blue-50 hover:border-blue-500 text-blue-800' },
  { value: 'B', label: 'B is Better', description: 'Response B is the better answer', color: 'border-purple-300 bg-purple-50 hover:border-purple-500 text-purple-800' },
  { value: 'tie', label: 'Tie', description: 'Both responses are equally good', color: 'border-amber-300 bg-amber-50 hover:border-amber-500 text-amber-800' },
  { value: 'both_bad', label: 'Both Bad', description: 'Neither response is adequate', color: 'border-red-300 bg-red-50 hover:border-red-500 text-red-800' },
];

const selectedStyles: Record<RatingChoice, string> = {
  A: 'border-blue-500 bg-blue-100 ring-2 ring-blue-200',
  B: 'border-purple-500 bg-purple-100 ring-2 ring-purple-200',
  tie: 'border-amber-500 bg-amber-100 ring-2 ring-amber-200',
  both_bad: 'border-red-500 bg-red-100 ring-2 ring-red-200',
};

export default function Compare() {
  const { getCurrentTask, submitRating, skipTask, getUnratedTasks, stats } = useRater();
  const navigate = useNavigate();
  const task = getCurrentTask();
  const unratedTasks = getUnratedTasks();

  const [selectedChoice, setSelectedChoice] = useState<RatingChoice | null>(null);
  const [confidence, setConfidence] = useState(3);
  const [reasoning, setReasoning] = useState('');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
    setSelectedChoice(null);
    setConfidence(3);
    setReasoning('');
    setElapsedMs(0);
    setSubmitted(false);
  }, [task?.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 1000);
    return () => clearInterval(interval);
  }, [task?.id]);

  const handleSubmit = () => {
    if (!selectedChoice || !task) return;
    const timeSpent = Date.now() - startTimeRef.current;
    submitRating(selectedChoice, confidence, reasoning, timeSpent);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
    }, 1500);
  };

  if (unratedTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-success-50 p-4 rounded-full mb-4">
          <CheckCircle2 className="w-12 h-12 text-success-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">All Done!</h2>
        <p className="text-gray-500 mb-6 max-w-md">
          You've completed all {stats.totalTasks} comparison tasks. Check your results on the dashboard.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          View Dashboard
        </button>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compare Responses</h1>
          <p className="text-gray-500 mt-1">
            Task {stats.completedTasks + 1} of {stats.totalTasks}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
            <Clock className="w-4 h-4" />
            {formatTime(elapsedMs)}
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            task.difficulty === 'easy'
              ? 'bg-green-50 text-green-700'
              : task.difficulty === 'medium'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-red-50 text-red-700'
          }`}>
            {task.difficulty}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
            {task.category}
          </span>
        </div>
      </div>

      {/* Prompt */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Prompt</h3>
        <p className="text-gray-900 font-medium text-lg">{task.prompt}</p>
      </div>

      {/* Side-by-side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResponseCard
          label="Response A"
          content={task.itemA.content}
          source={task.itemA.source}
          isSelected={selectedChoice === 'A'}
          accentColor="blue"
          onClick={() => setSelectedChoice('A')}
        />
        <ResponseCard
          label="Response B"
          content={task.itemB.content}
          source={task.itemB.source}
          isSelected={selectedChoice === 'B'}
          accentColor="purple"
          onClick={() => setSelectedChoice('B')}
        />
      </div>

      {/* Rating Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Your Verdict</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ratingOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setSelectedChoice(option.value)}
                className={`border-2 rounded-xl p-3 text-center transition-all ${
                  selectedChoice === option.value
                    ? selectedStyles[option.value]
                    : option.color
                }`}
              >
                <div className="font-semibold text-sm">{option.label}</div>
                <div className="text-xs mt-0.5 opacity-75">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Confidence Level
          </h3>
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setConfidence(i + 1)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-7 h-7 ${
                    i < confidence
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-500">{confidence}/5</span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Reasoning <span className="text-gray-400 font-normal">(optional)</span>
          </h3>
          <textarea
            value={reasoning}
            onChange={e => setReasoning(e.target.value)}
            placeholder="Why did you make this choice?"
            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={skipTask}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
          >
            <SkipForward className="w-4 h-4" />
            Skip Task
          </button>

          <div className="flex items-center gap-3">
            <NavigationHint />
            <button
              onClick={handleSubmit}
              disabled={!selectedChoice || submitted}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                submitted
                  ? 'bg-success-500 text-white'
                  : selectedChoice
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {submitted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Submitted!
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Rating
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Clock({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ResponseCard({
  label,
  content,
  source,
  isSelected,
  accentColor,
  onClick,
}: {
  label: string;
  content: string;
  source: string;
  isSelected: boolean;
  accentColor: 'blue' | 'purple';
  onClick: () => void;
}) {
  const borderColor = isSelected
    ? accentColor === 'blue'
      ? 'border-blue-500 ring-2 ring-blue-200'
      : 'border-purple-500 ring-2 ring-purple-200'
    : 'border-gray-200 hover:border-gray-300';

  const headerBg = accentColor === 'blue' ? 'bg-blue-50' : 'bg-purple-50';
  const headerText = accentColor === 'blue' ? 'text-blue-700' : 'text-purple-700';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border-2 cursor-pointer transition-all ${borderColor}`}
    >
      <div className={`${headerBg} px-5 py-3 rounded-t-[10px] flex items-center justify-between`}>
        <span className={`font-semibold text-sm ${headerText}`}>{label}</span>
        <span className="text-xs text-gray-500">{source}</span>
      </div>
      <div className="p-5">
        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}

function NavigationHint() {
  return (
    <div className="hidden md:flex items-center gap-1 text-xs text-gray-400">
      <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-mono">A</kbd>
      <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-mono">B</kbd>
      <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-mono">T</kbd>
      <span className="ml-1">to select</span>
    </div>
  );
}
