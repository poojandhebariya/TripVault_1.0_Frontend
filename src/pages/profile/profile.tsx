import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Outlet, useNavigate } from "react-router-dom";
import { userQueries } from "../../tanstack/auth/user/queries";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { interestsData } from "../../utils/interest-data";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { tripTypesData } from "../../utils/trip-type-data";
import {
  faLocationDot,
  faEarthAmericas,
  faMapPin,
  faEye,
  faTag,
  faImages,
  faPen,
  faShareNodes,
} from "@fortawesome/free-solid-svg-icons";
import Tabs from "../../components/ui/tabs";
import { ROUTES } from "../../utils/constants";
import ImagePreviewModal from "../../components/ui/image-preview-modal";
import Button from "../../components/ui/button";

const Profile = () => {
  const navigate = useNavigate();
  const { getProfile } = userQueries();
  const { data: profile } = useQuery(getProfile());

  const preferredTrip =
    profile?.preferredTripType &&
    (tripTypesData.find(
      (i) => i.id.toLowerCase() === profile.preferredTripType.toLowerCase(),
    ) ?? {
      label: profile.preferredTripType,
      icon: "fa-solid fa-star",
      color: "text-gray-400",
    });

  const interests =
    profile?.interests?.map((interest) => {
      const interestObj = interestsData.find(
        (i) => i.id.toLowerCase() === interest.toLowerCase(),
      );
      return (
        interestObj ?? {
          label: interest,
          icon: "fa-solid fa-star",
          color: "text-gray-400",
        }
      );
    }) ?? [];

  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <div className="hidden lg:block animate-[slideDown_0.3s_ease-out]">
        <div className="relative h-64 w-full overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-t from-white via-white/10 to-transparent z-10 pointer-events-none" />
          <img
            src={profile?.coverPhotoUrl}
            alt="Cover"
            onClick={() =>
              profile?.coverPhotoUrl && setPreviewSrc(profile.coverPhotoUrl)
            }
            className="w-full h-full object-cover border-b-4 border-gray-300 cursor-zoom-in"
          />
        </div>

        <div className="flex justify-center px-4">
          <div className="relative z-20 -mt-16 w-full max-w-4xl bg-white rounded-xl border-2 border-gray-300 p-8 shadow-lg flex gap-10">
            <img
              src={profile?.profilePicUrl}
              alt="Profile"
              onClick={() =>
                profile?.profilePicUrl && setPreviewSrc(profile.profilePicUrl)
              }
              className="rounded-full h-32 w-32 shrink-0 self-start object-cover ring-4 ring-white shadow cursor-zoom-in"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-2xl">{profile?.name}</p>
              <p className="text-gray-500 mt-1">@{profile?.username}</p>
              {profile?.bio && (
                <p className="text-gray-500 mt-1 wrap-break-word">
                  {profile.bio}
                </p>
              )}
              {profile?.country && (
                <p className="text-gray-600 mt-1 flex items-center gap-1">
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    className="text-rose-400 text-xs"
                  />
                  {profile.country}
                </p>
              )}
              <div className="text-gray-600 flex gap-5 mt-3">
                <p>
                  <span className="text-gray-900 font-semibold text-xl mr-1">
                    570
                  </span>
                  Followers
                </p>
                <p>
                  <span className="text-gray-900 font-semibold text-xl mr-1">
                    120
                  </span>
                  Following
                </p>
                <p>
                  <span className="text-gray-900 font-semibold text-xl mr-1">
                    42
                  </span>
                  Posts
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <div
                    key={interest.label}
                    className={`text-xs capitalize rounded-full px-3 py-1.5 border border-gray-200 bg-gray-100/80 inline-flex items-center gap-1.5 font-medium ${interest.color}`}
                  >
                    <FontAwesomeIcon icon={interest.icon as IconDefinition} />
                    {interest.label}
                  </div>
                ))}
                {preferredTrip && (
                  <div
                    className={`text-xs capitalize rounded-full px-3 py-1.5 border border-gray-200 bg-gray-100/80 inline-flex items-center gap-1.5 font-medium ${preferredTrip.color}`}
                  >
                    <FontAwesomeIcon
                      icon={preferredTrip.icon as IconDefinition}
                    />
                    {preferredTrip.label}
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 flex flex-col gap-2 self-start">
              <Button
                variant="outline"
                text="Edit Profile"
                icon={faPen}
                className="text-sm py-2 px-4 w-full rounded-lg"
                outlineClassName="w-full"
                onClick={() => navigate(ROUTES.USER.PROFILE_EDIT)}
              />
              <Button
                variant="default"
                text="Share Profile"
                icon={faShareNodes}
                className="text-sm py-2 px-4 rounded-lg w-auto"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden animate-[slideDown_0.3s_ease-out]">
        <div className="relative h-52 w-full overflow-hidden">
          <img
            src={profile?.coverPhotoUrl}
            alt="Cover"
            onClick={() =>
              profile?.coverPhotoUrl && setPreviewSrc(profile.coverPhotoUrl)
            }
            className="w-full h-full object-cover cursor-zoom-in"
          />
          <div className="absolute inset-0 bg-linear-to-t from-white via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="relative -mt-14 px-4 flex items-end justify-between">
          <img
            src={profile?.profilePicUrl}
            alt={profile?.name ?? "Profile"}
            onClick={() =>
              profile?.profilePicUrl && setPreviewSrc(profile.profilePicUrl)
            }
            className="h-[88px] w-[88px] rounded-full object-cover ring-[3px] ring-white shadow-md cursor-zoom-in"
          />

          <div className="flex items-center gap-2 mt-5">
            <Button
              variant="outline"
              text="Edit"
              icon={faPen}
              className="text-xs py-[5.2px] px-3 rounded-full w-auto"
              outlineClassName="w-auto rounded-full"
              onClick={() => navigate(ROUTES.USER.PROFILE_EDIT)}
            />
            <Button
              variant="default"
              text="Share"
              icon={faShareNodes}
              className="text-xs py-1.5 px-3 rounded-full w-auto"
            />
          </div>
        </div>

        <div className="px-4 mt-3">
          <h1 className="text-[22px] font-bold text-gray-900 leading-snug">
            {profile?.name}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5 font-normal">
            @{profile?.username}
          </p>
        </div>

        {profile?.bio && (
          <p className="px-4 mt-2.5 text-[14px] text-gray-600 leading-relaxed">
            {profile.bio}
          </p>
        )}

        {profile?.country && (
          <div className="px-4 mt-2 flex items-center gap-1.5 text-[13px] text-gray-500">
            <FontAwesomeIcon
              icon={faLocationDot}
              className="text-rose-400 text-[11px]"
            />
            {profile.country}
          </div>
        )}

        <div className="px-4 mt-4 flex items-center gap-6">
          {[
            { value: "570", label: "Followers" },
            { value: "120", label: "Following" },
            { value: "42", label: "Posts" },
          ].map(({ value, label }) => (
            <button
              key={label}
              className="flex flex-col items-start active:opacity-60 transition-opacity"
            >
              <span className="text-[17px] font-bold text-gray-900 leading-none">
                {value}
              </span>
              <span className="text-[12px] text-gray-500 mt-0.5">{label}</span>
            </button>
          ))}
        </div>

        <div className="mx-4 mt-5 border-t border-gray-100" />

        {(interests.length > 0 || preferredTrip) && (
          <div className="px-4 mt-4 pb-4">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Interests
            </p>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <span
                  key={interest.label}
                  className={`inline-flex items-center gap-1.5 text-[13px] font-medium capitalize rounded-full px-3.5 py-1.5 bg-gray-100 ${interest.color}`}
                >
                  <FontAwesomeIcon
                    icon={interest.icon as IconDefinition}
                    className="text-[11px]"
                  />
                  {interest.label}
                </span>
              ))}
              {preferredTrip && (
                <span
                  className={`inline-flex items-center gap-1.5 text-[13px] font-medium capitalize rounded-full px-3.5 py-1.5 bg-gray-100 ${preferredTrip.color}`}
                >
                  <FontAwesomeIcon
                    icon={preferredTrip.icon as IconDefinition}
                    className="text-[11px]"
                  />
                  {preferredTrip.label}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mx-4 mt-4 lg:mt-6 lg:max-w-4xl lg:mx-auto animate-[slideDown_0.3s_ease-out]">
        <div className="rounded-2xl border border-gray-200 bg-gray-100/40 py-5">
          <div className="grid grid-cols-3 divide-x divide-gray-200">
            <div className="flex flex-col items-center gap-1.5 px-4 py-1">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-sky-100">
                <FontAwesomeIcon
                  icon={faEarthAmericas}
                  className="text-sky-500 text-base"
                />
              </div>
              <span className="text-xl font-bold text-gray-900 leading-none">
                12
              </span>
              <span className="text-[11px] text-gray-500 font-medium text-center leading-tight">
                Countries
                <br />
                Explored
              </span>
            </div>

            <div className="flex flex-col items-center gap-1.5 px-4 py-1">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-rose-100">
                <FontAwesomeIcon
                  icon={faMapPin}
                  className="text-rose-500 text-base"
                />
              </div>
              <span className="text-xl font-bold text-gray-900 leading-none">
                84
              </span>
              <span className="text-[11px] text-gray-500 font-medium text-center leading-tight">
                Places
                <br />
                Visited
              </span>
            </div>

            <div className="flex flex-col items-center gap-1.5 px-4 py-1">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-violet-100">
                <FontAwesomeIcon
                  icon={faEye}
                  className="text-violet-500 text-base"
                />
              </div>
              <span className="text-xl font-bold text-gray-900 leading-none">
                24.3k
              </span>
              <span className="text-[11px] text-gray-500 font-medium text-center leading-tight">
                Total
                <br />
                Impressions
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 lg:mt-6 lg:max-w-4xl lg:mx-auto">
        <Tabs
          tabs={[
            {
              label: "Vaults",
              route: ROUTES.USER.PROFILE_VAULTS,
              icon: <FontAwesomeIcon icon={faImages} />,
            },
            {
              label: "Tagged",
              route: ROUTES.USER.PROFILE_TAGGED,
              icon: <FontAwesomeIcon icon={faTag} />,
            },
          ]}
        />
      </div>

      <Outlet />

      <ImagePreviewModal
        src={previewSrc ?? undefined}
        isOpen={!!previewSrc}
        onClose={() => setPreviewSrc(null)}
      />
    </div>
  );
};

export default Profile;
