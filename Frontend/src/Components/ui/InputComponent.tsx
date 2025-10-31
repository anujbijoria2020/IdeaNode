import { forwardRef, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { EyeOpen } from "../icons/Eyeys";
import { EyeClosed } from "lucide-react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  onTogglePassword?: () => void;
}

export const Input = forwardRef<HTMLInputElement, Props>(
  function Input(
    { type = "text", onTogglePassword, className = "", ...props },
    ref
  ) {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === "password";

    const handleToggle = () => {
      setShowPassword((prev) => !prev);
      onTogglePassword?.();
    };

    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center rounded-md border border-gray-300 focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-200 transition">
          <input
            ref={ref}
            type={isPasswordField && showPassword ? "text" : type}
            className="w-full rounded-md px-3 py-2 outline-none text-sm sm:text-base"
            {...props}
          />
          {isPasswordField && (
            <button
              type="button"
              aria-label="Toggle password visibility"
              className="px-3 py-2 text-sm text-purple-700"
              onClick={handleToggle}
            >
              {showPassword ? <EyeOpen /> : <EyeClosed />}
            </button>
          )}
        </div>
      </div>
    );
  }
);