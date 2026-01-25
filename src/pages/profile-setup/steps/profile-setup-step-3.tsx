import { useState, useRef } from "react";
import Button from "../../../components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faImage, faUser } from "@fortawesome/free-solid-svg-icons";

const ProfileSetupStep3 = ({ onNext }: { onNext: () => void }) => {
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setImage: (url: string | null) => void,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  return (
    <div className="w-4xl flex flex-col items-center justify-center border border-gray-200 rounded-lg shadow-lg animate-[slideDown_0.3s_ease-out] bg-white overflow-hidden">
      <div className="py-6 w-full px-5 text-center">
        <p className="text-2xl font-semibold gradient-text w-fit mx-auto">
          Let's setup your appearance!
        </p>
        <p className="text-gray-500 text-sm mt-1">
          Upload your cover photo and profile picture to make your profile stand
          out.
        </p>
      </div>

      <div className="w-full px-5 py-10">
        <div className="relative w-full mb-16 rounded-xl overflow-visible">
          <div
            className={`
              relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden cursor-pointer group border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all
              ${!coverPhoto ? "flex items-center justify-center" : ""}
            `}
            onClick={() => coverInputRef.current?.click()}
          >
            <input
              type="file"
              ref={coverInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, setCoverPhoto)}
            />

            {coverPhoto ? (
              <>
                <img
                  src={coverPhoto}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <FontAwesomeIcon icon={faCamera} /> Change Cover
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-blue-500 transition-colors">
                <FontAwesomeIcon icon={faImage} className="text-3xl" />
                <span className="font-semibold text-sm">
                  Upload Cover Photo
                </span>
              </div>
            )}
          </div>

          <div className="absolute -bottom-12 left-8">
            <div
              className="relative w-32 h-32 rounded-full border-4 border-white bg-gray-200 cursor-pointer group shadow-md"
              onClick={() => profileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={profileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setProfilePic)}
              />

              {profilePic ? (
                <>
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <FontAwesomeIcon icon={faCamera} />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                  <FontAwesomeIcon icon={faUser} className="text-3xl" />
                </div>
              )}

              <div className="absolute bottom-1 right-1 bg-white text-gray-600 p-2 rounded-full shadow-md w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <FontAwesomeIcon icon={faCamera} className="text-xs" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-8">
        <Button
          text="Save & Continue"
          loading={false}
          disabled={false}
          className="w-40"
          onClick={onNext}
        />
      </div>
    </div>
  );
};

export default ProfileSetupStep3;
