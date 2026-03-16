import React, { useState, useRef, useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import countriesData from "../../data/countries.json";

interface Country {
  name: string;
  code: string;
  flag: string;
}

interface CountryDropdownProps {
  label: string;
  name: string;
  placeholder?: string;
  error?: string;
  onChange?: (countryName: string) => void;
  value?: string;
}

const CountryDropdown: React.FC<CountryDropdownProps> = ({
  label,
  name,
  placeholder,
  error,
  onChange,
  value,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const { setValue, watch } = useFormContext();

  const formValue = watch(name);
  const selectedValue = value || formValue;

  // Filter countries based on search term
  const filteredCountries = useMemo(() => {
    if (!searchTerm) return countriesData;
    return countriesData.filter((country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Current match for the flag in the input
  // We show a flag if the current searchTerm exactly matches a country
  const currentMatch = useMemo(() => {
    return countriesData.find(
      (c) => c.name.toLowerCase() === (searchTerm || selectedValue || "").toLowerCase()
    );
  }, [searchTerm, selectedValue]);

  // Sync internal search term when blurred or value changes externally
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm(selectedValue || "");
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [isOpen, selectedValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset highlighted index when filtered countries change
  useEffect(() => {
    setHighlightedIndex(-1);
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [filteredCountries]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
        });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (country: Country) => {
    setValue(name, country.name, { shouldValidate: true });
    setSearchTerm(country.name);
    setIsOpen(false);
    if (onChange) {
      onChange(country.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredCountries.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredCountries[highlightedIndex]) {
          handleSelect(filteredCountries[highlightedIndex]);
        } else if (filteredCountries.length > 0) {
          // If no highlight but countries exist, select the first one on Enter
          handleSelect(filteredCountries[0]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <div className="relative flex items-center">
          {/* Flag Icon with fixed vertical centering */}
          {currentMatch && (
            <div className="absolute left-3 inset-y-0 flex items-center pointer-events-none z-10">
              <img
                src={currentMatch.flag}
                alt=""
                className="w-5 h-4 object-cover rounded-sm shadow-sm"
              />
            </div>
          )}
          <input
            type="text"
            autoComplete="off"
            className={`w-full px-3 py-3 bg-white border rounded-md focus:outline-none focus:ring transition-all duration-200 ease-in-out ${
              currentMatch ? "pl-10!" : "pl-3"
            } ${
              error
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-700"
            }`}
            placeholder={placeholder || "Search country..."}
            value={searchTerm}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (!isOpen) setIsOpen(true);
              // Clear form value while typing to enforce selection from list
              // if you want strict selection, or keep it if you allow custom text.
              // Here we update form only on select, but we can also update it here:
              // setValue(name, e.target.value);
            }}
            onKeyDown={handleKeyDown}
          />
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
            <ul className="overflow-y-auto py-1 scrollbar-thin" ref={listRef}>
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country, index) => (
                  <li
                    key={country.code}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                      index === highlightedIndex
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                    onClick={() => handleSelect(country)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <img
                      src={country.flag}
                      alt=""
                      className="w-6 h-4 object-cover rounded-sm shadow-sm shrink-0"
                    />
                    <span className="truncate">{country.name}</span>
                  </li>
                ))
              ) : (
                <li className="px-4 py-4 text-gray-500 text-center italic text-sm">
                  No countries found for "{searchTerm}"
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export default CountryDropdown;
