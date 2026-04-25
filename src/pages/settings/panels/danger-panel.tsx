import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faSpinner,
  faDownload,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { PanelTitle, PanelSubtitle, RowItem, SettingsCard } from "../settings-primitives";
import { DeleteAccountModal } from "../../../components/settings/modals/delete-account-modal";
import { DeactivateModal } from "../../../components/settings/modals/deactivate-modal";
import MobileStickyHeader from "../../../components/mobile-sticky-header";

const DangerPanel = () => {
  const [modal, setModal] = useState<"delete" | "deactivate" | null>(null);

  return (
    <>
      <DeleteAccountModal open={modal === "delete"} onClose={() => setModal(null)} />
      <DeactivateModal open={modal === "deactivate"} onClose={() => setModal(null)} />
      <MobileStickyHeader title="Danger Zone" />

      <div className="px-4 md:px-0 pt-4 md:pt-0">
        <PanelTitle>Danger Zone</PanelTitle>
        <PanelSubtitle>Irreversible actions — please read carefully before proceeding.</PanelSubtitle>

        <div className="space-y-4">
          <SettingsCard>
            <RowItem
              label="Download My Data"
              description="Export all your vaults, comments and account data as a ZIP"
              right={
                <button type="button"
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                  <FontAwesomeIcon icon={faDownload} /> Export
                </button>
              }
            />
          </SettingsCard>

          <SettingsCard danger>
            <RowItem
              label="Deactivate Account"
              description="Temporarily hide your profile — reactivate anytime by logging in"
              danger
              right={
                <button type="button" onClick={() => setModal("deactivate")}
                  className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">
                  Deactivate
                </button>
              }
            />
            <RowItem
              label="Delete Account"
              description="Permanently remove your account and all associated data"
              danger
              right={
                <button type="button" onClick={() => setModal("delete")}
                  className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors cursor-pointer">
                  Delete
                </button>
              }
            />
          </SettingsCard>
        </div>
      </div>
    </>
  );
};

export default DangerPanel;
