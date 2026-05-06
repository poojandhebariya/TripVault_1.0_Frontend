import { useState } from "react";
import { clsx } from "clsx";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RowItem, SettingsCard, Toggle } from "../settings-primitives";
import MobileStickyHeader from "../../../components/mobile-sticky-header";
import { FollowRequestsModal } from "../../../components/settings/modals/follow-requests-modal";
import { MakeAllPrivateModal } from "../../../components/settings/modals/make-all-private-modal";
import { userQueries } from "../../../tanstack/user/queries";
import { userMutation } from "../../../tanstack/user/mutation";
import { vaultMutation } from "../../../tanstack/vault/mutation";
import { useSnackbar } from "react-snackify";
import { RECENT_KEY } from "../../../components/search/search-utils";

const PrivacyPanel = () => {
  const { showSnackbar } = useSnackbar();
  const { getProfile } = userQueries();
  const { updatePrivacyMutation } = userMutation();
  const { makeAllVaultsPrivateMutation } = vaultMutation();

  const { data: profile } = useQuery(getProfile());
  const updatePrivacy = useMutation(updatePrivacyMutation());
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [makePrivateOpen, setMakePrivateOpen] = useState(false);

  const isPrivate = profile?.privateAccount ?? false;
  const showInSearch = profile?.showInSearch ?? true;
  const allowTagging = profile?.allowTagging ?? true;

  const handleMakeAllPrivate = () => {
    setMakePrivateOpen(true);
  };

  const handleClearSearchHistory = () => {
    localStorage.removeItem(RECENT_KEY);
    showSnackbar({
      message: "Recent search history and locations cleared from this device.",
      variant: "success",
      classname: "text-white",
    });
  };

  const handlePrivateToggle = (val: boolean) => {
    updatePrivacy.mutate({ privateAccount: val, showInSearch, allowTagging });
  };

  const handleSearchToggle = (val: boolean) => {
    updatePrivacy.mutate({
      privateAccount: isPrivate,
      showInSearch: val,
      allowTagging,
    });
  };

  const handleTaggingToggle = (val: boolean) => {
    updatePrivacy.mutate({
      privateAccount: isPrivate,
      showInSearch,
      allowTagging: val,
    });
  };

  return (
    <>
      <FollowRequestsModal
        open={requestsOpen}
        onClose={() => setRequestsOpen(false)}
      />

      <MakeAllPrivateModal
        open={makePrivateOpen}
        onClose={() => setMakePrivateOpen(false)}
      />

      <MobileStickyHeader title="Privacy" />

      <div className="p-5 md:p-0">
        <div className="space-y-6">
          {/* Account Privacy */}
          <SettingsCard>
            <RowItem
              label="Private Account"
              description="Only approved followers can see your vaults"
              right={
                <Toggle enabled={isPrivate} onChange={handlePrivateToggle} />
              }
            />
            {isPrivate && (
              <RowItem
                label="Follow Requests"
                description="Review and manage pending follow requests"
                onClick={() => setRequestsOpen(true)}
              />
            )}
            <RowItem
              label="Show in Search Results"
              description="Allow others to discover your profile via search"
              right={
                <Toggle enabled={showInSearch} onChange={handleSearchToggle} />
              }
            />
          </SettingsCard>

          {/* Activity & History */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">
            Activity & History
          </p>
          <SettingsCard>
            <RowItem
              label="Clear Search History"
              description="Remove all recent search terms and locations"
              onClick={handleClearSearchHistory}
            />
            <RowItem
              label="Make All Vaults Private"
              description="Instantly hide all your published trips from others"
              onClick={handleMakeAllPrivate}
            />
          </SettingsCard>

          {/* Interactions */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">
            Interactions
          </p>
          <SettingsCard>
            <RowItem
              label="Allow Tagging"
              description="Others can tag you in their vaults"
              right={
                <Toggle enabled={allowTagging} onChange={handleTaggingToggle} />
              }
            />
          </SettingsCard>
        </div>
      </div>
    </>
  );
};

export default PrivacyPanel;
