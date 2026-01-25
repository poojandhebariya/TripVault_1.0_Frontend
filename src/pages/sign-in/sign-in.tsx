import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../../components/ui/button";
import Input from "../../components/ui/input";
import Password from "../../components/ui/password";
import { faApple, faGoogle } from "@fortawesome/free-brands-svg-icons";
import {
  faFolderOpen,
  faGlobe,
  faMapLocation,
  faMountainCity,
  faPlane,
  faSuitcase,
} from "@fortawesome/free-solid-svg-icons";

const SignIn = () => {
  return (
    <div className="flex items-center justify-center h-full w-full relative">
      <div className="flex z-1 bg-white flex-col gap-4 w-lg p-5 border border-gray-200 rounded-lg shadow-lg animate-[slideDown_0.3s_ease-out]">
        <p className="text-3xl leading-10 font-semibold gradient-text w-fit mx-auto">
          Sign In
        </p>
        <p className="text-lg text-center font-semibold text-gray-600">
          Welcome back! Sign in to access your vault
        </p>
        <Input placeholder="Enter Your Email" label="Email" />
        <div className="flex flex-col gap-2">
          <Password placeholder="Enter Your Password" label="Password" />
          <p className="text-sm text-gray-600 cursor-pointer hover:underline gradient-text w-fit self-end">
            Forgot Password?
          </p>
        </div>
        <Button
          text="Sign In"
          loading={false}
          disabled={false}
          className="mt-2"
        />
        <div className="flex items-center gap-2">
          <hr className="w-full border border-gray-200" />
          <p className="text-sm text-gray-600">OR</p>
          <hr className="w-full border border-gray-200" />
        </div>
        <div className="flex gap-4">
          <Button
            text="Google"
            loading={false}
            disabled={false}
            icon={faGoogle}
            variant="outline"
            outlineClassName="w-full"
          />
          <Button
            text="Apple"
            loading={false}
            disabled={false}
            icon={faApple}
            variant="outline"
            outlineClassName="w-full"
          />
        </div>
        <hr className="w-full border border-gray-200 my-2" />
        <p className="text-sm text-gray-600 text-center">
          New to TripVault?{" "}
          <span className="gradient-text cursor-pointer hover:underline">
            Create account
          </span>
        </p>
      </div>
      <FontAwesomeIcon
        icon={faPlane}
        className="absolute top-20 left-20 text-8xl text-blue-100 animate-[slideRight_0.5s_ease-in-out]"
      />
      <FontAwesomeIcon
        icon={faMountainCity}
        className="absolute top-10 right-0 text-8xl text-green-100 animate-[slideLeft_0.5s_ease-in-out]"
      />
      <FontAwesomeIcon
        icon={faSuitcase}
        className="absolute bottom-10 left-40 text-5xl text-gray-200 animate-[slideRight_0.5s_ease-in-out]"
      />
      <FontAwesomeIcon
        icon={faMapLocation}
        className="absolute top-80 left-40 text-9xl text-indigo-200 animate-[slideDown_0.5s_ease-in-out]"
      />
      <FontAwesomeIcon
        icon={faGlobe}
        className="absolute right-36 top-56 text-8xl text-purple-200 animate-[slideLeft_0.5s_ease-in-out]"
      />
      <FontAwesomeIcon
        icon={faFolderOpen}
        className="absolute bottom-10 right-0 text-9xl text-cyan-100 animate-[slideTop_0.5s_ease-in-out]"
      />
    </div>
  );
};

export default SignIn;
