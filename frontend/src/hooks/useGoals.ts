import { useState, useEffect, useCallback } from 'react';
import { Goal, GoalCheck } from '../types/goal';

const STORAGE_KEY = 'goals_system';

interface StoredData {
  goals: Goal[];
  checks: GoalCheck[];
}

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [checks, setChecks] = useState<GoalCheck[]>([]);

  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data: StoredData = JSON.parse(stored);
        setGoals(data.goals || []);
        setChecks(data.checks || []);
      } catch (error) {
        console.error('Failed to load goals data:', error);
      }
    }
  }, []);

  // 로컬 스토리지에 저장
  const saveToStorage = useCallback((data: StoredData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  // 목표 추가
  const addGoal = useCallback(
    (goal: Omit<Goal, 'id' | 'createdAt' | 'status'>) => {
      const newGoal: Goal = {
        ...goal,
        id: `goal-${Date.now()}-${Math.random()}`,
        createdAt: Date.now(),
        status: 'active',
      };

      const newGoals = [newGoal, ...goals];
      setGoals(newGoals);
      saveToStorage({ goals: newGoals, checks });
      return newGoal;
    },
    [goals, checks, saveToStorage]
  );

  // 목표 업데이트
  const updateGoal = useCallback(
    (id: string, updates: Partial<Goal>) => {
      const newGoals = goals.map((goal) =>
        goal.id === id ? { ...goal, ...updates } : goal
      );
      setGoals(newGoals);
      saveToStorage({ goals: newGoals, checks });
    },
    [goals, checks, saveToStorage]
  );

  // 목표 삭제
  const deleteGoal = useCallback(
    (id: string) => {
      const newGoals = goals.filter((goal) => goal.id !== id);
      const newChecks = checks.filter((check) => check.goalId !== id);
      setGoals(newGoals);
      setChecks(newChecks);
      saveToStorage({ goals: newGoals, checks: newChecks });
    },
    [goals, checks, saveToStorage]
  );

  // 목표 점검 추가
  const addCheck = useCallback(
    (check: Omit<GoalCheck, 'id' | 'checkDate' | 'pointsEarned'>) => {
      const newCheck: GoalCheck = {
        ...check,
        id: `check-${Date.now()}-${Math.random()}`,
        checkDate: Date.now(),
        pointsEarned: 0, // usePoints hook에서 계산
      };

      const newChecks = [newCheck, ...checks];
      setChecks(newChecks);
      saveToStorage({ goals, checks: newChecks });

      return newCheck;
    },
    [goals, checks, saveToStorage]
  );

  // 목표별 점검 목록 가져오기
  const getChecksByGoal = useCallback(
    (goalId: string) => {
      return checks.filter((check) => check.goalId === goalId);
    },
    [checks]
  );

  // 목표 가져오기
  const getGoal = useCallback(
    (id: string) => {
      return goals.find((goal) => goal.id === id);
    },
    [goals]
  );

  return {
    goals,
    checks,
    addGoal,
    updateGoal,
    deleteGoal,
    addCheck,
    getChecksByGoal,
    getGoal,
  };
};

