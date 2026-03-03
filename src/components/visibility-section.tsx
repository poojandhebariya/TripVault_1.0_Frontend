import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faLock, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { cn } from "../lib/cn-merge";
import { ToggleButtonGroup } from "./ui/toggle-button";
import Input from "./ui/input";
import type { Visibility } from "../pages/types/attachment-item";
import type { Audience } from "../pages/types/attachment-item";

interface VisibilitySectionProps {
  visibility: Visibility;
  onVisibilityChange: (v: Visibility) => void;
  audience: Audience;
  onAudienceChange: (a: Audience) => void;
  allowComments: boolean;
  onAllowCommentsChange: (v: boolean) => void;
  friendUsername: string;
  onFriendUsernameChange: (v: string) => void;
}

const VISIBILITY_OPTS = [
  { value: "public", label: "Public", icon: "🌍" },
  { value: "private", label: "Private", icon: "🔒" },
] as const;

const AUDIENCE_OPTS = [
  { value: "everyone", label: "Everyone", icon: "🌐" },
  { value: "followers", label: "Followers Only", icon: "👤" },
] as const;

const VisibilitySection = ({
  visibility,
  onVisibilityChange,
  audience,
  onAudienceChange,
  allowComments,
  onAllowCommentsChange,
  friendUsername,
  onFriendUsernameChange,
}: VisibilitySectionProps) => (
  <div className="space-y-3">
    {/* ── Public / Private toggle ── */}
    <ToggleButtonGroup
      options={[...VISIBILITY_OPTS]}
      value={visibility}
      onChange={(v) => onVisibilityChange(v as Visibility)}
    />

    {/* ── Contextual hint ── */}
    <p className="text-xs text-gray-400 flex items-center gap-1.5">
      {visibility === "public" ? (
        <>
          <FontAwesomeIcon icon={faGlobe} className="text-blue-400" />
          Anyone on TripVault can see this vault.
        </>
      ) : (
        <>
          <FontAwesomeIcon icon={faLock} className="text-purple-500" />
          Only you can see this vault.
        </>
      )}
    </p>

    {/* ── Public settings panel ── */}
    {visibility === "public" && (
      <div className="rounded-xl space-y-4 animate-[slideTop_0.15s_ease-out]">
        {/* Tag friends */}
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">Tag Friends</p>
          <Input
            label=""
            placeholder="@username, @username2…"
            value={friendUsername}
            onChange={(e) => onFriendUsernameChange(e.target.value)}
          />
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <FontAwesomeIcon icon={faUserPlus} />
            Tag friends by username — they'll be notified.
          </p>
        </div>

        {/* Who can discover */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Who can discover this?
          </p>
          <ToggleButtonGroup
            options={[...AUDIENCE_OPTS]}
            value={audience}
            onChange={(v) => onAudienceChange(v as Audience)}
          />
          <p className="text-xs text-gray-400 mt-2">
            {audience === "everyone"
              ? "Will appear in the public feed for all users."
              : "Only your followers will see it in their feed."}
          </p>
        </div>

        {/* Allow comments */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700">
              Allow Comments
            </p>
            <p className="text-xs text-gray-400">
              Let others comment on your vault
            </p>
          </div>
          <button
            type="button"
            onClick={() => onAllowCommentsChange(!allowComments)}
            className={cn(
              "relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer shrink-0",
              allowComments
                ? "bg-linear-to-r from-blue-600 to-purple-700"
                : "bg-gray-200",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
                allowComments ? "translate-x-5" : "translate-x-0",
              )}
            />
          </button>
        </div>
      </div>
    )}
  </div>
);

export default VisibilitySection;
