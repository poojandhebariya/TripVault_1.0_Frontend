import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faUserTag,
  faUser,
  faSpinner,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { userQueries } from "../../tanstack/user/queries";
import { useQuery } from "@tanstack/react-query";

export interface TaggedUser {
  id: string;
  username: string;
  name: string | null;
  profilePicUrl: string | null | undefined;
}

interface UserTagInputProps {
  taggedUsers: TaggedUser[];
  onAdd: (user: TaggedUser) => void;
  onRemove: (userId: string) => void;
}

const UserTagInput = ({ taggedUsers, onAdd, onRemove }: UserTagInputProps) => {
  const [inputVal, setInputVal] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const { tagFollowersInVault } = userQueries();

  const { data: suggestions = [], isLoading } = useQuery({
    ...tagFollowersInVault(debouncedSearch),
    enabled: debouncedSearch.length >= 1,
    select: (data) =>
      data.filter((u) => !taggedUsers.some((t) => t.id === u.id)) as TaggedUser[],
  });

  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setShowDropdown(suggestions.length > 0);
  }, [suggestions]);


  const handleInputChange = (val: string) => {
    setInputVal(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(val.replace(/^@/, "").trim());
    }, 300);
  };

  const selectUser = (user: TaggedUser) => {
    onAdd(user);
    setInputVal("");
    setDebouncedSearch("");
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((p) => Math.min(p + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((p) => Math.max(p - 1, -1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      selectUser(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Input */}
      <div className="relative">
        <div className="flex items-center border border-gray-300 rounded-md focus-within:ring focus-within:ring-blue-700 transition-all duration-300 ease-in-out bg-white overflow-visible">
          <FontAwesomeIcon
            icon={faUserTag}
            className="text-gray-400 text-xs ml-3 shrink-0"
          />
          <input
            ref={inputRef}
            value={inputVal}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
            placeholder={
              taggedUsers.length === 0
                ? "Search followers to tag…"
                : "Tag more followers…"
            }
            className="flex-1 px-2 py-3 text-sm text-gray-800 outline-none bg-transparent placeholder-gray-400"
          />
          {isLoading ? (
            <FontAwesomeIcon
              icon={faSpinner}
              className="text-gray-400 text-xs mr-3 shrink-0 animate-spin"
            />
          ) : (
            <FontAwesomeIcon
              icon={faSearch}
              className="text-gray-300 text-xs mr-3 shrink-0"
            />
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-[popIn_0.15s_ease-out]"
          >
            {suggestions.map((user, i) => (
              <button
                key={user.id}
                type="button"
                onClick={() => selectUser(user)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                  i === highlightedIndex
                    ? "bg-indigo-50 text-indigo-700"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                {user.profilePicUrl ? (
                  <img
                    src={user.profilePicUrl}
                    alt={user.name ?? ""}
                    className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-gray-100"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="text-indigo-400 text-xs"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    @{user.username}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tagged pill chips */}
      {taggedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {taggedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full pl-1 pr-2.5 py-1 animate-[popIn_0.18s_ease-out]"
            >
              {user.profilePicUrl ? (
                <img
                  src={user.profilePicUrl}
                  alt={user.name ?? ""}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-linear-to-br from-indigo-200 to-purple-200 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-indigo-500 text-[8px]"
                  />
                </div>
              )}
              <span className="text-xs font-semibold text-indigo-700">
                @{user.username}
              </span>
              <button
                type="button"
                onClick={() => onRemove(user.id)}
                className="text-indigo-400 hover:text-indigo-700 transition-colors cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400">
        You can only tag followers — click to select them from the list.
      </p>
    </div>
  );
};

export default UserTagInput;
