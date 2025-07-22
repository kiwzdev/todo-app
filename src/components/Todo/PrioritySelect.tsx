import clsx from "clsx";

const PrioritySelect = ({
  value,
  onChange,
  error,
  className = "",
}: {
  value: string;
  onChange: (value: "low" | "medium" | "high") => void;
  error?: string[];
  className?: string;
}) => (
  <div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as "low" | "medium" | "high")}
      className={clsx(
        "w-full lg:text-md text-lg px-4 py-2 rounded-lg border bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 shadow-sm light:shadow-green-100 hover:shadow-md focus:shadow-md transition-shadow duration-300 ease-in-out focus:outline-none focus:ring-0",
        className
      )}
    >
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
    </select>
    {error && <p className="text-red-500 text-sm">{error[0]}</p>}
  </div>
);

export default PrioritySelect;
