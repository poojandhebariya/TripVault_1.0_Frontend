import { useQuery } from "@tanstack/react-query";
import { vaultQueries } from "../../tanstack/vault/queries";
import VaultCard from "../../components/vault-card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import VaultCardSkeleton from "../../components/skeletons/vault-card-skeleton";
import useIsMobile from "../../hooks/isMobile";

const Saved = () => {
  const { getSavedVaults } = vaultQueries();
  const { data: vaults = [], isLoading, isError } = useQuery(getSavedVaults());
  const isMobile = useIsMobile();
  const variant = isMobile ? "mobile" : "desktop";

  return (
    <div className="animate-[slideDown_0.3s_ease-out]">
      <div className="max-w-7xl mx-auto md:py-8 md:px-6">
        <div className="flex flex-col md:flex-row md:gap-12">
          <main className="flex-1 min-w-0 pb-10">
            <div className="flex flex-col mb-7 px-4 md:px-0 mt-4 md:mt-0">
              <h1 className="text-3xl font-extrabold gradient-text w-fit pb-1">
                Saved
              </h1>
              <p className="text-base font-medium text-gray-500 mt-0.5">
                Vaults you've saved for inspiration.
              </p>
            </div>

            {isLoading && (
              <div className={isMobile ? "" : "flex flex-col gap-6"}>
                <VaultCardSkeleton variant={variant} />
                <VaultCardSkeleton variant={variant} />
                <VaultCardSkeleton variant={variant} />
              </div>
            )}

            {isError && (
              <p className="text-center py-16 text-[13px] text-red-400 font-medium">
                Failed to load saved vaults.
              </p>
            )}

            {!isLoading && !isError && vaults.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6 mt-10">
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-rose-100 to-pink-100 flex items-center justify-center text-2xl text-rose-400 mb-4 shadow-sm">
                  <FontAwesomeIcon icon={faHeart} />
                </div>
                <p className="text-[17px] font-bold text-gray-900">
                  No saved vaults
                </p>
                <p className="text-[14px] text-gray-500 mt-1.5 max-w-[240px] leading-relaxed">
                  Vaults you save will appear here for easy access later.
                </p>
              </div>
            )}

            {!isLoading && !isError && vaults.length > 0 && (
              <div className={isMobile ? "" : "flex flex-col gap-6"}>
                {vaults.map((vault) => (
                  <VaultCard key={vault.id} vault={vault} variant={variant} />
                ))}
              </div>
            )}
          </main>

          {/* Right side sidebar/space like in VaultDetail */}
          <aside className="hidden md:block w-full md:w-[380px] shrink-0 px-4 md:px-0 mt-6 md:mt-0">
            <div className="md:sticky md:top-24 space-y-6">
              <div className="w-full h-[600px] border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center bg-gray-50 text-gray-400 font-bold tracking-widest uppercase text-xs">
                Advertisement Space
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Saved;
