"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Loading from "@/components/Loading";
import { Circle, Pencil, Trash } from "lucide-react";
import clsx from "clsx";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

import { Dialog } from "@headlessui/react";
import Footer from "@/components/Footer";
import { todoSchema, todoUpdateSchema } from "@/lib/validations/todoSchema";

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
  // Authentication
  const { data: session, status } = useSession();

  const router = useRouter();

  useEffect(() => {
    if (status == "unauthenticated") router.push("/sign-in");
  }, [session, status, router]);

  const queryClient = useQueryClient();

  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  // Form Errors
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [editingFormErrors, setEditingFormErrors] = useState<
    Record<string, string[]>
  >({});

  const { data: todos } = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: () => axios.get("/api/todos").then((res) => res.data),
  });

  const addMutation = useMutation({
    mutationFn: (newTodo: Partial<Todo>) => axios.post("/api/todos", newTodo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const updateMutation = useMutation({
    mutationFn: (upd: Partial<Todo> & { id: string }) =>
      axios.put("/api/todos", upd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setEditingTodo(null);
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        tags: "",
        priority: "medium",
      });
      setIsModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete("/api/todos", { data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const handleAdd = () => {
    const validation = todoSchema.safeParse(newTodoData);
    if (!validation.success) {
      const { fieldErrors } = validation.error.flatten();
      setFormErrors(fieldErrors);
      return;
    }

    const parsed = validation.data;
    const payload = {
      ...parsed,
      tags: parsed.tags ? parsed.tags.split(",").map((t) => t.trim()) : [],
      dueDate: parsed.dueDate || undefined,
    };

    addMutation.mutate(payload, {
      onSuccess: () =>
        setNewTodoData({
          title: "",
          description: "",
          dueDate: "",
          tags: "",
          priority: "medium",
        }),
    });
  };

  const handleUpdate = () => {
    if (!editingTodo) return;

    const validation = todoUpdateSchema.safeParse({
      ...formData,
      id: editingTodo._id,
    });

    if (!validation.success) {
      const { fieldErrors } = validation.error.flatten();
      setEditingFormErrors(fieldErrors);
      return;
    }

    const parsed = validation.data;
    const payload = {
      ...parsed,
      tags: parsed.tags ? parsed.tags.split(",").map((t) => t.trim()) : [],
      dueDate: parsed.dueDate || undefined,
    };

    updateMutation.mutate(payload);
    closeModal();
  };

  const startEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description || "",
      dueDate: todo.dueDate || "",
      tags: todo.tags.join(", "),
      priority: todo.priority,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTodo(null);
    setFormData({
      title: "",
      description: "",
      dueDate: "",
      tags: "",
      priority: "medium",
    });
  };

  // Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState(""); // "", "high", "medium", "low"

  // Filter
  const filteredTodos = todos?.filter((todo) => {
    const matchSearch = todo.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchPriority =
      selectedPriority === "" || todo.priority === selectedPriority;

    return matchSearch && matchPriority;
  });

  if (status === "loading") return <Loading />;
  if (status === "authenticated")
    return (
      <>
        <Navbar session={session} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="min-h-screen px-4 py-8 bg-gray-50 dark:bg-gray-900">
            <div className="md:mx-25">
              <div className="space-y-4">
                <Dialog
                  open={isModalOpen}
                  onClose={closeModal}
                  className="relative z-50"
                >
                  <div
                    className="fixed inset-0 bg-black/30"
                    aria-hidden="true"
                  />
                  <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-4">
                      <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                        Edit Todo
                      </Dialog.Title>

                      <input
                        placeholder="Title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 ease-in-out focus:outline-none focus:ring-0"
                      />
                      {editingFormErrors.title && (
                        <p className="text-red-500 text-sm">
                          {editingFormErrors.title[0]}
                        </p>
                      )}
                      <textarea
                        placeholder="Description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 ease-in-out focus:outline-none focus:ring-0"
                      />
                      {editingFormErrors.description && (
                        <p className="text-red-500 text-sm">
                          {editingFormErrors.description[0]}
                        </p>
                      )}
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) =>
                          setFormData({ ...formData, dueDate: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 ease-in-out focus:outline-none focus:ring-0"
                      />
                      {editingFormErrors.dueDate && (
                        <p className="text-red-500 text-sm">
                          {editingFormErrors.dueDate[0]}
                        </p>
                      )}
                      <select
                        value={formData.priority}
                        onChange={(e) =>
                          setFormData({ ...formData, priority: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 ease-in-out focus:outline-none focus:ring-0"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      {editingFormErrors.priority && (
                        <p className="text-red-500 text-sm">
                          {editingFormErrors.priority[0]}
                        </p>
                      )}
                      <input
                        placeholder="Tags (comma separated)"
                        value={formData.tags}
                        onChange={(e) =>
                          setFormData({ ...formData, tags: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 ease-in-out focus:outline-none focus:ring-0"
                      />
                      {editingFormErrors.tags && (
                        <p className="text-red-500 text-sm">
                          {editingFormErrors.tags[0]}
                        </p>
                      )}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => {
                            handleUpdate();
                          }}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg"
                        >
                          {updateMutation.isPending ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={closeModal}
                          className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </Dialog.Panel>
                  </div>
                </Dialog>
                <h2 className="text-3xl font-semibold text-gray-800 dark:text-white">
                  Add New Todo
                </h2>
                <input
                  placeholder="Title"
                  value={newTodoData.title}
                  onChange={(e) =>
                    setNewTodoData({ ...newTodoData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-white
             shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 ease-in-out focus:outline-none focus:ring-0
            "
                />
                {formErrors.title && (
                  <p className="text-red-500 text-sm">{formErrors.title[0]}</p>
                )}
                <textarea
                  placeholder="Description"
                  value={newTodoData.description}
                  onChange={(e) =>
                    setNewTodoData({
                      ...newTodoData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 ease-in-out focus:outline-none focus:ring-0"
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm">
                    {formErrors.description[0]}
                  </p>
                )}
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={newTodoData.dueDate}
                    onChange={(e) =>
                      setNewTodoData({
                        ...newTodoData,
                        dueDate: e.target.value,
                      })
                    }
                    className="flex-1 px-4 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 ease-in-out focus:outline-none focus:ring-0"
                  />
                  {formErrors.dueDate && (
                    <p className="text-red-500 text-sm">
                      {formErrors.dueDate[0]}
                    </p>
                  )}
                  <select
                    value={newTodoData.priority}
                    onChange={(e) =>
                      setNewTodoData({
                        ...newTodoData,
                        priority: e.target.value,
                      })
                    }
                    className="w-40 px-4 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 ease-in-out focus:outline-none focus:ring-0"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  {formErrors.priority && (
                    <p className="text-red-500 text-sm">
                      {formErrors.priority[0]}
                    </p>
                  )}
                </div>
                <input
                  placeholder="Tags (comma-separated)"
                  value={newTodoData.tags}
                  onChange={(e) =>
                    setNewTodoData({ ...newTodoData, tags: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 ease-in-out focus:outline-none focus:ring-0"
                />
                {formErrors.tags && (
                  <p className="text-red-500 text-sm">{formErrors.tags[0]}</p>
                )}
                <button
                  onClick={handleAdd}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg "
                >
                  {addMutation.isPending ? "Adding..." : "Add Todo"}
                </button>
              </div>
              <h2 className="text-3xl mt-4 font-semibold text-gray-800 dark:text-white">
                My Todos
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 my-4">
                <div className="relative w-full sm:w-1/2">
                  <input
                    type="text"
                    placeholder="Search todos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border rounded-md pr-10" // pr-10 = เว้นที่ให้ปุ่มอยู่ใน input
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full sm:w-1/4 p-2 border rounded-md"
                >
                  <option value="">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTodos?.length === 0 && (
                  <p className="col-span-3 text-center mt-16 text-2xl text-gray-500 dark:text-gray-400">
                    No todos found
                  </p>
                )}
                {filteredTodos?.map((todo) => (
                  <li
                    key={todo._id}
                    className="flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm"
                  >
                    {/* บรรทัด Title + ปุ่ม Edit/Delete */}
                    <div className="flex justify-between items-start">
                      <h3
                        className={clsx(
                          "text-lg font-semibold flex items-center gap-2",
                          todo.completed
                            ? "text-green-400"
                            : "text-gray-800 dark:text-white"
                        )}
                      >
                        {todo.completed && (
                          <span className="text-green-500">✓</span>
                        )}
                        {todo.title}
                      </h3>

                      <div className="flex gap-2 ml-4">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() =>
                            updateMutation.mutate({
                              id: todo._id,
                              completed: !todo.completed,
                            })
                          }
                          className="w-5 h-5 accent-green-500 rounded cursor-pointer"
                        />
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

                    {/* Checkbox + เนื้อหาอื่นๆ */}
                    <div className="flex gap-3 items-start mt-4">
                      <div>
                        {/* Description */}
                        <p className="text-sm mb-4 text-gray-500 dark:text-gray-300">
                          {todo.description || "No description"}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap mt-1 gap-1 min-h-[1.5rem]">
                          {todo.tags?.length > 0 ? (
                            todo.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white px-2 py-0.5 rounded-full flex items-center"
                              >
                                #{tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              No tags
                            </span>
                          )}
                        </div>

                        {/* Due Date */}
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 min-h-[1.25rem]">
                          Due:{" "}
                          {todo.dueDate
                            ? new Date(todo.dueDate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : "N/A"}
                        </div>

                        {/* Priority */}
                        <div className="mt-1 flex items-center gap-1 min-h-[1.25rem]">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Priority:
                          </span>
                          {[
                            ...Array(
                              todo.priority === "high"
                                ? 3
                                : todo.priority === "medium"
                                ? 2
                                : 1
                            ),
                          ].map((_, i) => (
                            <Circle
                              key={i}
                              size={14}
                              className={
                                todo.priority === "high"
                                  ? "text-red-500"
                                  : todo.priority === "medium"
                                  ? "text-yellow-500"
                                  : "text-green-500"
                              }
                              fill="currentColor"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        <Footer />
      </>
    );
}
