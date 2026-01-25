import { useState } from "react";
import Button from "../../../components/ui/button";
import profileSetupStep2Image from "/images/profile_setup_2.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { clsx } from "clsx";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { interestsData } from "../../../utils/interest-data";
import { tripTypesData } from "../../../utils/trip-type-data";

const ProfileSetupStep2 = ({ onNext }: { onNext: () => void }) => {
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedTripTypes, setSelectedTripTypes] = useState<string>();

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const toggleTripType = (id: string) => {
    setSelectedTripTypes((prev) => (prev === id ? "" : id));
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      onNext();
    }
  };

  return (
    <div className="w-4xl flex border border-gray-200 rounded-lg shadow-lg animate-[slideDown_0.3s_ease-out] bg-white min-h-[520px]">
      <div className="w-1/2 flex flex-col p-8">
        <div className="space-y-2 mb-6">
          <h2 className="text-2xl font-semibold gradient-text w-fit">
            Customise your travel preferences
          </h2>
          <p className="text-gray-500">
            Tell us more about your travel interests!
          </p>
        </div>

        {step === 1 && (
          <div className="flex-1 animate-[slideLeft_0.3s_ease-in-out]">
            <p className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">
              Interests <span className="text-blue-500 lowercase">(max 3)</span>
            </p>
            <div className="flex flex-wrap gap-3">
              {interestsData.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={clsx(
                    "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 cursor-pointer outline-none",
                    selectedInterests.includes(interest.id)
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                    !selectedInterests.includes(interest.id) &&
                      selectedInterests.length >= 3 &&
                      "opacity-50 cursor-not-allowed",
                  )}
                  disabled={
                    !selectedInterests.includes(interest.id) &&
                    selectedInterests.length >= 3
                  }
                >
                  <div
                    className={clsx(
                      "flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm border border-gray-100",
                      interest.color,
                    )}
                  >
                    <FontAwesomeIcon icon={interest.icon} className="text-sm" />
                  </div>
                  <span
                    className={clsx(
                      "text-sm font-medium",
                      selectedInterests.includes(interest.id)
                        ? "text-blue-700"
                        : "text-gray-600",
                    )}
                  >
                    {interest.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="w-full animate-[slideLeft_0.3s_ease-in-out]">
            <p className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">
              Preferred Trip Type
            </p>
            <div className="flex flex-wrap gap-3">
              {tripTypesData.map((tripType) => (
                <button
                  key={tripType.id}
                  onClick={() => toggleTripType(tripType.id)}
                  className={clsx(
                    "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 cursor-pointer outline-none w-full sm:w-auto",
                    selectedTripTypes === tripType.id
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                  )}
                  disabled={selectedTripTypes === tripType.id}
                >
                  <div
                    className={clsx(
                      "flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm border border-gray-100",
                      tripType.color,
                    )}
                  >
                    <FontAwesomeIcon icon={tripType.icon} className="text-sm" />
                  </div>
                  <span
                    className={clsx(
                      "text-sm font-medium",
                      selectedTripTypes === tripType.id
                        ? "text-blue-700"
                        : "text-gray-600",
                    )}
                  >
                    {tripType.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 mt-auto flex gap-2">
          {step === 2 && (
            <Button
              loading={false}
              disabled={false}
              className="w-fit px-2 pl-3"
              variant="outline"
              icon={faArrowLeft}
              onClick={() => setStep(1)}
            />
          )}
          <Button
            text="Next"
            loading={false}
            disabled={
              step === 1 ? selectedInterests.length === 0 : !selectedTripTypes
            }
            className="w-full"
            onClick={handleNext}
          />
        </div>
      </div>
      <div className="w-1/2 relative">
        <img
          src={profileSetupStep2Image}
          alt="Travel interests"
          className="w-full h-full object-cover rounded-r-lg"
        />
        {selectedInterests.map((interest, index) => (
          <div
            key={interest}
            className="absolute transition-all duration-300 ease-out"
            style={{ top: `${28 + index * 13}%`, left: `${14 + index * 12}%` }}
          >
            <div
              className={clsx(
                "flex flex-col items-center gap-1 px-2 py-3 bg-white rounded-md shadow-xl border border-gray-400 animate-[popIn_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)] hover:scale-105 transition-transform",
              )}
            >
              <FontAwesomeIcon
                icon={
                  interestsData.find((item) => item.id === interest)
                    ?.icon as IconProp
                }
                className={clsx(
                  "flex items-center justify-center w-8 h-8 rounded-full bg-gray-50",
                  interestsData.find((item) => item.id === interest)?.color,
                )}
              />
              <span className="text-gray-700 text-xs">
                {interestsData.find((item) => item.id === interest)?.label}
              </span>
            </div>
          </div>
        ))}
        {selectedTripTypes && (
          <div className="absolute transition-all duration-300 ease-out top-72 left-20">
            <div
              className={clsx(
                "flex flex-col items-center gap-1 w-16 px-2 py-3 bg-white rounded-xl shadow-xl border border-gray-400 animate-[popIn_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)] hover:scale-105 transition-transform",
              )}
            >
              <FontAwesomeIcon
                icon={
                  tripTypesData.find((item) => item.id === selectedTripTypes)
                    ?.icon as IconProp
                }
                className={clsx(
                  "flex items-center justify-center w-8 h-8 rounded-full bg-gray-50",
                  tripTypesData.find((item) => item.id === selectedTripTypes)
                    ?.color,
                )}
              />
              <span className="text-gray-700 text-xs">
                {
                  tripTypesData.find((item) => item.id === selectedTripTypes)
                    ?.label
                }
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSetupStep2;
