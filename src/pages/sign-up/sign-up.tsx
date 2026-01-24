import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../../components/ui/button";
import Input from "../../components/ui/input";
import Password from "../../components/ui/password";
import { faApple, faGoogle } from "@fortawesome/free-brands-svg-icons";
import {
  faCamera,
  faCloudArrowUp,
  faCompass,
  faImages,
  faMapLocationDot,
  faRoute,
} from "@fortawesome/free-solid-svg-icons";

const SignUp = () => {
  return (
    <div className="flex items-center justify-center h-full w-full relative">
      <div className="flex z-1 bg-white flex-col gap-4 w-lg p-5 border border-gray-200 rounded-lg shadow-lg animate-[slideDown_0.3s_ease-out]">
        <p className="text-3xl leading-10 font-semibold gradient-text w-fit mx-auto">
          Sign Up
        </p>
        <p className="text-lg text-center font-semibold text-gray-600">
          Share places, save memories, explore the world
        </p>
        <Input placeholder="Enter Your Email" label="Email" />
        <Password placeholder="Enter Your Password" label="Password" />
        <Password
          placeholder="Confirm Your Password"
          label="Confirm Password"
        />
        <Button
          text="Create Account"
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
            className="w-full"
          />
          <Button
            text="Apple"
            loading={false}
            disabled={false}
            icon={faApple}
            variant="outline"
            className="w-full"
          />
        </div>
      </div>
      <FontAwesomeIcon
        icon={faCamera}
        className="absolute top-5 left-2 text-7xl text-orange-100 animate-[slideRight_0.5s_ease-in-out]"
      />
      <FontAwesomeIcon
        icon={faRoute}
        className="absolute top-20 right-2 text-9xl text-gray-200 animate-[slideLeft_0.5s_ease-in-out]"
      />
      <FontAwesomeIcon
        icon={faCompass}
        className="absolute bottom-20 left-20 text-9xl text-blue-200 animate-[slideRight_0.5s_ease-in-out]"
      />
      <FontAwesomeIcon
        icon={faImages}
        className="absolute top-48 left-32 text-9xl text-purple-200 animate-[slideDown_0.5s_ease-in-out]"
      />
      <FontAwesomeIcon
        icon={faCloudArrowUp}
        className="absolute right-36 top-64 text-9xl text-green-200 animate-[slideLeft_0.5s_ease-in-out]"
      />
      <FontAwesomeIcon
        icon={faMapLocationDot}
        className="absolute bottom-20 right-0 text-7xl text-red-100 animate-[slideTop_0.5s_ease-in-out]"
      />
    </div>
  );
};

export default SignUp;
