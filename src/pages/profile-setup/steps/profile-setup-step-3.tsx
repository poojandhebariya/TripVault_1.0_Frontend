import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Button from "../../../components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faImage,
  faUser,
  faSpinner,
  faCheckCircle,
  faCloudArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import {
  useImageUpload,
  ImageCropModal,
  PROFILE_PIC_CONFIG,
  COVER_PHOTO_CONFIG,
} from "../../../utils/image-upload";
import { mediaMutation } from "../../../tanstack/media/mutation";

export interface ProfileImageUrls {
  coverPhotoUrl: string | null;
  profilePicUrl: string | null;
}

const ProfileSetupStep3 = ({
  onNext,
}: {
  onNext: (imageUrls: ProfileImageUrls) => void;
}) => {
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
      console.error("[ProfileSetupStep3] Cover photo upload failed:", err);
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
      console.error("[ProfileSetupStep3] Profile pic upload failed:", err);
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const isBusy =
    coverUpload.isProcessing ||
    profileUpload.isProcessing ||
    isUploadingCover ||
    isUploadingProfile;

  const handleSubmit = () => {
    onNext({ coverPhotoUrl, profilePicUrl });
  };

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

      <div className="w-full lg:w-4xl flex flex-col items-center justify-center lg:border border-gray-200 rounded-lg lg:shadow-lg animate-[slideDown_0.3s_ease-out] bg-white overflow-hidden">
        <div className="py-6 w-full px-5 text-center">
          <p className="text-2xl font-semibold gradient-text w-fit mx-auto">
            Let's setup your appearance!
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Upload your cover photo and profile picture to make your profile
            stand out.
          </p>
        </div>

        <div className="w-full px-5 py-10">
          <div className="relative w-full mb-20 rounded-xl overflow-visible">
            <div
              className={`
                relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden cursor-pointer group
                border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all
                ${!coverUpload.previewUrl ? "flex items-center justify-center" : ""}
              `}
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
                <div className="flex flex-col items-center gap-2 text-blue-500">
                  <FontAwesomeIcon icon={faSpinner} spin className="text-3xl" />
                  <span className="text-sm font-medium">Compressing…</span>
                </div>
              ) : isUploadingCover ? (
                <div className="flex flex-col items-center gap-2 text-indigo-500">
                  <FontAwesomeIcon
                    icon={faCloudArrowUp}
                    className="text-3xl animate-bounce"
                  />
                  <span className="text-sm font-medium">Uploading…</span>
                </div>
              ) : coverUpload.previewUrl ? (
                <>
                  <img
                    src={coverUpload.previewUrl}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      <FontAwesomeIcon icon={faCamera} /> Change Cover
                    </div>
                  </div>
                  {coverPhotoUrl && (
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-green-500 text-white text-xs px-2.5 py-1 rounded-full shadow font-medium pointer-events-none select-none">
                      <FontAwesomeIcon icon={faCheckCircle} />
                      Uploaded
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
                    16:5 ratio · auto-compressed
                  </span>
                </div>
              )}
            </div>

            <div className="absolute -bottom-14 left-8">
              <div
                className="relative w-32 h-32 rounded-full border-4 border-white bg-gray-200 cursor-pointer group shadow-md"
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
                ) : profileUpload.previewUrl ? (
                  <>
                    <img
                      src={profileUpload.previewUrl}
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
                  <div className="absolute bottom-1 right-1 bg-white text-gray-600 p-2 rounded-full shadow-md w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <FontAwesomeIcon icon={faCamera} className="text-xs" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 px-1 items-center">
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
                <FontAwesomeIcon icon={faCheckCircle} /> Profile pic uploaded
              </span>
            )}
          </div>
        </div>

        <div className="pb-8 flex flex-col items-center gap-2 w-full px-5">
          <Button
            text="Save & Continue"
            loading={isBusy}
            disabled={isBusy}
            className="w-48"
            onClick={handleSubmit}
          />
          <button
            onClick={handleSubmit}
            disabled={isBusy}
            className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            Skip for now
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfileSetupStep3;
