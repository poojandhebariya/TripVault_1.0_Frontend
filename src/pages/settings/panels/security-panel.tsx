import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PanelTitle,
  PanelSubtitle,
  RowItem,
  SettingsCard,
} from "../settings-primitives";
import MobileStickyHeader from "../../../components/mobile-sticky-header";
import { ChangePasswordModal } from "../../../components/settings/modals/change-password-modal";
import { TwoFAModal } from "../../../components/settings/modals/two-fa-modal";
import { DisableTwoFAModal } from "../../../components/settings/modals/disable-two-fa-modal";
import { ActiveSessionsModal } from "../../../components/settings/modals/active-sessions-modal";
import { LoginActivityModal } from "../../../components/settings/modals/login-activity-modal";
import { twoFaStatusQuery, linkedEmailQuery } from "../../../tanstack/auth/queries";
import { ChangeEmailModal } from "../../../components/settings/modals/change-email-modal";

/* ─────────────────────── Panel ─────────────────────── */
const SecurityPanel = () => {
  const [modal, setModal] = useState<
    "password" | "2fa-enable" | "2fa-disable" | "sessions" | "activity" | "change-email" | null
  >(null);

  // Live 2FA status from the server
  const { data: twoFaStatus, refetch: refetchTwoFaStatus } = useQuery({
    ...twoFaStatusQuery(),
    staleTime: 0, // Always re-fetch when navigating to this panel
  });

  // Linked email
  const { data: linkedEmail } = useQuery(linkedEmailQuery());

  const twoFaEnabled = twoFaStatus?.enabled ?? false;

  return (
    <>
      <ChangePasswordModal
        open={modal === "password"}
        onClose={() => setModal(null)}
      />
      <TwoFAModal
        open={modal === "2fa-enable"}
        onClose={() => setModal(null)}
        onEnabled={() => {
          refetchTwoFaStatus();
          setModal(null);
        }}
      />
      <DisableTwoFAModal
        open={modal === "2fa-disable"}
        onClose={() => setModal(null)}
        onDisabled={() => refetchTwoFaStatus()}
      />
      <ActiveSessionsModal
        open={modal === "sessions"}
        onClose={() => setModal(null)}
      />
      <LoginActivityModal
        open={modal === "activity"}
        onClose={() => setModal(null)}
      />
      <ChangeEmailModal
        open={modal === "change-email"}
        onClose={() => setModal(null)}
        currentEmail={linkedEmail}
        onChanged={() => setModal(null)}
      />

      <div className="p-5 md:p-0">
        <PanelTitle>Security</PanelTitle>
        <PanelSubtitle>
          Manage your login credentials and account security.
        </PanelSubtitle>

        <div className="space-y-4">
          <SettingsCard>
            <RowItem
              label="Change Password"
              description="Update your current login password"
              onClick={() => setModal("password")}
            />
            <RowItem
              label="Two-Factor Authentication"
              description={
                twoFaEnabled
                  ? "Your account has an extra layer of protection"
                  : "Add an extra layer of security via email OTP"
              }
              onClick={() => setModal(twoFaEnabled ? "2fa-disable" : "2fa-enable")}
            />
            <RowItem
              label="Linked Email"
              description="Change your registered email address"
              right={
                <span className="text-xs font-medium text-gray-400 truncate max-w-[140px] sm:max-w-none">
                  {linkedEmail ?? "—"}
                </span>
              }
              onClick={() => setModal("change-email")}
            />
          </SettingsCard>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">
            Login &amp; Devices
          </p>
          <SettingsCard>
            <RowItem
              label="Active Sessions"
              description="View and revoke logins from other devices"
              onClick={() => setModal("sessions")}
            />
            <RowItem
              label="Login Activity"
              description="Recent sign-in history with location and device info"
              onClick={() => setModal("activity")}
            />
          </SettingsCard>
        </div>
      </div>
    </>
  );
};

export default SecurityPanel;
