import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCamera,
  faImage,
  faUser,
  faSpinner,
  faCloudArrowUp,
  faCheckCircle,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { clsx } from "clsx";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";

import { userQueries } from "../../tanstack/auth/user/queries";
import { userMutation } from "../../tanstack/auth/user/mutation";
import { mediaMutation } from "../../tanstack/media/mutation";
import { interestsData } from "../../utils/interest-data";
import { tripTypesData } from "../../utils/trip-type-data";
import { ROUTES } from "../../utils/constants";
import { PreferredTripType } from "../types/preferred-trip-type";
import type { User } from "../types/user";
import {
  useImageUpload,
  ImageCropModal,
  PROFILE_PIC_CONFIG,
  COVER_PHOTO_CONFIG,
} from "../../utils/image-upload";
import Button from "../../components/ui/button";
import Input from "../../components/ui/input";
import { useSnackbar } from "react-snackify";

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
    {children}
  </p>
);

const EditProfile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const { getProfile } = userQueries();
  const { data: profile } = useQuery(getProfile());

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Partial<User>>({
    values: {
      name: profile?.name ?? "",
      bio: profile?.bio ?? "",
      country: profile?.country ?? "",
    },
  });

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedTripType, setSelectedTripType] = useState<
    PreferredTripType | undefined
  >(undefined);

  useEffect(() => {
    if (profile?.interests) setSelectedInterests(profile.interests);
    if (profile?.preferredTripType)
      setSelectedTripType(profile.preferredTripType as PreferredTripType);
  }, [profile]);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const coverUpload = useImageUpload(COVER_PHOTO_CONFIG);
  const profileUpload = useImageUpload(PROFILE_PIC_CONFIG);

  const { uploadImageMutation } = mediaMutation();
  const { mutateAsync: uploadImage } = useMutation(uploadImageMutation);

  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);

  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);

  const { updateProfileMutation } = userMutation();
  const { mutateAsync: updateProfile, isPending: isSaving } = useMutation(
    updateProfileMutation,
  );

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const uploadCoverPhoto = async () => {
    if (!coverUpload.processedFile) return;
    setIsUploadingCover(true);
    try {
      const url = await uploadImage({
        file: coverUpload.processedFile,
        context: "cover-photo",
      });
      setCoverPhotoUrl(url);
    } catch (err) {
      console.error("[EditProfile] Cover photo upload failed:", err);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const uploadProfilePic = async () => {
    if (!profileUpload.processedFile) return;
    setIsUploadingProfile(true);
    try {
      const url = await uploadImage({
        file: profileUpload.processedFile,
        context: "profile-pic",
      });
      setProfilePicUrl(url);
    } catch (err) {
      console.error("[EditProfile] Profile pic upload failed:", err);
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const isBusy =
    coverUpload.isProcessing ||
    profileUpload.isProcessing ||
    isUploadingCover ||
    isUploadingProfile ||
    isSaving;

  const onSubmit = async (formData: Partial<User>) => {
    const payload: Partial<User> = {
      ...formData,
      interests: selectedInterests,
      preferredTripType: selectedTripType,
      ...(coverPhotoUrl ? { coverPhotoUrl } : {}),
      ...(profilePicUrl ? { profilePicUrl } : {}),
    };

    await updateProfile(payload);
    showSnackbar({
      message: "Profile updated successfully",
      variant: "success",
    });
    navigate(ROUTES.USER.PROFILE);
  };

  const displayCoverUrl = coverUpload.previewUrl ?? profile?.coverPhotoUrl;
  const displayProfileUrl = profileUpload.previewUrl ?? profile?.profilePicUrl;

  return (
    <>
      <ImageCropModal
        open={coverUpload.isCropOpen}
        imageSrc={coverUpload.cropSrc}
        config={COVER_PHOTO_CONFIG.crop}
        title="Crop Cover Photo"
        description="Drag to reposition · Scroll or pinch to zoom"
        isProcessing={coverUpload.isProcessing}
        onConfirm={coverUpload.onCropConfirm}
        onCancel={coverUpload.onCropCancel}
      />
      <ImageCropModal
        open={profileUpload.isCropOpen}
        imageSrc={profileUpload.cropSrc}
        config={PROFILE_PIC_CONFIG.crop}
        title="Crop Profile Picture"
        description="Drag to reposition · Scroll or pinch to zoom"
        isProcessing={profileUpload.isProcessing}
        onConfirm={profileUpload.onCropConfirm}
        onCancel={profileUpload.onCropCancel}
      />

      <div className="min-h-screen pb-20">
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 block md:hidden">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span className="hidden sm:inline">Back</span>
            </button>
            <h1 className="text-base font-bold text-gray-900">Edit Profile</h1>
            <Button
              text="Save"
              loading={isSaving}
              disabled={isBusy}
              className="py-1.5 px-5 text-sm rounded-full w-auto"
              onClick={handleSubmit(onSubmit)}
            />
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6 animate-[slideDown_0.3s_ease-out]">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div
              className={clsx(
                "relative w-full h-44 bg-gray-100 cursor-pointer group border-b border-gray-200",
                "hover:brightness-95 transition-all",
                !displayCoverUrl &&
                  "flex items-center justify-center border-b-2 border-dashed border-gray-300 hover:border-blue-400",
              )}
              onClick={() => {
                if (!coverUpload.isProcessing && !isUploadingCover)
                  coverInputRef.current?.click();
              }}
            >
              <input
                type="file"
                ref={(el) => {
                  coverInputRef.current = el;
                  (
                    coverUpload.inputRef as React.MutableRefObject<HTMLInputElement | null>
                  ).current = el;
                }}
                className="hidden"
                accept="image/*"
                onChange={coverUpload.onFileSelected}
              />

              {coverUpload.isProcessing ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-blue-500 bg-gray-100">
                  <FontAwesomeIcon icon={faSpinner} spin className="text-3xl" />
                  <span className="text-sm font-medium">Compressing…</span>
                </div>
              ) : isUploadingCover ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-indigo-500 bg-gray-50">
                  <FontAwesomeIcon
                    icon={faCloudArrowUp}
                    className="text-3xl animate-bounce"
                  />
                  <span className="text-sm font-medium">Uploading…</span>
                </div>
              ) : displayCoverUrl ? (
                <>
                  <img
                    src={displayCoverUrl}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      <FontAwesomeIcon icon={faCamera} /> Change Cover
                    </div>
                  </div>
                  {coverPhotoUrl && (
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-green-500 text-white text-xs px-2.5 py-1 rounded-full shadow font-medium pointer-events-none">
                      <FontAwesomeIcon icon={faCheckCircle} /> Uploaded
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-blue-500 transition-colors">
                  <FontAwesomeIcon icon={faImage} className="text-3xl" />
                  <span className="font-semibold text-sm">
                    Upload Cover Photo
                  </span>
                  <span className="text-xs text-gray-300">
                    4:1 ratio · auto-compressed
                  </span>
                </div>
              )}
            </div>

            <div className="px-5 pb-5 pt-0 flex items-end gap-4 -mt-10 relative z-10">
              <div
                className="relative w-24 h-24 rounded-full border-4 border-white bg-gray-200 cursor-pointer group shadow-md shrink-0"
                onClick={() => {
                  if (!profileUpload.isProcessing && !isUploadingProfile)
                    profileInputRef.current?.click();
                }}
              >
                <input
                  type="file"
                  ref={(el) => {
                    profileInputRef.current = el;
                    (
                      profileUpload.inputRef as React.MutableRefObject<HTMLInputElement | null>
                    ).current = el;
                  }}
                  className="hidden"
                  accept="image/*"
                  onChange={profileUpload.onFileSelected}
                />

                {profileUpload.isProcessing ? (
                  <div className="w-full h-full flex items-center justify-center text-blue-500 rounded-full">
                    <FontAwesomeIcon
                      icon={faSpinner}
                      spin
                      className="text-xl"
                    />
                  </div>
                ) : isUploadingProfile ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-indigo-500 rounded-full gap-1">
                    <FontAwesomeIcon
                      icon={faCloudArrowUp}
                      className="text-xl animate-bounce"
                    />
                    <span className="text-[10px] font-medium">Uploading…</span>
                  </div>
                ) : displayProfileUrl ? (
                  <>
                    <img
                      src={displayProfileUrl}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <FontAwesomeIcon icon={faCamera} />
                    </div>
                    {profilePicUrl && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow text-white text-xs">
                        <FontAwesomeIcon icon={faCheckCircle} />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors rounded-full">
                    <FontAwesomeIcon icon={faUser} className="text-3xl" />
                  </div>
                )}

                {!profileUpload.isProcessing && !isUploadingProfile && (
                  <div className="absolute bottom-1 right-1 bg-white text-gray-600 p-1.5 rounded-full shadow-md w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <FontAwesomeIcon icon={faCamera} className="text-xs" />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-10">
                {coverUpload.processedFile && !coverPhotoUrl && (
                  <button
                    onClick={uploadCoverPhoto}
                    disabled={isUploadingCover}
                    className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <FontAwesomeIcon
                      icon={isUploadingCover ? faSpinner : faCloudArrowUp}
                      spin={isUploadingCover}
                    />
                    Upload Cover (
                    {(coverUpload.processedFile.size / 1024).toFixed(0)} KB)
                  </button>
                )}
                {coverPhotoUrl && (
                  <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    <FontAwesomeIcon icon={faCheckCircle} /> Cover uploaded
                  </span>
                )}
                {profileUpload.processedFile && !profilePicUrl && (
                  <button
                    onClick={uploadProfilePic}
                    disabled={isUploadingProfile}
                    className="flex items-center gap-1.5 text-xs bg-purple-600 text-white px-3 py-1.5 rounded-full font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <FontAwesomeIcon
                      icon={isUploadingProfile ? faSpinner : faCloudArrowUp}
                      spin={isUploadingProfile}
                    />
                    Upload Profile Pic (
                    {(profileUpload.processedFile.size / 1024).toFixed(0)} KB)
                  </button>
                )}
                {profilePicUrl && (
                  <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    <FontAwesomeIcon icon={faCheckCircle} /> Profile pic
                    uploaded
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
            <SectionLabel>Basic Info</SectionLabel>

            <Input
              label="Name"
              placeholder="Your display name"
              {...register("name", { required: "Name is required" })}
              error={errors.name?.message}
            />

            <div className="flex flex-col gap-2 w-full">
              <label className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                rows={3}
                placeholder="A short bio about yourself…"
                {...register("bio")}
                className="px-2 py-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-700 transition-all duration-300 ease-in-out resize-none text-sm"
              />
            </div>

            <div className="flex flex-col gap-2 w-full">
              <label className="flex text-sm font-medium text-gray-700 items-center gap-1.5">
                Country
              </label>
              <input
                placeholder="Where are you from?"
                {...register("country")}
                className="px-2 py-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-700 transition-all duration-300 ease-in-out text-sm"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <SectionLabel>
              Interests{" "}
              <span className="normal-case font-normal text-blue-500">
                ({selectedInterests.length}/3 selected)
              </span>
            </SectionLabel>
            <div className="flex flex-wrap gap-2.5">
              {interestsData.map((interest) => {
                const isSelected = selectedInterests.includes(interest.id);
                const isDisabled = !isSelected && selectedInterests.length >= 3;
                return (
                  <button
                    key={interest.id}
                    type="button"
                    onClick={() => toggleInterest(interest.id)}
                    disabled={isDisabled}
                    className={clsx(
                      "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 cursor-pointer outline-none text-sm",
                      isSelected
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                      isDisabled && "opacity-40 cursor-not-allowed",
                    )}
                  >
                    <div
                      className={clsx(
                        "flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm border border-gray-100",
                        interest.color,
                      )}
                    >
                      <FontAwesomeIcon
                        icon={interest.icon as IconProp}
                        className="text-sm"
                      />
                    </div>
                    <span
                      className={clsx(
                        "font-medium",
                        isSelected ? "text-blue-700" : "text-gray-600",
                      )}
                    >
                      {interest.label}
                    </span>
                    {isSelected && (
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-blue-500 text-xs ml-0.5"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <SectionLabel>Preferred Trip Type</SectionLabel>
            <div className="flex flex-wrap gap-2.5">
              {tripTypesData.map((tripType) => {
                const isSelected = selectedTripType === tripType.id;
                return (
                  <button
                    key={tripType.id}
                    type="button"
                    onClick={() =>
                      setSelectedTripType(
                        isSelected
                          ? undefined
                          : (tripType.id as PreferredTripType),
                      )
                    }
                    className={clsx(
                      "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 cursor-pointer outline-none text-sm",
                      isSelected
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                    )}
                  >
                    <div
                      className={clsx(
                        "flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm border border-gray-100",
                        tripType.color,
                      )}
                    >
                      <FontAwesomeIcon
                        icon={tripType.icon as IconProp}
                        className="text-sm"
                      />
                    </div>
                    <span
                      className={clsx(
                        "font-medium",
                        isSelected ? "text-blue-700" : "text-gray-600",
                      )}
                    >
                      {tripType.label}
                    </span>
                    {isSelected && (
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-blue-500 text-xs ml-0.5"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pb-4 hidden md:block">
            <Button
              text="Save Changes"
              loading={isSaving}
              disabled={isBusy}
              className="w-full"
              onClick={handleSubmit(onSubmit)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
