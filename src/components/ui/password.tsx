import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

interface PasswordProps {
  label: string;
  placeholder: string;
}

const Password = ({ label, placeholder }: PasswordProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="password"
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className="pl-2 pr-10 py-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-700 transition-all duration-300 ease-in-out"
        />
        <FontAwesomeIcon
          icon={showPassword ? faEye : faEyeSlash}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-all duration-300 ease-in-out text-gray-500"
          onClick={() => {
            setShowPassword(!showPassword);
          }}
        />
      </div>
    </div>
  );
};

export default Password;
