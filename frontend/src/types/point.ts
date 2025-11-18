export interface PointTransaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  description: string;
  timestamp: number;
  relatedId?: string; // 관련된 목표 ID, 상점 아이템 ID 등
}

export interface PointStats {
  totalEarned: number;
  totalSpent: number;
  currentBalance: number;
  searchCount: number; // 검색 횟수
}

