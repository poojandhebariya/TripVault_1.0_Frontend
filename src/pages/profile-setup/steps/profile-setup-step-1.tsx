import { useForm } from "react-hook-form";
import Button from "../../../components/ui/button";
import Input from "../../../components/ui/input";
import type { User } from "../../types/user";
import profileSetupStep1Image from "/images/profile_setup_1.png";

const ProfileSetupStep1 = ({
  onNext,
  profileData,
  setProfileData,
}: {
  onNext: () => void;
  profileData: Partial<User>;
  setProfileData: (data: Partial<User>) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Partial<User>>({
    defaultValues: profileData,
  });

  const onSubmit = (data: Partial<User>) => {
    setProfileData({ ...profileData, ...data });
    onNext();
  };

  return (
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
        <Input
          placeholder="Enter Your Username"
          label="Username"
          {...register("username", {
            required: "Username is required",
          })}
          error={errors.username?.message}
        />
        <Input
          placeholder="Enter Your Bio"
          label="Bio"
          {...register("bio", {
            required: "Bio is required",
          })}
          error={errors.bio?.message}
        />
        <Input
          placeholder="Country"
          label="Country"
          {...register("country", {
            required: "Country is required",
          })}
          error={errors.country?.message}
        />
        <Button
          text="Next"
          loading={false}
          disabled={false}
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
  );
};

export default ProfileSetupStep1;
