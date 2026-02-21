import { useState } from "react";
import ProfileSetupStep1 from "./steps/profile-setup-step-1";
import ProfileSetupStep2 from "./steps/profile-setup-step-2";
import ProfileSetupStep3 from "./steps/profile-setup-step-3";
import { useNavigate } from "react-router-dom";
import { userMutation } from "../../tanstack/auth/user/mutation";
import { useMutation } from "@tanstack/react-query";
import { PreferredTripType } from "../types/preferred-trip-type";

import type { User } from "../types/user";
import { useSnackbar } from "react-snackify";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState<Partial<User>>({
    name: "",
    username: "",
    bio: "",
    country: "",
    interests: [],
    preferredTripType: PreferredTripType.SOLO,
  });
  const { profileMutation } = userMutation();
  const { mutateAsync: profileMutate } = useMutation(profileMutation);

  const handleProfileSubmit = async () => {
    await profileMutate(profileData);
    showSnackbar({
      message: "Profile created successfully",
      variant: "success",
    });
    navigate("/");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 justify-center items-center lg:h-full h-auto">
      <div className="flex lg:flex-col gap-5 w-full lg:w-auto pt-5 lg:pt-0 px-5 lg:px-0">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="w-full lg:w-auto">
            <p
              className={`h-2 lg:h-20 lg:w-2 ${index + 1 <= step ? "bg-blue-500" : "bg-gray-200"} cursor-pointer`}
              onClick={() => setStep(index + 1)}
            ></p>
          </div>
        ))}
      </div>
      <div className="w-full lg:w-auto">
        {step === 1 && (
          <ProfileSetupStep1
            onNext={() => setStep(2)}
            profileData={profileData}
            setProfileData={setProfileData}
          />
        )}
        {step === 2 && (
          <ProfileSetupStep2
            onNext={() => setStep(3)}
            profileData={profileData}
            setProfileData={setProfileData}
          />
        )}
        {step === 3 && (
          <ProfileSetupStep3
            onNext={handleProfileSubmit}
            // profileData={profileData}
            // setProfileData={setProfileData}
          />
        )}
      </div>
    </div>
  );
};

export default ProfileSetup;
