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
import { useNavigate } from "react-router-dom";
import { authMutation } from "../../tanstack/auth/mutation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { ROUTES } from "../../utils/constants";
import { useSnackbar } from "react-snackify";
import { useUserContext } from "../../contexts/user/user";
import { userQueries } from "../../tanstack/auth/user/queries";

interface FormData {
  email: string;
  password: string;
}

const SignIn = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { loginMutation } = authMutation();
  const { mutateAsync: loginMutate, isPending: loginPending } =
    useMutation(loginMutation);
  const { getProfile } = userQueries();
  const { refetch: refetchUser } = useQuery({
    ...getProfile(),
    enabled: false,
  });
  const { updateUser } = useUserContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    await loginMutate(data);
    showSnackbar({
      message: "Login successful!",
      variant: "success",
      classname: "text-white",
    });
    const { data: profileData } = await refetchUser();
    if (profileData?.data) {
      await updateUser(profileData.data);
    }
    navigate(ROUTES.HOME);
  };

  return (
    <div className="flex items-center overflow-y-auto justify-center md:h-full h-auto w-full relative">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex z-1 bg-white flex-col gap-4 w-lg p-5 md:border border-gray-200 rounded-lg md:shadow-lg animate-[slideDown_0.3s_ease-out]"
      >
        <p className="text-3xl leading-10 font-semibold gradient-text w-fit mx-auto">
          Sign In
        </p>
        <p className="text-lg text-center font-semibold text-gray-600">
          Welcome back! Sign in to access your vault
        </p>
        <Input
          placeholder="Enter Your Email"
          label="Email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
          error={errors.email?.message}
          disabled={loginPending}
        />
        <div className="flex flex-col gap-2">
          <Password
            placeholder="Enter Your Password"
            label="Password"
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
            disabled={loginPending}
          />
          <p
            className="text-sm text-gray-600 cursor-pointer hover:underline gradient-text w-fit self-end"
            onClick={() => navigate(ROUTES.AUTH.FORGOT_PASSWORD)}
          >
            Forgot Password?
          </p>
        </div>
        <Button
          text="Sign In"
          loading={loginPending}
          disabled={loginPending}
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
        <hr className="w-full border border-gray-200 my-2" />
        <p className="text-sm text-gray-600 text-center">
          New to TripVault?{" "}
          <span
            className="gradient-text cursor-pointer hover:underline"
            onClick={() => navigate(ROUTES.AUTH.SIGN_UP)}
          >
            Create account
          </span>
        </p>
      </form>
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
