import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClockRotateLeft,
  faLocationDot,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "../../ui/modal";
import { clsx } from "clsx";
import { type DeviceType, DEVICE_ICON } from "./shared";
import { loginActivityQuery } from "../../../tanstack/auth/queries";

export const LoginActivityModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { data: activity = [], isLoading, refetch } = useQuery({
    ...loginActivityQuery(),
    enabled: open, // only fetch when modal is open
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Login Activity"
      icon={faClockRotateLeft}
      size="md"
    >
      <div className="space-y-2 max-h-[55vh] overflow-y-auto">
        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && activity.length === 0 && (
          <div className="text-center py-6 space-y-2">
            <p className="text-sm text-gray-400">No login activity found.</p>
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

        {/* Activity list */}
        {!isLoading &&
          activity.map((event) => (
            <div
              key={event.id}
              className={clsx(
                "flex items-start gap-3 p-3.5 rounded-xl border transition-colors",
                event.status === "failed"
                  ? "border-red-200 bg-red-50"
                  : "border-gray-200 bg-white",
              )}
            >
              <div
                className={clsx(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  event.status === "failed" ? "bg-red-100" : "bg-gray-100",
                )}
              >
                <FontAwesomeIcon
                  icon={DEVICE_ICON[event.deviceType as DeviceType]}
                  className={
                    event.status === "failed" ? "text-red-500" : "text-gray-500"
                  }
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-800">
                    {event.deviceName}
                  </p>
                  <span
                    className={clsx(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      event.status === "failed"
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600",
                    )}
                  >
                    {event.status === "failed" ? "Failed attempt" : "Successful"}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{event.browser}</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {(event.location || event.ipAddress) && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <FontAwesomeIcon
                        icon={faLocationDot}
                        className="text-[10px] text-rose-400"
                      />
                      {event.location && event.ipAddress
                        ? `${event.location} • ${event.ipAddress}`
                        : event.location || event.ipAddress}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{event.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </Modal>
  );
};
