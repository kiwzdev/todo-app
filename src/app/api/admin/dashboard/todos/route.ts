import handleAPIError from "@/helpers/error";
import Todo from "@/models/todo";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const todos = await Todo.find()
      .populate("user", "email username")
      .sort({ createdAt: -1 })
      .limit(50); // จำกัด 50 รายการล่าสุด

    const formattedTodos = todos.map((todo) => ({
      _id: todo._id,
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      dueDate: todo.dueDate ? todo.dueDate.toISOString().split("T")[0] : null,
      tags: todo.tags,
      priority: todo.priority,
      user: todo.user?.email || "Unknown",
      createdAt: todo.createdAt.toISOString().split("T")[0],
    }));

    console.log("Formatted Todos:", formattedTodos);
    return NextResponse.json({ success: true, data: formattedTodos });
  } catch (error) {
    const { message, status, code } = handleAPIError(error);
    return NextResponse.json(
      { success: false, error: message, code },
      { status }
    );
  }
}
