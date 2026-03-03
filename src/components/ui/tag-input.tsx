import { useState, useRef, type KeyboardEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faTag } from "@fortawesome/free-solid-svg-icons";

interface TagInputProps {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}

const TagInput = ({ tags, onAdd, onRemove }: TagInputProps) => {
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const t = inputVal.trim().toLowerCase().replace(/^#/, "");
    if (t && !tags.includes(t)) onAdd(t);
    setInputVal("");
    inputRef.current?.focus();
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      submit();
    } else if (e.key === "Backspace" && !inputVal && tags.length) {
      onRemove(tags[tags.length - 1]);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex gap-2">
        <div className="flex-1 flex items-center border border-gray-300 rounded-md focus-within:ring focus-within:ring-blue-700 transition-all duration-300 ease-in-out overflow-hidden">
          <FontAwesomeIcon
            icon={faTag}
            className="text-gray-400 text-xs ml-3 shrink-0"
          />
          <input
            ref={inputRef}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKey}
            placeholder={tags.length === 0 ? "Add tags…" : "More tags…"}
            className="flex-1 px-2 py-3 text-sm text-gray-800 outline-none bg-transparent placeholder-gray-400"
          />
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={!inputVal.trim()}
          className="px-4 py-3 bg-gray-100 text-gray-600 rounded-md text-sm font-medium hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
        >
          Add
        </button>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium px-2.5 py-1 rounded-full animate-[popIn_0.18s_ease-out]"
            >
              #{tag}
              <button
                type="button"
                onClick={() => onRemove(tag)}
                className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer ml-0.5"
              >
                <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
              </button>
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400">
        Type and press{" "}
        <kbd className="bg-gray-100 px-1 py-0.5 rounded text-gray-600 font-mono text-[10px]">
          Enter
        </kbd>{" "}
        or tap <strong>Add</strong>
      </p>
    </div>
  );
};

export default TagInput;
