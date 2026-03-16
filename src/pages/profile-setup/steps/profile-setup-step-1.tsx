import { useForm, FormProvider } from "react-hook-form";
import Button from "../../../components/ui/button";
import Input from "../../../components/ui/input";
import type { User } from "../../../types/user";
import profileSetupStep1Image from "/images/profile_setup_1.png";
import CountryDropdown from "../../../components/ui/country-dropdown";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "../../../tanstack/user/queries";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

const ProfileSetupStep1 = ({
  onNext,
  profileData,
  setProfileData,
}: {
  onNext: () => void;
  profileData: Partial<User>;
  setProfileData: (data: Partial<User>) => void;
}) => {
  const methods = useForm<Partial<User>>({
    defaultValues: profileData,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = methods;

  // Debounced username for availability check
  const usernameValue = watch("username") || "";
  const [debouncedUsername, setDebouncedUsername] = useState(usernameValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsername(usernameValue);
    }, 500);
    return () => clearTimeout(timer);
  }, [usernameValue]);

  const { checkUsername } = userQueries();
  const {
    data: usernameCheck,
    isFetching: checkingUsername,
    isError: checkError,
  } = useQuery({
    ...checkUsername(debouncedUsername),
    enabled: debouncedUsername.length >= 3,
    retry: false,
  });

  const onSubmit = (data: Partial<User>) => {
    // Block submit if username is taken
    if (usernameCheck && !usernameCheck.available) return;
    setProfileData({ ...profileData, ...data });
    onNext();
  };

  // Determine username indicator
  const showIndicator = debouncedUsername.length >= 3;
  const isAvailable = usernameCheck?.available === true;
  const isTaken =
    !checkingUsername && !checkError && usernameCheck?.available === false;

  return (
    <FormProvider {...methods}>
      <div className="w-full lg:w-4xl flex lg:border border-gray-200 rounded-lg lg:shadow-lg animate-[slideDown_0.3s_ease-out]">
        <div className="w-full lg:w-1/2 flex flex-col gap-4 p-5">
          <div className="py-2">
            <p className="text-2xl font-semibold gradient-text w-fit mx-auto">
              Tell us about yourself
            </p>
            <p className="text-lg text-center font-semibold text-gray-500">
              Let's setup your profile!
            </p>
          </div>

          <Input
            placeholder="Enter Your Name"
            label="Name"
            {...register("name", {
              required: "Name is required",
            })}
            error={errors.name?.message}
          />

          {/* Username field with availability indicator */}
          <div className="flex flex-col gap-2 w-full">
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <div className="relative flex items-center">
              <input
                placeholder="Enter Your Username"
                {...register("username", {
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message:
                      "Username can only contain letters, numbers, and underscores",
                  },
                })}
                className={`px-2 py-3 w-full border rounded-md focus:outline-none focus:ring transition-all duration-300 ease-in-out pr-10 ${
                  isTaken || errors.username
                    ? "border-red-500 focus:ring-red-200"
                    : isAvailable
                      ? "border-green-500 focus:ring-green-200"
                      : "border-gray-300 focus:ring-blue-700"
                }`}
              />
              {/* Status icon */}
              {showIndicator && (
                <div className="absolute right-3 inset-y-0 flex items-center pointer-events-none">
                  {checkingUsername ? (
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="text-gray-400 animate-spin"
                    />
                  ) : isAvailable ? (
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-green-500"
                    />
                  ) : isTaken ? (
                    <FontAwesomeIcon
                      icon={faTimesCircle}
                      className="text-red-500"
                    />
                  ) : null}
                </div>
              )}
            </div>
            {/* Error messages */}
            {errors.username && (
              <p className="text-xs text-red-500 font-medium">
                {errors.username.message}
              </p>
            )}
            {!errors.username && showIndicator && !checkingUsername && (
              <p
                className={`text-xs font-medium ${
                  isAvailable ? "text-green-600" : isTaken ? "text-red-500" : ""
                }`}
              >
                {isAvailable
                  ? `${debouncedUsername} is available ✓`
                  : isTaken
                    ? `${debouncedUsername} is already taken`
                    : ""}
              </p>
            )}
          </div>

          <Input
            placeholder="Enter Your Bio"
            label="Bio"
            {...register("bio", {
              required: "Bio is required",
            })}
            error={errors.bio?.message}
          />

          <CountryDropdown
            name="country"
            label="Country"
            placeholder="Select a country"
            error={errors.country?.message}
          />

          <Button
            text="Next"
            loading={false}
            disabled={isTaken || checkingUsername}
            className="mt-2"
            onClick={handleSubmit(onSubmit)}
          />
        </div>

        <div className="w-1/2 hidden lg:block">
          <img
            src={profileSetupStep1Image}
            className="w-full h-full object-cover rounded-r-lg"
          />
        </div>
      </div>
    </FormProvider>
  );
};

export default ProfileSetupStep1;
