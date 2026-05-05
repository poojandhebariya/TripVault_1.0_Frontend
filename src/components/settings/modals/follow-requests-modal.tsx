import { useQuery, useMutation } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserClock,
  faCheck,
  faXmark,
  faSpinner,
  faUser,
  faInbox,
} from "@fortawesome/free-solid-svg-icons";
import { userQueries } from "../../../tanstack/user/queries";
import { userMutation } from "../../../tanstack/user/mutation";
import type { PublicProfile } from "../../../types/user";

interface Props {
  open: boolean;
  onClose: () => void;
}

const RequestRow = ({ profile }: { profile: PublicProfile }) => {
  const { acceptFollowRequestMutation, declineFollowRequestMutation } =
    userMutation();

  const accept = useMutation(acceptFollowRequestMutation(profile.id));
  const decline = useMutation(declineFollowRequestMutation(profile.id));

  const isBusy = accept.isPending || decline.isPending;

  return (
    <div className="flex items-center gap-3 py-3 px-1">
      {/* Avatar */}
      <div className="shrink-0">
        {profile.profilePicUrl ? (
          <img
            src={profile.profilePicUrl}
            alt={profile.name}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-100"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
            <FontAwesomeIcon icon={faUser} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {profile.name}
        </p>
        <p className="text-xs text-gray-400 truncate">@{profile.username}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          id={`accept-request-${profile.id}`}
          onClick={() => accept.mutate()}
          disabled={isBusy}
          title="Accept"
          className="w-9 h-9 rounded-full bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer"
        >
          {accept.isPending ? (
            <FontAwesomeIcon
              icon={faSpinner}
              className="animate-spin text-xs"
            />
          ) : (
            <FontAwesomeIcon icon={faCheck} className="text-xs" />
          )}
        </button>
        <button
          id={`decline-request-${profile.id}`}
          onClick={() => decline.mutate()}
          disabled={isBusy}
          title="Decline"
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-500 active:scale-95 text-gray-500 flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer border border-gray-200"
        >
          {decline.isPending ? (
            <FontAwesomeIcon
              icon={faSpinner}
              className="animate-spin text-xs"
            />
          ) : (
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
          )}
        </button>
      </div>
    </div>
  );
};

export const FollowRequestsModal = ({ open, onClose }: Props) => {
  const { getFollowRequests } = userQueries();
  const { data: requests = [], isLoading } = useQuery({
    ...getFollowRequests(),
    enabled: open,
  });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Follow Requests"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[80vh] animate-[slideUp_0.25s_ease-out]">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
            <FontAwesomeIcon icon={faUserClock} />
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">Follow Requests</p>
            <p className="text-xs text-gray-400">
              {requests.length} pending{" "}
              {requests.length === 1 ? "request" : "requests"}
            </p>
          </div>
          <button
            id="close-follow-requests-modal"
            onClick={onClose}
            className="ml-auto w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 divide-y divide-gray-50">
          {isLoading ? (
            <div className="py-10 flex flex-col items-center gap-3 text-gray-400">
              <FontAwesomeIcon
                icon={faSpinner}
                className="text-2xl animate-spin"
              />
              <p className="text-sm">Loading requests…</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-2xl text-gray-300">
                <FontAwesomeIcon icon={faInbox} />
              </div>
              <p className="text-sm font-semibold text-gray-600">
                No pending requests
              </p>
              <p className="text-xs text-gray-400 max-w-[200px] leading-relaxed">
                When someone requests to follow you, they'll appear here.
              </p>
            </div>
          ) : (
            requests.map((profile) => (
              <RequestRow key={profile.id} profile={profile} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
