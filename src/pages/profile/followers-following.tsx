import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { userQueries } from "../../tanstack/user/queries";
import { userMutation } from "../../tanstack/user/mutation";
import { useUserContext } from "../../contexts/user/user";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faUserPlus,
  faUserMinus,
  faSpinner,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import MobileStickyHeader from "../../components/mobile-sticky-header";
import type { PublicProfile } from "../../types/user";
import { ROUTES } from "../../utils/constants";
import SuggestedProfilesSidebar from "../../components/suggested-profiles-sidebar";
import { UserListSkeleton } from "../../components/skeletons/user-list-skeleton";
import { useAuthGuard } from "../../contexts/auth-guard-context";

interface FollowersFollowingPageProps {
  mode: "followers" | "following";
}

const UserRow = ({
  profile,
  currentUserId,
  onNavigate,
}: {
  profile: PublicProfile;
  currentUserId?: string;
  onNavigate: (id: string) => void;
}) => {
  const { followMutation, unfollowMutation } = userMutation();
  const { guard } = useAuthGuard();

  const followMut = useMutation(followMutation(profile.id));
  const unfollowMut = useMutation(unfollowMutation(profile.id));

  const isToggling = followMut.isPending || unfollowMut.isPending;
  const isSelf = currentUserId === profile.id;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelf) return;
    guard(
      () => {
        if (profile.isFollowing) {
          unfollowMut.mutate(profile.id);
        } else {
          followMut.mutate(profile.id);
        }
      },
      profile.isFollowing ? "unfollow this traveller" : "follow this traveller",
    );
  };

  return (
    <div
      className="flex items-center gap-3 p-4 hover:bg-gray-50/70 transition-colors cursor-pointer active:bg-gray-100"
      onClick={() => onNavigate(profile.id)}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {profile.profilePicUrl ? (
          <img
            src={profile.profilePicUrl}
            alt={profile.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center ring-2 ring-gray-100">
            <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
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

      {/* Follow / Unfollow button */}
      {!isSelf && (
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-full border transition-all duration-200 ${
            profile.isFollowing
              ? "border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-500 hover:bg-red-50"
              : "border-indigo-500 text-indigo-600 hover:bg-indigo-50"
          } disabled:opacity-60`}
        >
          {isToggling ? (
            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
          ) : profile.isFollowing ? (
            <>
              <FontAwesomeIcon icon={faUserMinus} />
              <span>Unfollow</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faUserPlus} />
              <span>Follow</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

const FollowersFollowingPage = ({ mode }: FollowersFollowingPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useUserContext();
  const { getFollowers, getFollowing } = userQueries();

  const profileId = id ?? currentUser?.id ?? "";

  const { data: list = [], isLoading } = useQuery(
    mode === "followers" ? getFollowers(profileId) : getFollowing(profileId),
  );

  const title =
    mode === "followers"
      ? `Followers${!isLoading ? ` · ${list.length}` : ""}`
      : `Following${!isLoading ? ` · ${list.length}` : ""}`;

  const handleNavigate = (userId: string) => {
    if (currentUser?.id && userId === currentUser.id) {
      navigate(ROUTES.USER.PROFILE);
    } else {
      navigate(ROUTES.USER.PUBLIC_PROFILE_PATH(userId));
    }
  };

  return (
    <div className="animate-[slideDown_0.3s_ease-out]">
      <MobileStickyHeader title={title} />

      <div className="flex justify-between px-2 md:px-6 gap-8 max-w-7xl mx-auto items-start">
        <div className="flex-1 max-w-3xl w-full">
          {/* ── Page Heading ── */}
          <div className="mt-4 mb-5 md:mt-6 hidden md:block">
            <div className="flex items-end gap-3">
              <h1 className="text-3xl font-extrabold gradient-text w-fit pb-1">
                {mode === "followers" ? "Followers" : "Following"}
              </h1>
            </div>
          </div>

          <div className="mt-2">
            {isLoading ? (
              <UserListSkeleton count={8} />
            ) : list.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl text-gray-300">
                  <FontAwesomeIcon icon={faUsers} />
                </div>
                <p className="text-base font-semibold text-gray-700">
                  {mode === "followers"
                    ? "No followers yet"
                    : "Not following anyone yet"}
                </p>
                <p className="text-sm text-gray-400 max-w-[220px] leading-relaxed">
                  {mode === "followers"
                    ? "When someone follows this account, they'll show up here."
                    : "When this account follows someone, they'll show up here."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {list.map((profile) => (
                  <UserRow
                    key={profile.id}
                    profile={profile}
                    currentUserId={currentUser?.id}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:block w-80 xl:w-96 shrink-0 sticky top-24 mt-4">
          <SuggestedProfilesSidebar excludeId={profileId} />
        </div>
      </div>
    </div>
  );
};

export default FollowersFollowingPage;
