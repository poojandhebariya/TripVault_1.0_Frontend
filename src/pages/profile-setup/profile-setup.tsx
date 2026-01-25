import { useState } from "react";
import ProfileSetupStep1 from "./steps/profile-setup-step-1";
import ProfileSetupStep2 from "./steps/profile-setup-step-2";
import ProfileSetupStep3 from "./steps/profile-setup-step-3";

const ProfileSetup = () => {
  const [step, setStep] = useState(1);

  return (
    <div className="flex gap-5 justify-center items-center h-full">
      <div className="flex flex-col gap-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index}>
            <p
              className={`h-20 w-2 ${index + 1 <= step ? "bg-blue-500" : "bg-gray-200"} cursor-pointer`}
              onClick={() => setStep(index + 1)}
            ></p>
          </div>
        ))}
      </div>
      <div>
        {step === 1 && <ProfileSetupStep1 onNext={() => setStep(2)} />}
        {step === 2 && <ProfileSetupStep2 onNext={() => setStep(3)} />}
        {step === 3 && <ProfileSetupStep3 onNext={() => setStep(4)} />}
      </div>
    </div>
  );
};

export default ProfileSetup;
