import { Circle } from "lucide-react";

// --- Constants ---
const PRIORITY_COLORS = {
  high: "text-red-500",
  medium: "text-yellow-500",
  low: "text-green-500",
} as const;

const PRIORITY_LEVELS = {
  high: 3,
  medium: 2,
  low: 1,
} as const;

const PriorityIndicator = ({
  priority,
}: {
  priority: "high" | "medium" | "low";
}) => (
  <div className="flex items-center gap-1">
    <span className="text-sm text-gray-500 dark:text-gray-400">Priority:</span>
    {Array.from({ length: PRIORITY_LEVELS[priority] }, (_, i) => (
      <Circle
        key={i}
        size={14}
        className={PRIORITY_COLORS[priority]}
        fill="currentColor"
      />
    ))}
  </div>
);

export default PriorityIndicator;
