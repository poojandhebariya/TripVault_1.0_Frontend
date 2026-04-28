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
import { BlockedUsersModal } from "../../../components/settings/modals/blocked-users-modal";
import { FollowRequestsModal } from "../../../components/settings/modals/follow-requests-modal";
import { userQueries } from "../../../tanstack/user/queries";
import { userMutation } from "../../../tanstack/user/mutation";

const PrivacyPanel = () => {
  const { getProfile } = userQueries();
  const { updatePrivacyMutation } = userMutation();

  const { data: profile } = useQuery(getProfile());
  const updatePrivacy = useMutation(updatePrivacyMutation());

  const isPrivate = profile?.privateAccount ?? false;
  const showInSearch = profile?.showInSearch ?? true;

  const [allowTagging, setAllowTagging] = useState(true);
  const [blockedOpen, setBlockedOpen] = useState(false);
  const [requestsOpen, setRequestsOpen] = useState(false);

  const handlePrivateToggle = (val: boolean) => {
    updatePrivacy.mutate({ privateAccount: val, showInSearch });
  };

  const handleSearchToggle = (val: boolean) => {
    updatePrivacy.mutate({ privateAccount: isPrivate, showInSearch: val });
  };

  return (
    <>
      <BlockedUsersModal
        open={blockedOpen}
        onClose={() => setBlockedOpen(false)}
      />
      <FollowRequestsModal
        open={requestsOpen}
        onClose={() => setRequestsOpen(false)}
      />

      <div className="p-5 md:p-0">
        <PanelTitle>Privacy</PanelTitle>
        <PanelSubtitle>
          Control who can see your content and interact with you.
        </PanelSubtitle>

        <div className="space-y-4">
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


          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">
            Interactions
          </p>
          <SettingsCard>
            <RowItem
              label="Allow Tagging"
              description="Others can tag you in their vaults"
              right={
                <Toggle enabled={allowTagging} onChange={setAllowTagging} />
              }
            />
            <RowItem
              label="Blocked Users"
              description="Manage users you have blocked"
              onClick={() => setBlockedOpen(true)}
            />
          </SettingsCard>
        </div>
      </div>
    </>
  );
};

export default PrivacyPanel;
