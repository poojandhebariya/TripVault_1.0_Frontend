/**
 * Shared password validation rules used across:
 *  - Sign Up
 *  - Reset Password
 *  - Change Password (security panel)
 *
 * Login intentionally does NOT use these rules — it should never
 * reject a password based on format; let the server verify the hash.
 */

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const PASSWORD_RULES = {
  required: "Password is required",
  minLength: {
    value: 8,
    message: "Password must be at least 8 characters",
  },
  pattern: {
    value: PASSWORD_REGEX,
    message:
      "Must contain uppercase, lowercase, a number, and a special character (@$!%*?&)",
  },
} as const;

export const CONFIRM_PASSWORD_RULES = (getPassword: () => string) =>
  ({
    required: "Please confirm your password",
    validate: (value: string) =>
      value === getPassword() || "Passwords do not match",
  }) as const;

/** Validate a raw password string imperatively (for non–react-hook-form use). */
export function validatePassword(value: string): string | null {
  if (!value) return "Password is required";
  if (value.length < 8) return "Password must be at least 8 characters";
  if (!PASSWORD_REGEX.test(value))
    return "Must contain uppercase, lowercase, a number, and a special character (@$!%*?&)";
  return null;
}
