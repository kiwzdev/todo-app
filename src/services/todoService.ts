// src/services/todoService.ts

import { todoSchema } from "@/lib/validations/todoSchema";
import { Todo } from "@/types/todo";
import axios from "axios";
import { z } from "zod";

// --- API Functions ---
export const fetchTodos = async (): Promise<Todo[]> => {
  const { data } = await axios.get("/api/todos");
  return data;
};

export const addTodo = async (newTodo: z.infer<typeof todoSchema>) => {
  const { data } = await axios.post("/api/todos", newTodo);
  return data;
};

export const updateTodo = async (
  updatedTodo: Partial<Todo> & { id: string }
) => {
  const { data } = await axios.put("/api/todos", updatedTodo);
  return data;
};

export const deleteTodo = async (id: string) => {
  await axios.delete("/api/todos", { data: { id } });
};
