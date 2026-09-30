export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_option?: number;
}

export interface Quiz {
  id: string;
  title: string;
  skill: string;
  passing_score: number;
  time_limit_minutes: number;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  passed: boolean;
  completed_at: string;
}
