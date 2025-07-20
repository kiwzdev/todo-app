// hooks/useStats.js - Custom Hook สำหรับจัดการ Stats
import { StatsAPI } from "@/services/statsService";
import {
  OverviewStats,
  PriorityItem,
  TodoItem,
  UserItem,
  WeeklyActivityItem,
} from "@/types/dashboard/stats";
import { useState } from "react";

export const useDashboard = () => {
  const [stats, setStats] = useState({
    overview: {} as OverviewStats,
    priorityData: [] as PriorityItem[],
    weeklyActivity: [] as WeeklyActivityItem[],
    todos: [] as TodoItem[],
    users: [] as UserItem[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOverview = async () => {
    try {
      const response = await StatsAPI.getOverview();
      if (response.success) {
        setStats((prev) => ({ ...prev, overview: response.data }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchPriority = async () => {
    try {
      const response = await StatsAPI.getPriorityStats();
      if (response.success) {
        setStats((prev) => ({ ...prev, priority: response.data }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchWeekly = async () => {
    try {
      const response = await StatsAPI.getWeeklyActivity();
      if (response.success) {
        setStats((prev) => ({ ...prev, weekly: response.data }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchTodos = async (page = 1, limit = 50) => {
    try {
      const response = await StatsAPI.getTodos(page, limit);
      if (response.success) {
        setStats((prev) => ({ ...prev, todos: response.data }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchUsers = async (page = 1, limit = 50) => {
    try {
      const response = await StatsAPI.getUsers(page, limit);
      if (response.success) {
        setStats((prev) => ({ ...prev, users: response.data }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([fetchOverview(), fetchPriority(), fetchWeekly()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    error,
    fetchOverview,
    fetchPriority,
    fetchWeekly,
    fetchTodos,
    fetchUsers,
    refreshAll,
  };
};
