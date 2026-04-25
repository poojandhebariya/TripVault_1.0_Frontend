import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserSlash, faXmark, faUser } from "@fortawesome/free-solid-svg-icons";
import Modal from "../../ui/modal";

const MOCK_BLOCKED: { id: string; name: string; username: string }[] = [
  { id: "1", name: "John Doe", username: "johndoe" },
  { id: "2", name: "Alice Smith", username: "alicesmith" },
];

export const BlockedUsersModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [blocked, setBlocked] = useState(MOCK_BLOCKED);
  const unblock = (id: string) => setBlocked((prev) => prev.filter((u) => u.id !== id));

  return (
    <Modal open={open} onClose={onClose} title="Blocked Users" icon={faUserSlash} size="sm">
      {blocked.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-gray-400">
          <FontAwesomeIcon icon={faUserSlash} className="text-3xl" />
          <p className="text-sm font-medium">No blocked users</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {blocked.map((user) => (
            <li key={user.id} className="flex items-center gap-3 py-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                <FontAwesomeIcon icon={faUser} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">@{user.username}</p>
              </div>
              <button type="button" onClick={() => unblock(user.id)}
                className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer flex items-center gap-1.5">
                <FontAwesomeIcon icon={faXmark} className="text-xs" /> Unblock
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
};
