import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { vaultQueries } from "../../tanstack/vault/queries";
import type { Vault } from "../types/vault";
import VaultGridItem from "./components/vault-grid-item";
import VaultViewer from "./components/vault-viewer";

type StatusFilter = "all" | "publish" | "draft" | "schedule";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "publish", label: "Published" },
  { key: "draft", label: "Drafts" },
  { key: "schedule", label: "Scheduled" },
];

const SkeletonGrid = () => (
  <>
    {Array.from({ length: 9 }).map((_, i) => (
      <div
        key={i}
        className="aspect-square bg-gray-100 animate-pulse"
        style={{ animationDelay: `${i * 55}ms` }}
      />
    ))}
  </>
);

const EmptyState = ({ filter }: { filter: StatusFilter }) => (
  <div className="col-span-3 flex flex-col items-center justify-center py-20 text-center px-6">
    <div className="w-16 h-16 rounded-full bg-linear-to-br from-violet-100 to-blue-100 flex items-center justify-center text-2xl text-indigo-400 mb-4 shadow-sm">
      <FontAwesomeIcon icon={faLayerGroup} />
    </div>
    <p className="text-[15px] font-bold text-gray-900">
      {filter === "all"
        ? "No vaults yet"
        : `No ${filter === "publish" ? "published" : filter} vaults`}
    </p>
    <p className="text-[13px] text-gray-400 mt-1.5 max-w-[200px] leading-relaxed">
      {filter === "all"
        ? "Your travel memories will show up here."
        : `You don't have any ${filter} vaults yet.`}
    </p>
  </div>
);

const Vaults = () => {
  const { getMyVaults } = vaultQueries();
  const { data: vaults = [], isLoading, isError } = useQuery(getMyVaults());

  const [filter, setFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<Vault | null>(null);

  const filtered =
    filter === "all" ? vaults : vaults.filter((v) => v.status === filter);

  const countOf = (key: StatusFilter) =>
    key === "all"
      ? vaults.length
      : vaults.filter((v) => v.status === key).length;

  return (
    <div className="pb-20 lg:pb-6">
      <div className="flex items-center gap-2 px-3.5 pt-3 pb-1 overflow-x-auto max-w-4xl mx-auto">
        {STATUS_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`shrink-0 flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-200 cursor-pointer ${
              filter === key
                ? "bg-gray-900 border-gray-900 text-white shadow-sm"
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700"
            }`}
          >
            {label}
            {!isLoading && (
              <span
                className={`text-[10px] font-bold tabular-nums ${
                  filter === key ? "text-white/60" : "text-gray-400"
                }`}
              >
                {countOf(key)}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-px mt-2 md:max-w-4xl md:mx-auto md:gap-0.5 md:bg-transparent">
        {isLoading && <SkeletonGrid />}

        {isError && (
          <p className="col-span-3 text-center py-16 text-[13px] text-red-400 font-medium">
            Failed to load vaults. Please try again.
          </p>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <EmptyState filter={filter} />
        )}

        {!isLoading &&
          !isError &&
          filtered.map((vault, i) => (
            <VaultGridItem
              key={vault.id ?? i}
              vault={vault}
              onClick={() => setSelected(vault)}
            />
          ))}
      </div>

      {selected && (
        <VaultViewer
          vault={selected}
          allVaults={filtered}
          onClose={() => setSelected(null)}
          onNavigate={(v) => setSelected(v)}
        />
      )}
    </div>
  );
};

export default Vaults;
