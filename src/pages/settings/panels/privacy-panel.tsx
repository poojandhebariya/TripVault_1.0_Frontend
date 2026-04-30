import { useState } from "react";
import { clsx } from "clsx";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  PanelTitle,
  PanelSubtitle,
  RowItem,
  SettingsCard,
  Toggle,
} from "../settings-primitives";
import { FollowRequestsModal } from "../../../components/settings/modals/follow-requests-modal";
import { userQueries } from "../../../tanstack/user/queries";
import { userMutation } from "../../../tanstack/user/mutation";
import { useSnackbar } from "react-snackify";

const PrivacyPanel = () => {
  const { showSnackbar } = useSnackbar();
  const { getProfile } = userQueries();
  const { updatePrivacyMutation } = userMutation();

  const { data: profile } = useQuery(getProfile());
  const updatePrivacy = useMutation(updatePrivacyMutation());

  const isPrivate = profile?.privateAccount ?? false;
  const showInSearch = profile?.showInSearch ?? true;
  const allowTagging = profile?.allowTagging ?? true;

  const [requestsOpen, setRequestsOpen] = useState(false);

  // ─── Dummy Data Actions ─────────────────────────────────────────────────────

  const handleDeleteAllVaults = () => {
    // Dummy implementation
    showSnackbar({
      message: "This would permanently delete all your vaults.",
      variant: "warning"
    });
  };

  const handleMakeAllPrivate = () => {
    // Dummy implementation
    showSnackbar({
      message: "All your vaults are now private.",
      variant: "success"
    });
  };

  const handleClearSearchHistory = () => {
    // Dummy implementation
    showSnackbar({
      message: "Search history cleared.",
      variant: "success"
    });
  };

  // ────────────────────────────────────────────────────────────────────────────

  const handlePrivateToggle = (val: boolean) => {
    updatePrivacy.mutate({ privateAccount: val, showInSearch, allowTagging });
  };

  const handleSearchToggle = (val: boolean) => {
    updatePrivacy.mutate({ privateAccount: isPrivate, showInSearch: val, allowTagging });
  };

  const handleTaggingToggle = (val: boolean) => {
    updatePrivacy.mutate({ privateAccount: isPrivate, showInSearch, allowTagging: val });
  };

  return (
    <>
      <FollowRequestsModal
        open={requestsOpen}
        onClose={() => setRequestsOpen(false)}
      />

      <div className="p-5 md:p-0">
        <PanelTitle>Privacy</PanelTitle>
        <PanelSubtitle>
          Control who can see your content and interact with you.
        </PanelSubtitle>

        <div className="space-y-6">
          {/* Account Privacy */}
          <SettingsCard>
            <RowItem
              label="Private Account"
              description="Only approved followers can see your vaults"
              right={
                <Toggle
                  enabled={isPrivate}
                  onChange={handlePrivateToggle}
                />
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
