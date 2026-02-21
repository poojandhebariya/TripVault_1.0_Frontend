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
import { useForm } from "react-hook-form";
import { authMutation } from "../../tanstack/auth/mutation";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../utils/constants";
import { useSnackbar } from "react-snackify";

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

const SignUp = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const { signUpMutation } = authMutation();
  const { mutateAsync: signUpMutate, isPending: signUpPending } =
    useMutation(signUpMutation);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    await signUpMutate(data);
    showSnackbar({
      message: "Account created successfully",
      variant: "success",
      classname: "text-white",
    });
    navigate(ROUTES.USER.PROFILE_SETUP);
  };

  return (
    <div className="flex items-center justify-center md:h-full h-auto w-full relative">
      <div className="flex z-1 bg-white flex-col gap-4 w-lg p-5 md:border border-gray-200 rounded-lg md:shadow-lg animate-[slideDown_0.3s_ease-out]">
        <p className="text-3xl leading-10 font-semibold gradient-text w-fit mx-auto">
          Sign Up
        </p>
        <p className="text-lg text-center font-semibold text-gray-600">
          Share places, save memories, explore the world
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            placeholder="Enter Your Email"
            label="Email"
            disabled={signUpPending}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            error={errors.email?.message}
          />
          <Password
            placeholder="Enter Your Password"
            label="Password"
            disabled={signUpPending}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
              pattern: {
                value:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message:
                  "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
              },
            })}
            error={errors.password?.message}
          />
          <Password
            placeholder="Confirm Your Password"
            label="Confirm Password"
            disabled={signUpPending}
            {...register("confirmPassword", {
              required: "Confirm Password is required",
              minLength: {
                value: 8,
                message: "Confirm Password must be at least 8 characters",
              },
              pattern: {
                value:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message:
                  "Confirm Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
              },
              validate: (value) =>
                value === getValues("password") || "Passwords do not match",
            })}
            error={errors.confirmPassword?.message}
          />
          <Button
            text="Create Account"
            loading={signUpPending}
            disabled={signUpPending}
            className="mt-2"
            type="submit"
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
        </form>
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
