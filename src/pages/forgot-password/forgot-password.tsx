import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/button";
import Input from "../../components/ui/input";
import {
  faCity,
  faSubway,
  faMapSigns,
  faCloud,
  faCalendar,
  faTreeCity,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ROUTES } from "../../utils/constants";
import { authMutation } from "../../tanstack/auth/mutation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useSnackbar } from "react-snackify";

interface FormData {
  email: string;
}

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    mode: "onChange",
  });
  const { forgotPasswordMutation } = authMutation();
  const {
    mutateAsync: forgotPasswordMutate,
    isPending: forgotPasswordPending,
  } = useMutation(forgotPasswordMutation);

  const handleSubmitForgotPassword = async (data: FormData) => {
    await forgotPasswordMutate(data);
    showSnackbar({ message: "Code sent successfully", variant: "success" });
    navigate(ROUTES.AUTH.RESET_PASSWORD + "?email=" + data.email);
  };

  return (
    <div className="flex items-center justify-center h-full w-full relative">
      <div className="flex z-1 bg-white flex-col gap-4 w-lg p-5 md:border border-gray-200 rounded-lg md:shadow-lg animate-[slideDown_0.3s_ease-out]">
        <p className="text-3xl leading-10 font-semibold gradient-text w-fit mx-auto">
          Forgot Password
        </p>
        <p className="text-lg text-center font-semibold text-gray-600">
          Enter your email address and we'll send you a code to reset your
          password
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
          disabled={forgotPasswordPending}
        />
        <Button
          text="Send Code"
          loading={forgotPasswordPending}
          disabled={forgotPasswordPending}
          className="mt-4"
          onClick={handleSubmit(handleSubmitForgotPassword)}
        />
        <Button
          text="Back to Sign In"
          loading={false}
          disabled={false}
          variant="outline"
          onClick={() => navigate(ROUTES.AUTH.SIGN_IN)}
        />
      </div>
      <FontAwesomeIcon
        icon={faCity}
        className="absolute top-20 left-20 text-8xl text-blue-100 animate-[slideRight_0.5s_ease-in-out]"
      />
      <FontAwesomeIcon
        icon={faSubway}
        className="absolute top-10 right-0 text-8xl text-green-100 animate-[slideLeft_0.5s_ease-in-out]"
      />
      <FontAwesomeIcon
        icon={faMapSigns}
        className="absolute bottom-10 left-40 text-5xl text-gray-200 animate-[slideRight_0.5s_ease-in-out]"
      />
      <FontAwesomeIcon
        icon={faCloud}
        className="absolute top-80 left-40 text-9xl text-indigo-200 animate-[slideDown_0.5s_ease-in-out]"
      />
      <FontAwesomeIcon
        icon={faCalendar}
        className="absolute right-36 top-56 text-8xl text-purple-200 animate-[slideLeft_0.5s_ease-in-out]"
      />
      <FontAwesomeIcon
        icon={faTreeCity}
        className="absolute bottom-10 right-0 text-9xl text-cyan-100 animate-[slideTop_0.5s_ease-in-out]"
      />
    </div>
  );
};

export default ForgotPassword;
