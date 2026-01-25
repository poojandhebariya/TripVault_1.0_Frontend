import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { cn } from "../../lib/cn-merge";
import { type IconDefinition } from "@fortawesome/free-solid-svg-icons";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
  text?: string;
  className?: string;
  outlineClassName?: string;
  icon?: IconDefinition;
  loading?: boolean;
}

const Button = ({
  variant = "default",
  text,
  className,
  outlineClassName,
  icon,
  loading,
  disabled,
  ...props
}: ButtonProps) => {
  const button = (
    <button
      disabled={disabled}
      {...props}
      className={cn(
        "w-full cursor-pointer rounded-lg px-5 py-3 transition-all duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring focus:ring-purple-800 focus:ring-offset-1",

        variant === "default" &&
          "bg-linear-to-r from-blue-700 to-purple-800 text-white shadow-md hover:shadow-lg active:translate-y-px active:shadow-sm focus:ring-offset-0 focus:ring-0",

        variant === "outline" &&
          "bg-white text-gray-800 shadow-md hover:shadow-lg active:translate-y-px active:shadow-md",
        className,
      )}
    >
      {icon && <FontAwesomeIcon icon={icon} className="mr-2" />}
      {text}
      {loading && <FontAwesomeIcon icon={faSpinner} spin className="ml-2" />}
    </button>
  );

  if (variant === "outline") {
    return (
      <div
        className={cn(
          "inline-block rounded-[9px] bg-linear-to-r from-blue-700 to-purple-900 p-[1.5px]",
          outlineClassName,
        )}
      >
        {button}
      </div>
    );
  }

  return button;
};

export default Button;
