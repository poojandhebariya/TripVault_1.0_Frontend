export const authKeys = {
  all: () => ["authKeys"],
  login: () => [...authKeys.all(), "login"],
  signUp: () => [...authKeys.all(), "signUp"],
  forgotPassword: () => [...authKeys.all(), "forgotPassword"],
  resetPassword: () => [...authKeys.all(), "resetPassword"],
};
