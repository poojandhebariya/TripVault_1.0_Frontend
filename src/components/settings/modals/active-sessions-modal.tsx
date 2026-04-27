import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLaptop,
  faCircle,
  faLocationDot,
  faRightFromBracket,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "../../ui/modal";
import { type DeviceType, DEVICE_ICON } from "./shared";
import { sessionsQuery } from "../../../tanstack/auth/queries";
import { authMutation } from "../../../tanstack/auth/mutation";
import { authKeys } from "../../../tanstack/auth/keys";

export const ActiveSessionsModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const queryClient = useQueryClient();
  const { revokeSessionMutation, revokeOtherSessionsMutation } = authMutation();

  const { data: sessions = [], isLoading, refetch } = useQuery({
    ...sessionsQuery(),
    enabled: open, // only fetch when modal is open
  });

  const { mutate: revoke, isPending: isRevokePending, variables: revokingId } =
    useMutation({
      ...revokeSessionMutation,
    });

  const { mutate: revokeAll, isPending: isRevokingAll } = useMutation({
    ...revokeOtherSessionsMutation,
  });

  const currentSession = sessions.find((s) => s.current);
  const otherSessions = sessions.filter((s) => !s.current);

  return (
    <Modal open={open} onClose={onClose} title="Active Sessions" icon={faLaptop} size="md">
      <div className="space-y-4">

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Current session */}
        {!isLoading && currentSession && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <FontAwesomeIcon
                  icon={DEVICE_ICON[currentSession.deviceType as DeviceType] ?? faLaptop}
                  className="text-green-600"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-800">{currentSession.deviceName}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                    <FontAwesomeIcon icon={faCircle} className="text-[6px]" />
                    Current
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{currentSession.browser}</p>
                {currentSession.ipAddress && (
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <FontAwesomeIcon icon={faLocationDot} className="text-[10px] text-rose-400" />
                    {currentSession.ipAddress}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty state — no sessions at all */}
        {!isLoading && sessions.length === 0 && (
          <div className="text-center py-6 space-y-2">
            <p className="text-sm text-gray-400">No active sessions found.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1.5 mx-auto cursor-pointer"
            >
              <FontAwesomeIcon icon={faRotateRight} />
              Retry
            </button>
          </div>
        )}

        {/* Other sessions */}
        {!isLoading && otherSessions.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Other Devices ({otherSessions.length})
              </p>
              <button
                type="button"
                onClick={() => revokeAll()}
                disabled={isRevokingAll}
                className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-50 cursor-pointer transition-colors"
              >
                {isRevokingAll ? "Revoking…" : "Revoke all"}
              </button>
            </div>

            <div className="space-y-2">
              {otherSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon
                      icon={DEVICE_ICON[session.deviceType as DeviceType] ?? faLaptop}
                      className="text-gray-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{session.deviceName}</p>
                    <p className="text-xs text-gray-500">{session.browser}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {session.ipAddress && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <FontAwesomeIcon icon={faLocationDot} className="text-[10px] text-rose-400" />
                          {session.ipAddress}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{session.lastActive}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => revoke(session.id)}
                    disabled={isRevokePending && revokingId === session.id}
                    className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-50 cursor-pointer transition-colors mt-0.5"
                  >
                    <FontAwesomeIcon icon={faRightFromBracket} className="text-xs" />
                    {isRevokePending && revokingId === session.id ? "…" : "Revoke"}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Has current but no others */}
        {!isLoading && currentSession && otherSessions.length === 0 && (
          <p className="text-sm text-center text-gray-400 py-2">
            No other active sessions.
          </p>
        )}
      </div>
    </Modal>
  );
};
