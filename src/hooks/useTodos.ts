// hooks/useTodos.ts

import { useState, useMemo } from "react";
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
import { NewTodo, Todo, TodoFilterState } from "@/types/todo";

// --- Custom Hook ---
export const useTodos = () => {
  const queryClient = useQueryClient();

  // --- State ---
  const [newTodoData, setNewTodoData] = useState<NewTodo>({
    title: "",
    description: "",
    dueDate: "",
    tags: [],
    priority: "medium",
  });

  const [editTodoData, setEditTodoData] = useState<NewTodo>({
    title: "",
    description: "",
    dueDate: "",
    tags: [],
    priority: "medium",
  });

  const [filters, setFilters] = useState<TodoFilterState>({
    searchTerm: "",
    priority: "",
    status: "",
  });

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
    isError,
  } = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  // --- Mutations ---
  const addMutation = useMutation({
    mutationFn: addTodo,
    onSuccess: () => {
      toast.success("Todo added successfully!");
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
    onError: (error) =>
      toast.error(
        error instanceof AxiosError ? error.message : "Failed to add todo."
      ),
  });

  const updateMutation = useMutation({
    mutationFn: updateTodo,
    onSuccess: () => {
      toast.success("Todo updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
    onError: (error) =>
      toast.error(
        error instanceof AxiosError ? error.message : "Failed to update todo."
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      toast.success("Todo deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
    onError: (error) =>
      toast.error(
        error instanceof AxiosError ? error.message : "Failed to delete todo."
      ),
  });

  // --- UI Logic ---
  const startEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setEditTodoData({
      title: todo.title,
      description: todo.description || "",
      dueDate: todo.dueDate || "",
      tags: todo.tags || [],
      priority: todo.priority,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTodo(null);
    setEditTodoData({
      title: "",
      description: "",
      dueDate: "",
      tags: [],
      priority: "medium",
    });
  };

  // --- Handlers ---
  const handleAdd = () => {
    const validation = todoSchema.safeParse(newTodoData);

    if (!validation.success) {
      setFormErrors(validation.error.flatten().fieldErrors);
      return;
    }

    const parsed = validation.data;
    const payload = {
      ...parsed,
      dueDate: parsed.dueDate || undefined,
    };

    addMutation.mutate(payload, {
      onSuccess: () =>
        setNewTodoData({
          title: "",
          description: "",
          dueDate: "",
          tags: [],
          priority: "medium",
        }),
    });
  };

  const handleUpdate = () => {
    if (!editingTodo) return;

    const validation = todoUpdateSchema.safeParse({
      ...editTodoData,
      id: editingTodo._id,
    });

    if (!validation.success) {
      setEditingFormErrors(validation.error.flatten().fieldErrors);
      return;
    }

    const parsed = validation.data;
    const payload = {
      ...parsed,
      tags: parsed.tags,
      dueDate: parsed.dueDate || undefined,
    };

    updateMutation.mutate(payload);
    closeModal();
  };

  const toggleCompleted = (todo: Todo) => {
    updateMutation.mutate({
      id: todo._id,
      completed: !todo.completed,
    });
  };

  // --- Derived State ---
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      const matchSearch = todo.title
        .toLowerCase()
        .includes(filters.searchTerm.toLowerCase());

      const matchPriority =
        !filters.priority || todo.priority === filters.priority;

      const matchStatus =
        !filters.status ||
        (filters.status === "completed" && todo.completed) ||
        (filters.status === "incompleted" && !todo.completed);

      return matchSearch && matchPriority && matchStatus;
    });
  }, [todos, filters]);

  // --- Return API ---
  return {
    todos,
    filteredTodos,
    isLoading,
    isError,

    filters,
    setFilters,

    handleAdd,
    handleUpdate,
    toggleCompleted,

    startEdit,
    closeModal,
    isModalOpen,
    setIsModalOpen,

    formErrors,
    editingFormErrors,

    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    deleteTodo: deleteMutation.mutate,

    newTodoData,
    setNewTodoData,
    editTodoData,
    setEditTodoData,
  };
};
