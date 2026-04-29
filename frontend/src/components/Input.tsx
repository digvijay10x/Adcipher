interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  required?: boolean;
}

export default function Input({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  className = "",
  required = false,
}: InputProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && <label className="text-white font-medium">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="bg-dark-card border border-dark-border rounded-lg px-4 py-3 text-white placeholder-muted focus:outline-none focus:border-primary-blue transition-all"
      />
    </div>
  );
}
