import { Dialog } from "@headlessui/react";
import FormInput from "./FormInput";
import PrioritySelect from "./PrioritySelect";
import TagsInput from "./Tag/TagsInput";
import { NewTodo, Todo, TodoPriority } from "@/types/todo";

const EditTodoModal = ({
  isOpen,
  onClose,
  editTodoData,
  setEditTodoData,
  editingFormErrors,
  onSubmit,
  isUpdating,
}: {
  isOpen: boolean;
  onClose: () => void;
  editTodoData: Todo | NewTodo;
  setEditTodoData: React.Dispatch<React.SetStateAction<Todo | NewTodo>>;
  editingFormErrors: Record<string, string[]>;
  onSubmit: (e: React.FormEvent) => void;
  isUpdating: boolean;
}) => (
  <Dialog open={isOpen} onClose={onClose} className="relative z-50">
    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <Dialog.Panel className="max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <form onSubmit={onSubmit} className="space-y-4">
          <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Edit Todo
          </Dialog.Title>

          <FormInput
            placeholder="Title"
            value={editTodoData.title}
            onChange={(value) =>
              setEditTodoData({ ...editTodoData, title: value })
            }
            error={editingFormErrors.title}
          />

          <FormInput
            type="textarea"
            placeholder="Description"
            value={editTodoData.description || ""}
            onChange={(value) =>
              setEditTodoData({ ...editTodoData, description: value })
            }
            error={editingFormErrors.description}
          />

          <FormInput
            type="date"
            value={editTodoData.dueDate || ""}
            onChange={(value) =>
              setEditTodoData({ ...editTodoData, dueDate: value })
            }
            error={editingFormErrors.dueDate}
          />

          <PrioritySelect
            value={editTodoData.priority}
            onChange={(value) =>
              setEditTodoData({ ...editTodoData, priority: value as TodoPriority })
            }
            error={editingFormErrors.priority}
          />

          <div className="space-y-1">
            <TagsInput
              editTodoData={editTodoData}
              setEditTodoData={setEditTodoData}
            />
            {editingFormErrors.tags && (
              <p className="text-red-500 text-sm">
                {editingFormErrors.tags[0]}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 bg-green-500 dark:bg-green-400 hover:bg-green-600 dark:hover:bg-green-500 text-white font-semibold py-2 rounded-lg dark:text-black transition-colors disabled:opacity-50"
            >
              {isUpdating ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Dialog.Panel>
    </div>
  </Dialog>
);

export default EditTodoModal;
