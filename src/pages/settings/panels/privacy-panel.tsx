import { useState } from "react";
import { clsx } from "clsx";
import {
  PanelTitle,
  PanelSubtitle,
  RowItem,
  SettingsCard,
  Toggle,
} from "../settings-primitives";
import { BlockedUsersModal } from "../../../components/settings/modals/blocked-users-modal";

type FollowApproval = "everyone" | "manual";

const PrivacyPanel = () => {
  const [privateAccount, setPrivateAccount] = useState(false);
  const [allowTagging, setAllowTagging] = useState(true);
  const [showInSearch, setShowInSearch] = useState(true);
  const [followApproval, setFollowApproval] =
    useState<FollowApproval>("everyone");
  const [blockedOpen, setBlockedOpen] = useState(false);

  return (
    <>
      <BlockedUsersModal
        open={blockedOpen}
        onClose={() => setBlockedOpen(false)}
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
                <Toggle enabled={privateAccount} onChange={setPrivateAccount} />
              }
            />
            <RowItem
              label="Show in Search Results"
              description="Allow others to discover your profile via search"
              right={
                <Toggle enabled={showInSearch} onChange={setShowInSearch} />
              }
            />
          </SettingsCard>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">
            Follow Requests
          </p>
          <SettingsCard>
            <div className="py-4">
              <p className="text-sm font-semibold text-gray-800 mb-1">
                Who can follow you
              </p>
              <p className="text-xs text-gray-400 mb-3">
                Control whether followers need your approval
              </p>
              <div className="flex gap-2">
                {(
                  [
                    {
                      val: "everyone",
                      label: "Everyone",
                      desc: "Auto-approve all requests",
                    },
                    {
                      val: "manual",
                      label: "Approve manually",
                      desc: "Review each request",
                    },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setFollowApproval(opt.val)}
                    className={clsx(
                      "flex-1 flex flex-col items-start gap-0.5 p-3 rounded-xl border text-left transition-all cursor-pointer",
                      followApproval === opt.val
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                    )}
                  >
                    <span
                      className={clsx(
                        "text-sm font-semibold",
                        followApproval === opt.val
                          ? "text-blue-700"
                          : "text-gray-700",
                      )}
                    >
                      {opt.label}
                    </span>
                    <span className="text-xs text-gray-400">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
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
