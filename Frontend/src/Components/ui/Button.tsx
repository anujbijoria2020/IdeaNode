import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "light" | "dark" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  text?: string;
  Loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const base =
  "inline-flex items-center justify-center rounded-md transition focus:outline-none focus:ring disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer";
  
const variants: Record<Variant, string> = {
  light: "bg-white border border-purple-600 text-purple-700 hover:bg-purple-50 focus:ring-purple-200",
  dark: "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-300",
  ghost: "bg-transparent text-purple-700 hover:bg-purple-50 focus:ring-purple-200",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export function Button({
  variant = "light",
  size = "md",
  startIcon,
  endIcon,
  text,
  Loading = false,
  fullWidth,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`
        ${base}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className} 
      `}
    >
      {startIcon ? <span className="mr-2">{startIcon}</span> : null}
      <span>{Loading ? "Loading..." : text ?? children}</span>
      {endIcon ? <span className="ml-2">{endIcon}</span> : null}
    </button>
  );
}