import { Todo } from "@/types/todo";
import clsx from "clsx";
import { Pencil, Trash } from "lucide-react";
import { useMemo } from "react";
import PriorityIndicator from "./PriorityIndicator";

const TodoCard = ({
  todo,
  onToggleCompleted,
  onEdit,
  onDelete,
}: {
  todo: Todo;
  onToggleCompleted: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}) => {
  const formattedDate = useMemo(() => {
    if (!todo.dueDate) return "N/A";
    return new Date(todo.dueDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [todo.dueDate]);

  return (
    <li className="flex flex-col bg-green-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm light:shadow-green-100">
      {/* Header */}
      <div className="flex justify-between items-start">
        <h3
          className={clsx(
            "text-lg font-semibold flex items-center gap-2",
            todo.completed
              ? "text-green-400"
              : "text-gray-800 dark:text-gray-100"
          )}
        >
          {todo.completed && <span className="text-green-500">✓</span>}
          {todo.title}
        </h3>

        <div className="flex gap-2 ml-4">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggleCompleted(todo)}
            className="w-5 h-5 accent-green-500 rounded cursor-pointer"
          />
          <button
            onClick={() => onEdit(todo)}
            className="text-blue-500 hover:text-blue-700 transition-colors"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => onDelete(todo._id)}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <Trash size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-4 space-y-3">
        {/* Description */}
        <p className="text-sm text-gray-500 dark:text-gray-300">
          {todo.description || "No description"}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 min-h-[1.5rem]">
          {todo.tags ? (
            todo.tags.map((tag, i) => (
              <span
                key={i}
                className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400 italic">No tags</span>
          )}
        </div>

        {/* Due Date */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Due: {formattedDate}
        </div>

        {/* Priority */}
        <PriorityIndicator priority={todo.priority} />
      </div>
    </li>
  );
};

export default TodoCard;
