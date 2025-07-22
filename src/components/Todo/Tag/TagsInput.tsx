import { NewTodo, Todo } from "@/types/todo";
import { useState } from "react";

export default function TagsInput({
  editTodoData,
  setEditTodoData,
}: {
  editTodoData: Todo | NewTodo;
  setEditTodoData: React.Dispatch<React.SetStateAction<Todo | NewTodo>>;
}) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim() !== "") {
      e.preventDefault();
      const newTag = input.trim();
      if (editTodoData.tags && !editTodoData.tags.includes(newTag)) {
        setEditTodoData({
          ...editTodoData,
          tags: [...editTodoData.tags, newTag],
        });
      }
      setInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditTodoData({
      ...editTodoData,
      tags:
        editTodoData.tags &&
        editTodoData.tags.filter((tag: string) => tag !== tagToRemove),
    });
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 px-2 py-2 border rounded-lg dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 shadow-sm hover:shadow-md focus-within:shadow-md transition-shadow duration-300 ease-in-out">
        {editTodoData.tags &&
          editTodoData.tags.map((tag: string, index: number) => (
            <div
              key={index}
              className="flex items-center bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-2 py-1 rounded-full"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                &times;
              </button>
            </div>
          ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter tags and press Enter"
          className="flex-grow min-w-[100px] px-2 py-1 bg-transparent focus:outline-none"
        />
      </div>
    </div>
  );
}
