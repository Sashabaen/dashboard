export type RatingChoice = 'A' | 'B' | 'tie' | 'both_bad';

export interface ComparisonItem {
  id: string;
  content: string;
  source: string;
  metadata?: Record<string, string>;
}

export interface ComparisonTask {
  id: string;
  prompt: string;
  category: string;
  itemA: ComparisonItem;
  itemB: ComparisonItem;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
}

export interface Rating {
  id: string;
  taskId: string;
  choice: RatingChoice;
  confidence: number; // 1-5
  reasoning: string;
  timeSpentMs: number;
  ratedAt: string;
  raterName: string;
}

export interface RaterProfile {
  name: string;
  email: string;
  expertise: string[];
  totalRatings: number;
  averageTimeMs: number;
  agreementRate: number;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  averageTimeMs: number;
  choiceDistribution: Record<RatingChoice, number>;
  dailyRatings: { date: string; count: number }[];
  categoryBreakdown: { category: string; count: number; completed: number }[];
}
