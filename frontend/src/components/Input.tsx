interface InputProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  type?: string;
  className?: string;
  label?: string;
  required?: boolean;
}

export default function Input({
  placeholder,
  value,
  onChange,
  onKeyDown,
  type = "text",
  className = "",
  label,
  required = false,
}: InputProps) {
  return (
    <div>
      {label && (
        <label className="block text-white text-sm font-medium mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        required={required}
        className={`w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-blue transition-all ${className}`}
      />
    </div>
  );
}
