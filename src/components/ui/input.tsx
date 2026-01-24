interface InputProps {
  placeholder: string;
  label: string;
}

const Input = ({ placeholder, label }: InputProps) => {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={label}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        className="px-2 py-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-700 transition-all duration-300 ease-in-out"
      />
    </div>
  );
};

export default Input;
