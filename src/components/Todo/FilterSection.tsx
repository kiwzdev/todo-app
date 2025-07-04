import { TodoFilterState } from "@/types/todo";
import { Search, X } from "lucide-react";

const FilterSection = ({
  filters,
  setFilters,
}: {
  filters: any;
  setFilters: any;
}) => (
  <div className="flex flex-col sm:flex-row gap-4 my-4">
    {/* Search Input */}
    <div className="relative w-full sm:w-1/2">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search todos..."
          value={filters.searchTerm}
          onChange={(e) =>
            setFilters((prev: TodoFilterState) => ({
              ...prev,
              searchTerm: e.target.value,
            }))
          }
          className="w-full pl-10 pr-10 py-2 border rounded-md dark:bg-gray-950 text-gray-900 dark:text-gray-100"
        />
        {filters.searchTerm && (
          <button
            onClick={() =>
              setFilters((prev: TodoFilterState) => ({
                ...prev,
                searchTerm: "",
              }))
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>

    {/* Priority Filter */}
    <select
      value={filters.priority}
      onChange={(e) =>
        setFilters((prev: TodoFilterState) => ({
          ...prev,
          priority: e.target.value as "high" | "medium" | "low",
        }))
      }
      className="w-full sm:w-1/4 p-2 border rounded-md dark:bg-gray-950 text-gray-900 dark:text-gray-100"
    >
      <option value="">All Priorities</option>
      <option value="high">High</option>
      <option value="medium">Medium</option>
      <option value="low">Low</option>
    </select>

    {/* Status Filter */}
    <select
      value={filters.status}
      onChange={(e) =>
        setFilters((prev: TodoFilterState) => ({
          ...prev,
          status: e.target.value as "completed" | "incompleted",
        }))
      }
      className="w-full sm:w-1/4 p-2 border rounded-md dark:bg-gray-950 text-gray-900 dark:text-gray-100"
    >
      <option value="">All Status</option>
      <option value="completed">Completed</option>
      <option value="incompleted">Incompleted</option>
    </select>
  </div>
);

export default FilterSection;
