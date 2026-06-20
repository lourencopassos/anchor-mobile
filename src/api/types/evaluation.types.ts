// ============================================================================
// EVALUATION TYPES
// ============================================================================

export enum EvaluationTrend {
  UP = 'UP',
  DOWN = 'DOWN',
  STABLE = 'STABLE',
}

export interface EvaluationMetrics {
  totalDays: number;
  completedCount: number;
  missedCount: number;
  skippedCount: number;
  completionRatio: number;
  streakCurrent: number;
  streakLongest: number;
  lastCheckInDate: string | null;
  trend?: EvaluationTrend;
}
