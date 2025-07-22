// types/todo.ts

export enum TodoPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export enum TodoStatus {
  COMPLETED = "completed",
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
}

export type Todo = {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  tags?: string[];
  priority: TodoPriority; // tuple ["low", "medium", "high"]
};

export type NewTodo = Omit<Todo, "_id" | "completed">;

export type TodoFilterState = {
  searchTerm?: string;
  priority: "" | "low" | "medium" | "high";
  status: "" | "completed" | "pending";
  // in future
  tags?: string[];
  dateRange?: {
    from?: Date;
    to?: Date;
  };
};
