export const userKeys = {
  all: () => ["userKeys"],
  createProfile: () => [...userKeys.all(), "createProfile"],
  getProfile: () => [...userKeys.all(), "getProfile"],
  updateProfile: () => [...userKeys.all(), "updateProfile"],
};
