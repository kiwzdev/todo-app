// hooks/useTodos.ts
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { z } from "zod";
import { todoSchema } from "@/lib/validations/todoSchema";

// --- Types ---
export type Todo = {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  tags: string[];
  priority: "low" | "medium" | "high";
};

type TodoFilterState = {
  searchTerm: string;
  priority: "" | "low" | "medium" | "high";
  status: "" | "completed" | "incompleted";
};

// --- API Functions ---
const fetchTodos = async (): Promise<Todo[]> => {
  const { data } = await axios.get("/api/todos");
  return data;
};

const addTodoAPI = (newTodo: z.infer<typeof todoSchema>) => axios.post("/api/todos", newTodo);
const updateTodoAPI = (updatedTodo: Partial<Todo> & { id: string }) => axios.put(`/api/todos`, updatedTodo);
const deleteTodoAPI = (id: string) => axios.delete(`/api/todos`, { data: { id } });

// --- Custom Hook ---
export const useTodos = () => {
  const queryClient = useQueryClient();

  // Data Fetching
  const { data: todos = [], isLoading, isError } = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  // Filters State
  const [filters, setFilters] = useState<TodoFilterState>({
    searchTerm: "",
    priority: "",
    status: "",
  });

  // Mutations
  const addMutation = useMutation({
    mutationFn: addTodoAPI,
    onSuccess: () => {
      toast.success("Todo added successfully!");
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
    onError: (error) => toast.error(error instanceof AxiosError ? error.message : "Failed to add todo."),
  });

  const updateMutation = useMutation({
    mutationFn: updateTodoAPI,
    onSuccess: () => {
      toast.success("Todo updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
     onError: (error) => toast.error(error instanceof AxiosError ? error.message : "Failed to update todo."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodoAPI,
    onSuccess: () => {
      toast.success("Todo deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
    onError: (error) => toast.error(error instanceof AxiosError ? error.message : "Failed to delete todo."),
  });

  // Derived State (Filtered Todos)
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      const matchSearch = todo.title.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const matchPriority = !filters.priority || todo.priority === filters.priority;
      const matchStatus =
        !filters.status ||
        (filters.status === "completed" && todo.completed) ||
        (filters.status === "incompleted" && !todo.completed);
      return matchSearch && matchPriority && matchStatus;
    });
  }, [todos, filters]);

  return {
    todos,
    filteredTodos,
    isLoading,
    isError,
    filters,
    setFilters,
    addTodo: addMutation.mutate,
    updateTodo: updateMutation.mutate,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    deleteTodo: deleteMutation.mutate,
  };
};