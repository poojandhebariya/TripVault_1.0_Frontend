import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import {
  PanelTitle,
  PanelSubtitle,
  RowItem,
  SettingsCard,
} from "../settings-primitives";
import { DeleteAccountModal } from "../../../components/settings/modals/delete-account-modal";
import { DeactivateModal } from "../../../components/settings/modals/deactivate-modal";
import { useSnackbar } from "react-snackify";
import { useMutation } from "@tanstack/react-query";
import { userMutation } from "../../../tanstack/user/mutation";

const DangerPanel = () => {
  const { showSnackbar } = useSnackbar();
  const [modal, setModal] = useState<"delete" | "deactivate" | null>(null);

  const handleDeleteAllVaults = () => {
    showSnackbar({
      message: "This would permanently delete all your vaults.",
      variant: "warning"
    });
  };

  const { exportDataMutation } = userMutation();
  const exportData = useMutation(exportDataMutation());

  const handleExportData = () => {
    exportData.mutate(undefined, {
      onSuccess: (data) => {
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'tripvault_data.zip');
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        showSnackbar({
          message: "Data exported successfully",
          variant: "success"
        });
      },
      onError: (error) => {
        console.error(error);
        showSnackbar({
          message: "Failed to export data",
          variant: "error"
        });
      }
    });
  };

  return (
    <>
      <DeleteAccountModal
        open={modal === "delete"}
        onClose={() => setModal(null)}
      />
      <DeactivateModal
        open={modal === "deactivate"}
        onClose={() => setModal(null)}
      />

      <div className="p-5 md:p-0">
        <PanelTitle>Danger Zone</PanelTitle>
        <PanelSubtitle>
          Irreversible actions — please read carefully before proceeding.
        </PanelSubtitle>

        <div className="space-y-4">
          <SettingsCard>
            <RowItem
              label="Download My Data"
              description="Export all your vaults, comments and account data as a ZIP"
              right={
                <button
                  type="button"
                  onClick={handleExportData}
                  disabled={exportData.isPending}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FontAwesomeIcon icon={faDownload} /> {exportData.isPending ? "Exporting..." : "Export"}
                </button>
              }
            />
          </SettingsCard>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">
            Account Management
          </p>
          <SettingsCard danger>
            <RowItem
              label="Delete All Vaults"
              description="Permanently remove every memory from your vault"
              danger
              right={
                <button
                  type="button"
                  onClick={handleDeleteAllVaults}
                  className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                >
                  <FontAwesomeIcon icon={faTrashCan} className="mr-1.5" /> Delete All
                </button>
              }
            />
            <RowItem
              label="Deactivate Account"
              description="Temporarily hide your profile — reactivate anytime by logging in"
              danger
              right={
                <button
                  type="button"
                  onClick={() => setModal("deactivate")}
                  className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer"
                >
                  Deactivate
                </button>
              }
            />
            <RowItem
              label="Delete Account"
              description="Permanently remove your account and all associated data"
              danger
              right={
                <button
                  type="button"
                  onClick={() => setModal("delete")}
                  className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                >
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
