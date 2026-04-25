import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLaptop, faCircle, faLocationDot, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import Modal from "../../ui/modal";
import { type DeviceType, DEVICE_ICON } from "./shared";

interface Session {
  id: string;
  deviceType: DeviceType;
  deviceName: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

const MOCK_SESSIONS: Session[] = [
  {
    id: "s1",
    deviceType: "desktop",
    deviceName: "Windows PC",
    browser: "Chrome 124",
    location: "Surat, India",
    lastActive: "Active now",
    isCurrent: true,
  },
  {
    id: "s2",
    deviceType: "mobile",
    deviceName: "iPhone 15",
    browser: "Safari 17",
    location: "Mumbai, India",
    lastActive: "2 hours ago",
    isCurrent: false,
  },
  {
    id: "s3",
    deviceType: "tablet",
    deviceName: "iPad Air",
    browser: "Chrome 123",
    location: "Delhi, India",
    lastActive: "Yesterday, 9:42 PM",
    isCurrent: false,
  },
];

export const ActiveSessionsModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const revoke = async (id: string) => {
    setRevoking(id);
    await new Promise(r => setTimeout(r, 800)); // TODO: wire API
    setSessions(prev => prev.filter(s => s.id !== id));
    setRevoking(null);
  };

  const revokeAll = async () => {
    setRevokingAll(true);
    await new Promise(r => setTimeout(r, 1000)); // TODO: wire API
    setSessions(prev => prev.filter(s => s.isCurrent));
    setRevokingAll(false);
  };

  const otherSessions = sessions.filter(s => !s.isCurrent);

  return (
    <Modal open={open} onClose={onClose} title="Active Sessions" icon={faLaptop} size="md">
      <div className="space-y-4">
        {/* Current session */}
        {sessions.filter(s => s.isCurrent).map(session => (
          <div key={session.id} className="rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={DEVICE_ICON[session.deviceType]} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-800">{session.deviceName}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                    <FontAwesomeIcon icon={faCircle} className="text-[6px]" />
                    Current
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{session.browser}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <FontAwesomeIcon icon={faLocationDot} className="text-[10px] text-rose-400" />
                  {session.location}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Other sessions */}
        {otherSessions.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Other Devices ({otherSessions.length})
              </p>
              <button
                type="button"
                onClick={revokeAll}
                disabled={revokingAll}
                className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-50 cursor-pointer transition-colors"
              >
                {revokingAll ? "Revoking…" : "Revoke all"}
              </button>
            </div>
            <div className="space-y-2">
              {otherSessions.map(session => (
                <div key={session.id}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={DEVICE_ICON[session.deviceType]} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{session.deviceName}</p>
                    <p className="text-xs text-gray-500">{session.browser}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <FontAwesomeIcon icon={faLocationDot} className="text-[10px] text-rose-400" />
                        {session.location}
                      </span>
                      <span className="text-xs text-gray-400">{session.lastActive}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => revoke(session.id)}
                    disabled={revoking === session.id}
                    className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-50 cursor-pointer transition-colors mt-0.5"
                  >
                    <FontAwesomeIcon icon={faRightFromBracket} className="text-xs" />
                    {revoking === session.id ? "…" : "Revoke"}
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-center text-gray-400 py-2">
            No other active sessions.
          </p>
        )}
      </div>
    </Modal>
  );
};
