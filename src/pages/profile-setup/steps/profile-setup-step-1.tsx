import Button from "../../../components/ui/button";
import Input from "../../../components/ui/input";
import profileSetupStep1Image from "/images/profile_setup_1.png";

const ProfileSetupStep1 = ({ onNext }: { onNext: () => void }) => {
  return (
    <div className="w-4xl flex border border-gray-200 rounded-lg shadow-lg animate-[slideDown_0.3s_ease-out]">
      <div className="w-1/2 flex flex-col gap-4 p-5">
        <div className="py-2">
          <p className="text-2xl font-semibold gradient-text w-fit mx-auto">
            Tell us about yourself
          </p>
          <p className="text-lg text-center font-semibold text-gray-500">
            Let's setup your profile!
          </p>
        </div>
        <Input placeholder="Enter Your Name" label="Name" />
        <Input placeholder="Enter Your Username" label="Username" />
        <Input placeholder="Enter Your Bio" label="Bio" />
        <Input placeholder="Country" label="Country" />
        <Button
          text="Next"
          loading={false}
          disabled={false}
          className="mt-2"
          onClick={onNext}
        />
      </div>
      <div className="w-1/2">
        <img
          src={profileSetupStep1Image}
          className="w-full h-full object-cover rounded-r-lg"
        />
      </div>
    </div>
  );
};

export default ProfileSetupStep1;
