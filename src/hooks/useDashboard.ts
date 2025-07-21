// hooks/useStats.js - Custom Hook สำหรับจัดการ Stats
import { StatsAPI } from "@/services/statsService";
import {
  OverviewStats,
  PriorityItem,
  TodoItem,
  UserItem,
  WeeklyActivityItem,
} from "@/types/dashboard/stats";
import { AxiosError } from "axios";
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
  const [error, setError] = useState("");

  const fetchOverview = async () => {
    try {
      const response = await StatsAPI.getOverview();
      if (response.success) {
        setStats((prev) => ({ ...prev, overview: response.data }));
      } else {
        throw new Error(response.error || "Failed to fetch data");
      }
    } catch (err) {
      let message = "Network error or server unavailable";

      if (err instanceof AxiosError) {
        message =
          err.response?.data?.error || err.response?.data?.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
    }
  };

  const fetchPriority = async () => {
    try {
      const response = await StatsAPI.getPriorityStats();
      if (response.success) {
        setStats((prev) => ({ ...prev, priority: response.data }));
      } else {
        throw new Error(response.error || "Failed to fetch priority data");
      }
    } catch (err) {
      let message = "Network error or server unavailable";

      if (err instanceof AxiosError) {
        message =
          err.response?.data?.error || err.response?.data?.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
    }
  };

  const fetchWeekly = async () => {
    try {
      const response = await StatsAPI.getWeeklyActivity();
      if (response.success) {
        setStats((prev) => ({ ...prev, weekly: response.data }));
      } else {
        throw new Error(
          response.error || "Failed to fetch weekly activity data"
        );
      }
    } catch (err) {
      let message = "Network error or server unavailable";

      if (err instanceof AxiosError) {
        message =
          err.response?.data?.error || err.response?.data?.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
    }
  };

  const fetchTodos = async (page = 1, limit = 50) => {
    try {
      const response = await StatsAPI.getTodos(page, limit);
      if (response.success) {
        setStats((prev) => ({ ...prev, todos: response.data }));
      } else {
        throw new Error(response.error || "Failed to fetch todos data");
      }
    } catch (err) {
      let message = "Network error or server unavailable";

      if (err instanceof AxiosError) {
        message =
          err.response?.data?.error || err.response?.data?.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
    }
  };

  const fetchUsers = async (page = 1, limit = 50) => {
    try {
      const response = await StatsAPI.getUsers(page, limit);
      if (response.success) {
        setStats((prev) => ({ ...prev, users: response.data }));
      } else {
        throw new Error(response.error || "Failed to fetch users data");
      }
    } catch (err) {
      let message = "Network error or server unavailable";

      if (err instanceof AxiosError) {
        message =
          err.response?.data?.error || err.response?.data?.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([fetchOverview(), fetchPriority(), fetchWeekly()]);
    } catch (err) {
      let message = "Network error or server unavailable";

      if (err instanceof AxiosError) {
        message =
          err.response?.data?.error || err.response?.data?.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
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
