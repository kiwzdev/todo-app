// types/todo.ts

export type Todo = {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  tags: string[];
  priority: "low" | "medium" | "high";
};

export type NewTodo = Omit<Todo, "_id" | "completed">;

export type TodoFilterState = {
  searchTerm: string;
  priority: "" | "low" | "medium" | "high";
  status: "" | "completed" | "incompleted";
};
