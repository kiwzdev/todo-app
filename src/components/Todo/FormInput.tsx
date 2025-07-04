import clsx from "clsx";

const FormInput = ({
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "date" | "textarea";
  error?: string[];
  className?: string;
}) => {
  const baseStyles =
    "w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 shadow-sm light:shadow-green-100 hover:shadow-md focus:shadow-md transition-shadow duration-300 ease-in-out focus:outline-none focus:ring-0";

  const inputElement =
    type === "textarea" ? (
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(baseStyles, className)}
      />
    ) : (
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(baseStyles, className)}
      />
    );

  return (
    <div className="space-y-1">
      {inputElement}
      {error && <p className="text-red-500 text-sm">{error[0]}</p>}
    </div>
  );
};

export default FormInput;
