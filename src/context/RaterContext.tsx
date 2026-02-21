import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { ComparisonTask, Rating, RaterProfile, DashboardStats, RatingChoice } from '../types';
import { mockTasks, mockRatings, mockProfile, mockStats } from '../data/mockData';

interface RaterContextType {
  tasks: ComparisonTask[];
  ratings: Rating[];
  profile: RaterProfile;
  stats: DashboardStats;
  currentTaskIndex: number;
  getCurrentTask: () => ComparisonTask | null;
  submitRating: (choice: RatingChoice, confidence: number, reasoning: string, timeSpentMs: number) => void;
  skipTask: () => void;
  getUnratedTasks: () => ComparisonTask[];
  isTaskRated: (taskId: string) => boolean;
  updateProfile: (updates: Partial<RaterProfile>) => void;
}

const RaterContext = createContext<RaterContextType | null>(null);

export function RaterProvider({ children }: { children: ReactNode }) {
  const [tasks] = useState<ComparisonTask[]>(mockTasks);
  const [ratings, setRatings] = useState<Rating[]>(mockRatings);
  const [profile, setProfile] = useState<RaterProfile>(mockProfile);
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  const getUnratedTasks = useCallback(() => {
    const ratedTaskIds = new Set(ratings.map(r => r.taskId));
    return tasks.filter(t => !ratedTaskIds.has(t.id));
  }, [tasks, ratings]);

  const isTaskRated = useCallback((taskId: string) => {
    return ratings.some(r => r.taskId === taskId);
  }, [ratings]);

  const getCurrentTask = useCallback((): ComparisonTask | null => {
    const unrated = getUnratedTasks();
    return unrated[currentTaskIndex] || null;
  }, [getUnratedTasks, currentTaskIndex]);

  const submitRating = useCallback((
    choice: RatingChoice,
    confidence: number,
    reasoning: string,
    timeSpentMs: number
  ) => {
    const task = getCurrentTask();
    if (!task) return;

    const newRating: Rating = {
      id: `rating-${Date.now()}`,
      taskId: task.id,
      choice,
      confidence,
      reasoning,
      timeSpentMs,
      ratedAt: new Date().toISOString(),
      raterName: profile.name,
    };

    setRatings(prev => [...prev, newRating]);
    setProfile(prev => ({
      ...prev,
      totalRatings: prev.totalRatings + 1,
      averageTimeMs: Math.round(
        (prev.averageTimeMs * prev.totalRatings + timeSpentMs) / (prev.totalRatings + 1)
      ),
    }));
    setStats(prev => ({
      ...prev,
      completedTasks: prev.completedTasks + 1,
      pendingTasks: prev.pendingTasks - 1,
      choiceDistribution: {
        ...prev.choiceDistribution,
        [choice]: prev.choiceDistribution[choice] + 1,
      },
    }));
    setCurrentTaskIndex(0);
  }, [getCurrentTask, profile]);

  const skipTask = useCallback(() => {
    const unrated = getUnratedTasks();
    if (currentTaskIndex < unrated.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
    } else {
      setCurrentTaskIndex(0);
    }
  }, [getUnratedTasks, currentTaskIndex]);

  const updateProfile = useCallback((updates: Partial<RaterProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <RaterContext.Provider value={{
      tasks,
      ratings,
      profile,
      stats,
      currentTaskIndex,
      getCurrentTask,
      submitRating,
      skipTask,
      getUnratedTasks,
      isTaskRated,
      updateProfile,
    }}>
      {children}
    </RaterContext.Provider>
  );
}

export function useRater() {
  const context = useContext(RaterContext);
  if (!context) {
    throw new Error('useRater must be used within a RaterProvider');
  }
  return context;
}
