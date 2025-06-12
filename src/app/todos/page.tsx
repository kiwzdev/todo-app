"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Loading from "@/components/Loading";
import { Pencil, Trash } from "lucide-react";

type Todo = {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  tags: string[];
  priority: "low" | "medium" | "high";
};

export default function TodosPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const [newTodoData, setNewTodoData] = useState({
    title: "",
    description: "",
    dueDate: "",
    tags: "",
    priority: "medium",
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    tags: "",
    priority: "medium",
  });

  // Redirect if not signed in
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) router.push("/sign-in");
  }, [session, status, router]);

  // Fetch todos
  const { data: todos, isLoading } = useQuery<Todo[]>({
    queryKey: ["todos"], // Unique query key to identify this query
    queryFn: () => axios.get("/api/todos").then((res) => res.data),
  });

  // Mutation for adding todo
  const addMutation = useMutation({
    mutationFn: (newTodo: Partial<Todo>) => axios.post("/api/todos", newTodo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }), // Invalidate todos query ( Update cache or refetch )
  });

  // Mutation for updating todo
  const updateMutation = useMutation({
    mutationFn: (upd: Partial<Todo> & { id: string }) =>
      axios.put("/api/todos", upd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] }); // Invalidate todos query ( Update cache or refetch )
      setEditingTodo(null); // Clear editing todo state
      // Reset form
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        tags: "",
        priority: "medium",
      });
    },
  });

  // Mutation for deleting todo
  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete("/api/todos", { data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }), // Invalidate todos query ( Update cache or refetch )
  });

  // Handle form submission
  const handleUpdate = () => {
    if (!formData.title.trim()) return;
    const payload = {
      title: formData.title,
      description: formData.description,
      dueDate: formData.dueDate || undefined,
      tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
      priority: formData.priority as Todo["priority"],
      id: editingTodo?._id || "",
    };
    // Editing an existing todo
    updateMutation.mutate(payload);
  };

  //
  const handleAdd = () => {
    if (!newTodoData.title.trim()) return;

    const payload = {
      title: newTodoData.title,
      description: newTodoData.description,
      dueDate: newTodoData.dueDate || undefined,
      tags: newTodoData.tags
        ? newTodoData.tags.split(",").map((t) => t.trim())
        : [],
      priority: newTodoData.priority as Todo["priority"],
    };

    addMutation.mutate(payload, {
      onSuccess: () => {
        // Reset form
        setNewTodoData({
          title: "",
          description: "",
          dueDate: "",
          tags: "",
          priority: "medium",
        });
      },
    });
  };

  // Start editing todo
  const startEdit = (todo: Todo) => {
    setEditingTodo(todo); // Set the todo to be edited
    setFormData({
      title: todo.title,
      description: todo.description || "",
      dueDate: todo.dueDate || "",
      tags: todo.tags.join(", "),
      priority: todo.priority,
    });
  };

  if (status === "loading" || isLoading) return <Loading />;

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-50 dark:bg-gray-900 transition-all">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📝 My Todos
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 dark:text-gray-200">
              {session?.user?.username}
            </span>
          </div>
        </header>

        {/* Todo Form */}
        <div className="space-y-4 mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Add New Todo
          </h2>
          {/* Form Inputs */}
          <input
            placeholder="Title"
            value={newTodoData.title}
            onChange={(e) =>
              setNewTodoData({ ...newTodoData, title: e.target.value })
            }
            className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          <textarea
            placeholder="Description"
            value={newTodoData.description}
            onChange={(e) =>
              setNewTodoData({ ...newTodoData, description: e.target.value })
            }
            className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={newTodoData.dueDate}
              onChange={(e) =>
                setNewTodoData({ ...newTodoData, dueDate: e.target.value })
              }
              className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
            <select
              value={newTodoData.priority}
              onChange={(e) =>
                setNewTodoData({ ...newTodoData, priority: e.target.value })
              }
              className="w-40 px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <input
            placeholder="Tags (comma separated)"
            value={newTodoData.tags}
            onChange={(e) =>
              setNewTodoData({ ...newTodoData, tags: e.target.value })
            }
            className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          <button
            onClick={handleAdd}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
          >
            {addMutation.isPending ? "Adding..." : "Add Todo"}
          </button>
        </div>

        {/* Todo List */}
        <ul className="space-y-4">
          {todos?.map((todo) => (
            <li
              key={todo._id}
              className="flex flex-col gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm"
            >
              {editingTodo?._id === todo._id ? (
                // In-place edit form
                <div className="space-y-2">
                  <input
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                  <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                      className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value })
                      }
                      className="w-40 px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <input
                    placeholder="Tags (comma separated)"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdate}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg"
                    >
                      {updateMutation.isPending ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingTodo(null);
                        setFormData({
                          title: "",
                          description: "",
                          dueDate: "",
                          tags: "",
                          priority: "medium",
                        });
                      }}
                      className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Display mode
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-start">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() =>
                        updateMutation.mutate({
                          id: todo._id,
                          completed: !todo.completed,
                        })
                      }
                      className="w-5 h-5 mt-1 text-blue-600"
                    />
                    <div>
                      <h3
                        className={`text-lg font-semibold ${
                          todo.completed
                            ? "line-through text-gray-400"
                            : "text-gray-800 dark:text-white"
                        }`}
                      >
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                          {todo.description}
                        </p>
                      )}
                      {todo.tags?.length > 0 && (
                        <div className="flex flex-wrap mt-1 gap-1">
                          {todo.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white px-2 py-0.5 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Due: {todo.dueDate || "N/A"} | Priority: {todo.priority}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(todo)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(todo._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
