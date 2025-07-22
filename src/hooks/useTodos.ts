// hooks/useTodos.ts

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

import { todoSchema, todoUpdateSchema } from "@/lib/validations/todoSchema";
import {
  fetchTodos,
  addTodo,
  updateTodo,
  deleteTodo,
} from "@/services/todoService";
import { NewTodo, Todo, TodoFilterState, TodoPriority } from "@/types/todo";

// --- Initial Todo State ---
const INITIAL_TODO_DATA: NewTodo | Todo = {
  title: "",
  description: "",
  dueDate: "",
  tags: [],
  priority: TodoPriority.MEDIUM,
};

// --- Initial Filter State ---
const INITIAL_FILTERS: TodoFilterState = {
  searchTerm: "",
  priority: "",
  status: "",
};

// Todos Hook
export const useTodos = () => {
  const queryClient = useQueryClient();

  // --- State Management ---
  const [newTodoData, setNewTodoData] = useState<NewTodo>(INITIAL_TODO_DATA);
  const [editTodoData, setEditTodoData] = useState<Todo | NewTodo>(
    INITIAL_TODO_DATA
  );
  const [filters, setFilters] = useState<TodoFilterState>(INITIAL_FILTERS);

  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [editingFormErrors, setEditingFormErrors] = useState<
    Record<string, string[]>
  >({});

  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Queries ---
  const {
    data: todos = [],
    isLoading,
    isPending,
    isError,
    error,
  } = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  const addMutation = useMutation({
    mutationFn: addTodo,
    onSuccess: () => {
      toast.success("Todo added successfully!", { id: "addTodo" });
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
    onError: (error) => {
      let message = "Failed to add todo.";

      if (error instanceof AxiosError) {
        message = error.response?.data?.message || message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message, { id: "addTodo" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateTodo,
    onSuccess: () => {
      toast.success("Todo updated successfully!", { id: "updateTodo" });
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
    onError: (error) => {
      // Converted UI and toast error to user
      // in future
      let message = "Failed to update todo.";

      if (error instanceof AxiosError) {
        message = error.response?.data?.message || message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message, { id: "updateTodo" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      toast.success("Todo deleted successfully!", { id: "deleteTodo" });
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
    onError: (error) => {
      let message = "Failed to delete todo.";

      if (error instanceof AxiosError) {
        message = error.response?.data?.message || message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message, { id: "deleteTodo" });
    },
  });

  // --- Utility Functions ---
  const resetFormData = useCallback(() => {
    setNewTodoData(INITIAL_TODO_DATA);
    setFormErrors({});
  }, []);

  const resetEditingData = useCallback(() => {
    setEditTodoData(INITIAL_TODO_DATA);
    setEditingFormErrors({});
    setEditingTodo(null);
  }, []);

  // --- Modal Management ---
  const openEditModal = useCallback((todo: Todo) => {
    setEditingTodo(todo);
    setEditTodoData({
      title: todo.title,
      description: todo.description || "",
      dueDate: todo.dueDate || "",
      tags: todo.tags || [],
      priority: todo.priority,
    });
    setEditingFormErrors({});
    setIsModalOpen(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setIsModalOpen(false);
    resetEditingData();
  }, [resetEditingData]);

  // --- Form Handlers ---
  const handleAddTodo = useCallback(() => {
    const validation = todoSchema.safeParse(newTodoData);

    if (!validation.success) {
      setFormErrors(validation.error.flatten().fieldErrors);
      return;
    }

    const payload = {
      ...validation.data,
      dueDate: validation.data.dueDate || undefined,
    };

    addMutation.mutate(payload, {
      onSuccess: resetFormData,
    });
  }, [newTodoData, addMutation, resetFormData]);

  const handleUpdateTodo = useCallback(() => {
    if (!editingTodo) return;

    const validation = todoUpdateSchema.safeParse({
      ...editTodoData,
      id: editingTodo._id,
    });

    if (!validation.success) {
      setEditingFormErrors(validation.error.flatten().fieldErrors);
      return;
    }

    const payload = {
      ...validation.data,
      dueDate: validation.data.dueDate || undefined,
      priority: validation.data.priority as TodoPriority,
    };

    // Update Optimistic UI
    // in future

    updateMutation.mutate(payload, {
      onSuccess: closeEditModal,
    });
  }, [editingTodo, editTodoData, updateMutation, closeEditModal]);

  const handleToggleCompleted = useCallback(
    (todo: Todo) => {
      updateMutation.mutate({
        id: todo._id,
        completed: !todo.completed,
      });
    },
    [updateMutation]
  );

  const handleDeleteTodo = useCallback(
    (todoId: string) => {
      deleteMutation.mutate(todoId);
    },
    [deleteMutation]
  );

  // --- Filter Logic ---
  const filteredTodos = useMemo(() => {
    if (!todos.length) return [];

    return todos.filter((todo) => {
      // Search filter
      const matchesSearch =
        !filters.searchTerm ||
        todo.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (todo.description &&
          todo.description
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase()));

      // Priority filter
      const matchesPriority =
        !filters.priority || todo.priority === filters.priority;

      // Status filter
      const matchesStatus =
        !filters.status ||
        (filters.status === "completed" && todo.completed) ||
        (filters.status === "pending" && !todo.completed);

      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [todos, filters]);

  // --- Computed States ---
  const todoStats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((todo) => todo.completed).length;
    const pending = total - completed;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, completionRate };
  }, [todos]);

  const isAnyMutationPending = useMemo(
    () =>
      addMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
    [addMutation.isPending, updateMutation.isPending, deleteMutation.isPending]
  );

  // --- Return API ---
  return {
    // Data
    todos,
    filteredTodos,
    todoStats,
    error,

    // Loading states
    isLoading,
    isError,
    isAnyMutationPending,

    // Specific loading states
    isFetching: isPending,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Filters
    filters,
    setFilters,

    // Form data
    newTodoData,
    setNewTodoData,
    editTodoData,
    setEditTodoData,

    // Form errors
    formErrors,
    editingFormErrors,

    // Modal state
    isModalOpen,
    editingTodo,

    // Actions
    handleAddTodo,
    handleUpdateTodo,
    handleToggleCompleted,
    handleDeleteTodo,

    // Modal actions
    openEditModal,
    closeEditModal,

    // Utility actions
    resetFormData,
    resetEditingData,
  };
};
