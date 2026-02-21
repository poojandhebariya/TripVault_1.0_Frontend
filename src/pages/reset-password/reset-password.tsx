import Button from "../../components/ui/button";
import {
  faMountainCity,
  faSailboat,
  faSnowflake,
  faBusAlt,
  faDirections,
  faPlaneArrival,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Password from "../../components/ui/password";
import Input from "../../components/ui/input";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "react-snackify";
import { authMutation } from "../../tanstack/auth/mutation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { ROUTES } from "../../utils/constants";

interface FormData {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

const ResetPassword = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const email = searchParams.get("email");
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    mode: "onChange",
  });

  const { resetPasswordMutation, forgotPasswordMutation } = authMutation();
  const { mutateAsync: resetPasswordMutate, isPending: resetPasswordPending } =
    useMutation(resetPasswordMutation);
  const {
    mutateAsync: forgotPasswordMutate,
    isPending: forgotPasswordPending,
  } = useMutation(forgotPasswordMutation);

  const handleSubmitResetPassword = async (data: FormData) => {
    await resetPasswordMutate({
      ...data,
      email: email!,
    });
    showSnackbar({
      message: "Password reset successfully",
      variant: "success",
      classname: "text-white",
    });
    navigate(ROUTES.AUTH.SIGN_IN);
  };

  const handleResendCode = async () => {
    await forgotPasswordMutate({ email: email! });
    showSnackbar({
      message: "Code sent successfully",
      variant: "success",
      classname: "text-white",
    });
  };

  return (
    <div className="flex items-center justify-center md:h-full h-auto w-full relative">
      <div className="flex z-1 bg-white flex-col gap-4 w-lg p-5 md:border border-gray-200 rounded-lg md:shadow-lg animate-[slideDown_0.3s_ease-out]">
        <p className="text-3xl leading-10 font-semibold gradient-text w-fit mx-auto">
          Reset Password
        </p>
        <p className="text-lg text-center font-semibold text-gray-600">
          Enter your new password and confirm it
        </p>
        <form
          onSubmit={handleSubmit(handleSubmitResetPassword)}
          className="flex flex-col gap-4"
        >
          <Input
            placeholder="XXXXXX"
            label="Code"
            maxLength={6}
            {...register("code", {
              required: "Code is required",
              pattern: {
                value: /^[0-9]{6}$/,
                message: "Invalid code",
              },
            })}
            error={errors.code?.message}
            disabled={resetPasswordPending}
          />
          <Password
            placeholder="Enter Your New Password"
            label="New Password"
            {...register("newPassword", {
              required: "New password is required",
              pattern: {
                value:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, // At least 8 characters, including uppercase, lowercase, number, and special character
                message: "Invalid password",
              },
            })}
            error={errors.newPassword?.message}
            disabled={resetPasswordPending}
          />
          <Password
            placeholder="Confirm Your New Password"
            label="Confirm Password"
            {...register("confirmPassword", {
              required: "Confirm password is required",
              validate: (value) =>
                value === getValues("newPassword") || "Passwords do not match",
            })}
            error={errors.confirmPassword?.message}
            disabled={resetPasswordPending}
          />
          <Button
            text="Reset Password"
            loading={resetPasswordPending}
            disabled={resetPasswordPending}
            className="mt-4"
          />
        </form>
        <Button
          text="Resend Code"
          loading={forgotPasswordPending}
          disabled={resetPasswordPending}
          variant="outline"
          onClick={handleResendCode}
        />
      </div>
      <FontAwesomeIcon
        icon={faMountainCity}
        className="absolute top-10 left-20 text-9xl text-emerald-100 animate-[slideRight_0.5s_ease-in-out]"
      />
      <FontAwesomeIcon
        icon={faSailboat}
        className="absolute top-10 right-48 text-6xl text-amber-700/20 animate-[slideLeft_0.5s_ease-in-out]"
      />
      <FontAwesomeIcon
        icon={faSnowflake}
        className="absolute bottom-10 left-48 text-9xl text-blue-200 animate-[slideRight_0.5s_ease-in-out]"
      />
      <FontAwesomeIcon
        icon={faBusAlt}
        className="absolute top-80 left-40 text-6xl text-lime-100 animate-[slideDown_0.5s_ease-in-out]"
      />
      <FontAwesomeIcon
        icon={faDirections}
        className="absolute right-10 top-56 text-9xl text-teal-100 animate-[slideLeft_0.5s_ease-in-out]"
      />
      <FontAwesomeIcon
        icon={faPlaneArrival}
        className="absolute bottom-20 right-0 text-9xl text-zinc-200 animate-[slideTop_0.5s_ease-in-out]"
      />
    </div>
  );
};

export default ResetPassword;
