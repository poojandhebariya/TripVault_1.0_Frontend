import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faImage } from "@fortawesome/free-solid-svg-icons";

import { vaultQueries } from "../../tanstack/vault/queries";
import { vaultMutation } from "../../tanstack/vault/mutation";
import VaultDetailSkeleton from "../../components/skeletons/vault-detail-skeleton";
import VaultDetailTab from "./vault-detail-tab";
import RelatedVaultsSection from "./related-vaults-section";
import MobileStickyHeader from "../../components/mobile-sticky-header";
import Button from "../../components/ui/button";
import VaultEngagementBar from "../../components/vault-engagement-bar";
import VaultAuthorHeader from "../../components/vault-author-header";
import VaultMediaCarousel from "../../components/vault-media-carousel";
import ShareModal from "../../components/ui/share-modal";
import { getVaultShareUrl } from "../../utils/constants";

const VaultDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab");
  const { getVaultDetails } = vaultQueries();
  const { data: vault, isLoading, isError } = useQuery(getVaultDetails(id!));
  const [showShare, setShowShare] = useState(false);

  const { likeVaultMutation, unlikeVaultMutation } = vaultMutation();
  const { mutate: likeVault } = useMutation(likeVaultMutation);
  const { mutate: unlikeVault } = useMutation(unlikeVaultMutation);

  useEffect(() => {
    if (tab && !isLoading) {
      // Small delay to ensure the content is rendered before scrolling
      const timer = setTimeout(() => {
        const tabsEl = document.getElementById("vault-tabs-section");
        if (tabsEl) {
          tabsEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [tab, isLoading]);

  if (isLoading) return <VaultDetailSkeleton />;

  if (isError || !vault) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <FontAwesomeIcon icon={faImage} className="text-gray-300 text-2xl" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Vault not found</h2>
        <p className="text-sm text-gray-500 max-w-xs">
          This vault may have been deleted, set to private, or the link is
          invalid.
        </p>
        <Button
          onClick={() => navigate(-1)}
          text="Go Back"
          icon={faArrowLeft}
          className="mt-4 w-auto! py-2.5! px-6! rounded-full!"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <MobileStickyHeader title={vault.title} />

      <div className="max-w-7xl mx-auto md:py-8 md:px-6 xl:px-8">
        <div className="flex flex-col lg:flex-row lg:gap-12">
          <div className="flex-1 min-w-0">
            <div className="hidden lg:block mb-6 mt-2">
              <p className="text-3xl font-bold text-gray-900 leading-[1.15] tracking-tight mb-3">
                {vault.title}
              </p>
            </div>

            <VaultAuthorHeader
              vault={vault}
              className="py-3 px-4 md:px-0! mb-3 md:mb-5"
              rightElement={
                <Button
                  variant="outline"
                  text="Follow"
                  className="w-auto! py-1.5! md:py-2! px-4! md:px-5! text-xs md:text-sm rounded-full!"
                  outlineClassName="shrink-0 rounded-full!"
                />
              }
            />

            <VaultMediaCarousel
              media={vault.attachments ?? []}
              className="md:rounded-2xl"
              dotsPosition="right"
              overlayElement={
                <>
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/80 to-transparent pointer-events-none lg:hidden" />
                  <div className="absolute bottom-0 inset-x-0 pl-4 pr-20 pb-4 md:px-5 md:pb-5 pointer-events-none lg:hidden">
                    <h1 className="text-white font-medium leading-tight drop-shadow-lg text-xl md:text-3xl md:font-semibold line-clamp-2 mt-0.5">
                      {vault.title}
                    </h1>
                  </div>
                </>
              }
            />

            <VaultEngagementBar
              likesCount={vault.likesCount}
              commentsCount={vault.commentsCount}
              isInitialLiked={vault.isLiked}
              onLike={(liked) => {
                if (liked && vault.id) likeVault(vault.id);
                else if (!liked && vault.id) unlikeVault(vault.id);
              }}
              allowComments={vault.allowComments}
              className="py-3 border-y border-gray-100 my-4 md:my-5"
              onCommentClick={() => {
                setSearchParams({ tab: "comments" }, { replace: true });
                const tabsEl = document.getElementById("vault-tabs-section");
                if (tabsEl) {
                  tabsEl.scrollIntoView({ behavior: "smooth" });
                }
              }}
              onShareClick={() => setShowShare(true)}
            />

            <div id="vault-tabs-section" className="mt-2 md:mt-4">
              <VaultDetailTab vault={vault} />
            </div>
          </div>

          <div className="w-full lg:w-[380px] shrink-0 px-4 md:px-0 mt-6 lg:mt-0">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="w-full h-[600px] border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center bg-gray-50 text-gray-400 font-bold tracking-widest uppercase text-xs">
                Advertisement Space
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 md:mt-24 pt-8 md:pt-12 border-t border-gray-100 px-4 md:px-0">
          <RelatedVaultsSection vault={vault} />
        </div>
      </div>

      {/* ── Share Modal ── */}
      {vault.id && (
        <ShareModal
          open={showShare}
          onClose={() => setShowShare(false)}
          url={getVaultShareUrl(vault.id)}
          title={vault.title}
          description={vault.description}
        />
      )}
    </div>
  );
};

export default VaultDetail;
