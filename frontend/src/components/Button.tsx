interface ButtonProps {
  children: React.ReactNode;
  variant?: "blue" | "green" | "outline";
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

export default function Button({
  children,
  variant = "blue",
  onClick,
  className = "",
  type = "button",
  disabled = false,
}: ButtonProps) {
  const baseStyles =
    "px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90";

  const variants = {
    blue: "bg-primary-blue text-white",
    green: "bg-primary-green text-dark-bg",
    outline: "border border-dark-border text-white hover:bg-dark-card",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {children}
    </button>
  );
}
