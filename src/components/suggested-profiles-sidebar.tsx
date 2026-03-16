import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { userQueries } from "../tanstack/user/queries";
import { userMutation } from "../tanstack/user/mutation";
import { useUserContext } from "../contexts/user/user";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faUserPlus,
  faUserMinus,
  faSpinner,
  faUsers,
  faLocationDot,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { ROUTES } from "../utils/constants";
import type { PublicProfile } from "../types/user";

const SuggestedProfileCard = ({
  profile,
  currentUserId,
}: {
  profile: PublicProfile;
  currentUserId?: string;
}) => {
  const navigate = useNavigate();
  const { followMutation, unfollowMutation } = userMutation();

  const followMut = useMutation(followMutation(profile.id));
  const unfollowMut = useMutation(unfollowMutation(profile.id));
  const isToggling = followMut.isPending || unfollowMut.isPending;
  const isSelf = currentUserId === profile.id;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelf) return;
    if (profile.isFollowing) {
      unfollowMut.mutate(profile.id);
    } else {
      followMut.mutate(profile.id);
    }
  };

  const handleNavigate = () => {
    if (currentUserId === profile.id) {
      navigate(ROUTES.USER.PROFILE);
    } else {
      navigate(ROUTES.USER.PUBLIC_PROFILE_PATH(profile.id));
    }
  };

  return (
    <div
      className="flex items-center gap-3 cursor-pointer group"
      onClick={handleNavigate}
    >
      {/* Avatar */}
      <div className="shrink-0 relative">
        {profile.profilePicUrl ? (
          <img
            src={profile.profilePicUrl}
            alt={profile.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-indigo-200 transition-all"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center ring-2 ring-gray-100 group-hover:ring-indigo-200 transition-all">
            <FontAwesomeIcon icon={faUser} className="text-white text-xs" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
          {profile.name}
        </p>
        <p className="text-xs text-gray-400 truncate">@{profile.username}</p>
        {profile.country && (
          <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
            <FontAwesomeIcon
              icon={faLocationDot}
              className="text-rose-400 text-[10px]"
            />
            {profile.country}
          </p>
        )}
      </div>

      {/* Follow button */}
      {!isSelf && (
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 ${
            profile.isFollowing
              ? "border-gray-200 text-gray-500 bg-gray-50 hover:border-red-200 hover:text-red-500 hover:bg-red-50"
              : "border-indigo-400 text-indigo-600 hover:bg-indigo-50"
          } disabled:opacity-60`}
        >
          {isToggling ? (
            <FontAwesomeIcon
              icon={faSpinner}
              className="animate-spin text-[10px]"
            />
          ) : profile.isFollowing ? (
            <FontAwesomeIcon icon={faUserMinus} className="text-[10px]" />
          ) : (
            <FontAwesomeIcon icon={faUserPlus} className="text-[10px]" />
          )}
          <span>{profile.isFollowing ? "Following" : "Follow"}</span>
        </button>
      )}
    </div>
  );
};

interface SuggestedProfilesSidebarProps {
  /** Exclude this user ID from the list (e.g., the profile being viewed) */
  excludeId?: string;
}

const SuggestedProfilesSidebar = ({
  excludeId,
}: SuggestedProfilesSidebarProps) => {
  const { user: currentUser } = useUserContext();
  const { getSuggestedProfiles } = userQueries();

  const {
    data: suggested = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery(getSuggestedProfiles());

  // Filter out the excluded user
  const filtered = suggested.filter(
    (p) => p.id !== excludeId && p.id !== currentUser?.id,
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faUsers} className="text-white text-xs" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">
            Suggested Profiles
          </h3>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          className="text-gray-400 hover:text-indigo-600 transition-colors p-1"
          title="Refresh suggestions"
        >
          <FontAwesomeIcon
            icon={faRotateRight}
            className={`text-sm ${isLoading || isRefetching ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {isLoading || isRefetching ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-200 rounded-full w-3/5" />
                <div className="h-2.5 bg-gray-100 rounded-full w-2/5" />
              </div>
              <div className="w-16 h-7 bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-6 px-2">
          <p className="text-sm text-gray-500 font-medium">
            You're following everyone we know!
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Check back later for more travellers.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.slice(0, 5).map((profile) => (
            <SuggestedProfileCard
              key={profile.id}
              profile={profile}
              currentUserId={currentUser?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SuggestedProfilesSidebar;
