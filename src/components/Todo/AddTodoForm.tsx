import FormInput from "./FormInput";
import PrioritySelect from "./PrioritySelect";
import TagsInput from "./Tag/TagsInput";

const AddTodoForm = ({
  newTodoData,
  setNewTodoData,
  formErrors,
  onSubmit,
  isAdding,
}: {
  newTodoData: any;
  setNewTodoData: any;
  formErrors: any;
  onSubmit: (e: React.FormEvent) => void;
  isAdding: boolean;
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
      Add New Todo
    </h2>

    <FormInput
      placeholder="Title"
      value={newTodoData.title}
      onChange={(value) => setNewTodoData({ ...newTodoData, title: value })}
      error={formErrors.title}
    />

    <FormInput
      type="textarea"
      placeholder="Description"
      value={newTodoData.description}
      onChange={(value) =>
        setNewTodoData({ ...newTodoData, description: value })
      }
      error={formErrors.description}
    />

    <div className="flex gap-2">
      <FormInput
        type="date"
        value={newTodoData.dueDate}
        onChange={(value) => setNewTodoData({ ...newTodoData, dueDate: value })}
        error={formErrors.dueDate}
        className="flex-1"
      />

      <PrioritySelect
        value={newTodoData.priority}
        onChange={(value) =>
          setNewTodoData({ ...newTodoData, priority: value })
        }
        error={formErrors.priority}
        className="w-40"
      />
    </div>

    <div className="space-y-1">
      <TagsInput editTodoData={newTodoData} setEditTodoData={setNewTodoData} />
      {formErrors.tags && (
        <p className="text-red-500 text-sm">{formErrors.tags[0]}</p>
      )}
    </div>

    <button
      type="submit"
      disabled={isAdding}
      className="w-full bg-green-500 dark:bg-green-400 hover:bg-green-600 dark:text-black dark:hover:bg-green-500 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
    >
      {isAdding ? "Adding..." : "Add Todo"}
    </button>
  </form>
);

export default AddTodoForm;
