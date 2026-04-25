import { useState } from "react";
import { PanelTitle, PanelSubtitle, RowItem, SettingsCard } from "../settings-primitives";
import MobileStickyHeader from "../../../components/mobile-sticky-header";
import { ChangePasswordModal } from "../../../components/settings/modals/change-password-modal";
import { TwoFAModal } from "../../../components/settings/modals/two-fa-modal";
import { ActiveSessionsModal } from "../../../components/settings/modals/active-sessions-modal";
import { LoginActivityModal } from "../../../components/settings/modals/login-activity-modal";

/* ─────────────────────── Panel ─────────────────────── */
const SecurityPanel = () => {
  const [modal, setModal] = useState<"password" | "2fa" | "sessions" | "activity" | null>(null);

  return (
    <>
      <ChangePasswordModal open={modal === "password"} onClose={() => setModal(null)} />
      <TwoFAModal open={modal === "2fa"} onClose={() => setModal(null)} />
      <ActiveSessionsModal open={modal === "sessions"} onClose={() => setModal(null)} />
      <LoginActivityModal open={modal === "activity"} onClose={() => setModal(null)} />

      {/* Mobile header — hidden on desktop (MobileStickyHeader has md:hidden built-in) */}
      <MobileStickyHeader title="Security" />

      <div className="px-4 md:px-0 pt-4 md:pt-0">
      <PanelTitle>Security</PanelTitle>
      <PanelSubtitle>Manage your login credentials and account security.</PanelSubtitle>

      <div className="space-y-4">
        <SettingsCard>
          <RowItem
            label="Change Password"
            description="Update your current login password"
            onClick={() => setModal("password")}
          />
          <RowItem
            label="Two-Factor Authentication"
            description="Add an extra layer of security via app or email OTP"
            onClick={() => setModal("2fa")}
          />
          <RowItem
            label="Linked Email"
            description="poojan@example.com · tap to update"
            onClick={() => {}}
          />
        </SettingsCard>

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">
          Login & Devices
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
