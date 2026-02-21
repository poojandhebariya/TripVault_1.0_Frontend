import { forwardRef, type InputHTMLAttributes, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

interface PasswordProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Password = forwardRef<HTMLInputElement, PasswordProps>(
  ({ label, error, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="flex flex-col gap-2 w-full">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            {...props}
            type={showPassword ? "text" : "password"}
            className={`pl-2 pr-10 py-3 w-full border rounded-md focus:outline-none focus:ring transition-all duration-300 ease-in-out ${
              error
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-700"
            }`}
          />
          <FontAwesomeIcon
            icon={showPassword ? faEye : faEyeSlash}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-all duration-300 ease-in-out text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          />
        </div>
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  },
);

Password.displayName = "Password";

export default Password;
