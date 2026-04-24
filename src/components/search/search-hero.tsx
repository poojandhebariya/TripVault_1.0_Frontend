import SearchBar from "./search-bar";

interface SearchHeroProps {
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
  suggest: any;
  handleSubmit: (q: string) => void;
  removeRecent: (term: string) => void;
}

const SearchHero = (props: SearchHeroProps) => {
  return (
    <div className="hidden lg:block pt-8 pb-6 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-5">
          <h1 className="text-4xl font-extrabold gradient-text w-fit pb-1">
            Search
          </h1>
          <p className="text-base font-medium text-gray-500 mt-1">
            Discover vaults, travellers, and destinations across the globe.
          </p>
        </div>
        <SearchBar {...props} />
      </div>
    </div>
  );
};

export default SearchHero;
