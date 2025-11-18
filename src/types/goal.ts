export interface Goal {
  id: string;
  title: string;
  description: string;
  topicId?: string; // 연결된 주제 ID
  createdAt: number;
  targetDate?: number; // 목표 날짜 (선택사항)
  status: 'active' | 'completed' | 'archived';
}

export interface GoalCheck {
  id: string;
  goalId: string;
  checkDate: number;
  content: string; // 점검 내용
  pointsEarned: number;
  rating: number; // 1-5점 평가
}

