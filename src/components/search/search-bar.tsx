import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faXmark,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { saveRecent } from "./search-utils";
import type { SearchResult } from "../../types/search";

/** Build autocomplete query suggestions from live API data */
function buildSuggestions(query: string, suggest: SearchResult | undefined): string[] {
  if (!suggest || !query) return [];
  const q = query.toLowerCase();

  const candidates: string[] = [
    // Vault titles
    ...suggest.vaults.map((v) => v.title),
    // Location labels
    ...suggest.locations.map((loc) => loc.label),
    // User full names
    ...suggest.users.map((u) => u.name),
    // Author names from vaults
    ...suggest.vaults.flatMap((v) =>
      v.locationLabel ? [v.locationLabel] : []
    ),
  ];

  const seen = new Set<string>();
  const results: string[] = [];

  for (const c of candidates) {
    const lower = c.toLowerCase();
    if (lower.includes(q) && !seen.has(lower)) {
      seen.add(lower);
      results.push(c);
    }
  }

  // Prefix matches first, then contains matches
  results.sort((a, b) => {
    const aPrefix = a.toLowerCase().startsWith(q) ? 0 : 1;
    const bPrefix = b.toLowerCase().startsWith(q) ? 0 : 1;
    return aPrefix - bPrefix;
  });

  return results.slice(0, 6);
}

/** Render suggestion text with typed portion in normal weight and rest bold */
function HighlightSuggestion({ text, query }: { text: string; query: string }) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) {
    return <span className="text-sm text-gray-700 truncate">{text}</span>;
  }
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);
  return (
    <span className="text-sm text-gray-700 truncate">
      {before}
      <span className="text-gray-400 font-normal">{match}</span>
      <span className="font-semibold text-gray-900">{after}</span>
    </span>
  );
}

interface SearchBarProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  rawQuery: string;
  setRawQuery: (v: string) => void;
  focused: boolean;
  setFocused: (v: boolean) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleClear: () => void;
  showDropdown: boolean;
  recent: string[];
  setRecent: (v: string[]) => void;
  suggestQuery: string;
  suggest: SearchResult | undefined;
  handleSubmit: (q: string) => void;
  removeRecent: (term: string) => void;
}

const SearchBar = ({
  inputRef,
  dropdownRef,
  rawQuery,
  setRawQuery,
  focused,
  setFocused,
  handleKeyDown,
  handleClear,
  showDropdown,
  recent,
  setRecent,
  suggestQuery,
  suggest,
  handleSubmit,
  removeRecent,
}: SearchBarProps) => (
  <div className="relative">
    <FontAwesomeIcon
      icon={faMagnifyingGlass}
      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none z-10"
    />
    <input
      ref={inputRef}
      type="text"
      value={rawQuery}
      onChange={(e) => setRawQuery(e.target.value)}
      onFocus={() => setFocused(true)}
      onKeyDown={handleKeyDown}
      placeholder="Search vaults, people, places…"
      className={`pl-11 pr-10 px-2 py-3 w-full border rounded-md focus:outline-none focus:ring transition-all duration-300 ease-in-out text-sm text-gray-800 placeholder-gray-400 ${
        focused
          ? "border-blue-700 ring ring-blue-700/20"
          : "border-gray-300"
      }`}
    />
    {rawQuery && (
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          handleClear();
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer z-10"
      >
        <FontAwesomeIcon icon={faXmark} className="text-gray-500 text-xs" />
      </button>
    )}

    {/* Suggestions dropdown */}
    {showDropdown && (
      <div
        ref={dropdownRef}
        className="absolute top-full left-0 right-0 bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden z-50 animate-[popIn_0.15s_ease-out]"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}
      >
        {/* ── Autocomplete query suggestions ── */}
        {suggestQuery.length >= 2 && suggest && (() => {
          const suggestions = buildSuggestions(suggestQuery, suggest);
          return suggestions.length > 0 ? (
            <div className="border-b border-gray-50">
              {suggestions.map((s) => (
                <div
                  key={s}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50/60 cursor-pointer group transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSubmit(s);
                  }}
                >
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="text-gray-300 text-xs flex-shrink-0 group-hover:text-blue-400 transition-colors"
                  />
                  <HighlightSuggestion text={s} query={suggestQuery} />
                </div>
              ))}
            </div>
          ) : null;
        })()}
        {/* ── When input is empty: show all recent searches ── */}
        {rawQuery.length === 0 && recent.length > 0 && (
          <div className="p-3">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                Recent
              </span>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setRecent([]);
                  saveRecent([]);
                }}
                className="text-[11px] font-semibold cursor-pointer text-blue-700 hover:text-blue-900 transition-colors"
              >
                Clear all
              </button>
            </div>
            {recent.slice(0, 5).map((term: string) => (
              <div
                key={term}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSubmit(term);
                }}
              >
                <FontAwesomeIcon
                  icon={faClock}
                  className="text-gray-300 text-xs flex-shrink-0"
                />
                <span className="flex-1 text-sm text-gray-700 truncate">
                  {term}
                </span>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeRecent(term);
                  }}
                  className="ml-auto flex-shrink-0 w-5 h-5 rounded-full hover:bg-gray-200 flex items-center justify-center cursor-pointer"
                >
                  <FontAwesomeIcon
                    icon={faXmark}
                    className="text-gray-400 text-[10px]"
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {rawQuery.length === 0 && recent.length === 0 && (
          <div className="py-8 flex flex-col items-center gap-2 text-center px-4">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="text-gray-200 text-2xl"
            />
            <p className="text-xs text-gray-400">
              Your recent searches will appear here
            </p>
          </div>
        )}

        {/* ── When typing: matching recent searches below a divider ── */}
        {suggestQuery.length >= 2 && (() => {
          const matched = recent.filter((t) =>
            t.toLowerCase().includes(suggestQuery.toLowerCase())
          );
          return matched.length > 0 ? (
            <>
              <div className="mx-3 border-t border-gray-100" />
              <div className="p-3">
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 px-2">
                  Recent
                </span>
                {matched.map((term) => (
                  <div
                    key={term}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer mt-1"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSubmit(term);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faClock}
                      className="text-gray-300 text-xs flex-shrink-0"
                    />
                    <HighlightSuggestion text={term} query={suggestQuery} />
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeRecent(term);
                      }}
                      className="ml-auto flex-shrink-0 w-5 h-5 rounded-full hover:bg-gray-200 flex items-center justify-center cursor-pointer"
                    >
                      <FontAwesomeIcon
                        icon={faXmark}
                        className="text-gray-400 text-[10px]"
                      />
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : null;
        })()}
      </div>
    )}
  </div>
);

export default SearchBar;
