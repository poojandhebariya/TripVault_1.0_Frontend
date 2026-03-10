import DOMPurify from "dompurify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTag,
  faFaceSmile,
  faUserGroup,
  faAlignLeft,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "../../../lib/cn-merge";
import { MOODS } from "../../../utils/moods";
import type { Vault } from "../../../types/vault";

const getMoodMeta = (mood: string | null) => {
  if (!mood) return null;
  return (
    MOODS.find(
      (m) =>
        m.id === mood.toLowerCase() ||
        m.label.toLowerCase() === mood.toLowerCase(),
    ) ?? null
  );
};

interface DetailsTabProps {
  vault: Vault;
}

const DetailsTab = ({ vault }: DetailsTabProps) => {
  const moodMeta = getMoodMeta(vault.mood);

  return (
    <div className="px-4 md:px-5 py-5 space-y-6 animate-[slideTop_0.2s_ease-out]">
      {/* Fellow Travellers */}
      {vault.friendUsername && vault.friendUsername.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FontAwesomeIcon
              icon={faUserGroup}
              className="text-gray-400 text-xs"
            />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Travel Companions
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {vault.friendUsername.map((username) => (
              <div
                key={username}
                className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-full pl-1.5 pr-4 py-1.5 shadow-sm hover:shadow-md transition-shadow cursor-default"
              >
                <div className="w-7 h-7 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-gray-700">
                  @{username}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {vault.description && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FontAwesomeIcon
              icon={faAlignLeft}
              className="text-gray-400 text-xs"
            />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              About this Trip
            </p>
          </div>
          <div
            className="rich-editor-content text-sm text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(vault.description),
            }}
          />
        </div>
      )}

      {/* Mood */}
      {moodMeta && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FontAwesomeIcon
              icon={faFaceSmile}
              className="text-gray-400 text-xs"
            />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Trip Mood
            </p>
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-white font-bold text-sm shadow-sm bg-linear-to-r",
              moodMeta.bg,
            )}
          >
            <span className="text-xl">{moodMeta.emoji}</span>
            <div>
              <p className="text-white font-extrabold leading-none">
                {moodMeta.label}
              </p>
              <p className="text-white/70 text-[10px] font-medium mt-0.5">
                Trip Vibe
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tags */}
      {vault.tags?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FontAwesomeIcon icon={faTag} className="text-gray-400 text-xs" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Tags
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {vault.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full font-medium cursor-pointer hover:bg-blue-100 transition-colors border border-blue-100/50"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!vault.description &&
        !moodMeta &&
        (!vault.tags || vault.tags.length === 0) && (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-400">
              No details added for this vault.
            </p>
          </div>
        )}
    </div>
  );
};

export default DetailsTab;
