import { useState, useEffect, useCallback } from 'react';
import { PointTransaction, PointStats } from '../types/point';

const STORAGE_KEY = 'point_system';
const POINTS_PER_SEARCH = 10; // 검색당 포인트
const POINTS_PER_CHECK = 50; // 점검당 기본 포인트

interface StoredData {
  transactions: PointTransaction[];
  searchCount: number;
}

export const usePoints = () => {
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [searchCount, setSearchCount] = useState(0);

  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data: StoredData = JSON.parse(stored);
        setTransactions(data.transactions || []);
        setSearchCount(data.searchCount || 0);
      } catch (error) {
        console.error('Failed to load points data:', error);
      }
    }
  }, []);

  // 로컬 스토리지에 저장
  const saveToStorage = useCallback((data: StoredData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  // 포인트 통계 계산
  const stats: PointStats = {
    totalEarned: transactions
      .filter((t) => t.type === 'earn')
      .reduce((sum, t) => sum + t.amount, 0),
    totalSpent: transactions
      .filter((t) => t.type === 'spend')
      .reduce((sum, t) => sum + t.amount, 0),
    currentBalance: transactions
      .filter((t) => t.type === 'earn')
      .reduce((sum, t) => sum + t.amount, 0) -
      transactions
        .filter((t) => t.type === 'spend')
        .reduce((sum, t) => sum + t.amount, 0),
    searchCount,
  };

  // 포인트 획득
  const earnPoints = useCallback(
    (amount: number, description: string, relatedId?: string) => {
      const transaction: PointTransaction = {
        id: `earn-${Date.now()}-${Math.random()}`,
        type: 'earn',
        amount,
        description,
        timestamp: Date.now(),
        relatedId,
      };

      const newTransactions = [transaction, ...transactions];
      setTransactions(newTransactions);
      saveToStorage({ transactions: newTransactions, searchCount });
    },
    [transactions, searchCount, saveToStorage]
  );

  // 포인트 사용
  const spendPoints = useCallback(
    (amount: number, description: string, relatedId?: string): boolean => {
      // 현재 잔액 계산
      const currentBalance =
        transactions
          .filter((t) => t.type === 'earn')
          .reduce((sum, t) => sum + t.amount, 0) -
        transactions
          .filter((t) => t.type === 'spend')
          .reduce((sum, t) => sum + t.amount, 0);

      if (currentBalance < amount) {
        return false; // 잔액 부족
      }

      const transaction: PointTransaction = {
        id: `spend-${Date.now()}-${Math.random()}`,
        type: 'spend',
        amount,
        description,
        timestamp: Date.now(),
        relatedId,
      };

      const newTransactions = [transaction, ...transactions];
      setTransactions(newTransactions);
      saveToStorage({ transactions: newTransactions, searchCount });
      return true;
    },
    [transactions, searchCount, saveToStorage]
  );

  // 검색 포인트 지급
  const addSearchPoint = useCallback(
    (topicName: string) => {
      const newCount = searchCount + 1;
      setSearchCount(newCount);
      earnPoints(
        POINTS_PER_SEARCH,
        `"${topicName}" 검색`,
        undefined
      );
      saveToStorage({ transactions, searchCount: newCount });
    },
    [searchCount, transactions, earnPoints, saveToStorage]
  );

  // 점검 포인트 지급 (평가에 따라 보너스)
  const addCheckPoint = useCallback(
    (goalId: string, rating: number) => {
      const basePoints = POINTS_PER_CHECK;
      const bonusPoints = (rating - 3) * 10; // 3점 기준, 높을수록 보너스
      const totalPoints = Math.max(basePoints + bonusPoints, basePoints);
      
      earnPoints(
        totalPoints,
        `목표 점검 완료 (${rating}점)`,
        goalId
      );
    },
    [earnPoints]
  );

  return {
    stats,
    transactions,
    earnPoints,
    spendPoints,
    addSearchPoint,
    addCheckPoint,
  };
};

