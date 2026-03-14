export const userKeys = {
  all: () => ["userKeys"],
  createProfile: () => [...userKeys.all(), "createProfile"],
  getProfile: () => [...userKeys.all(), "getProfile"],
  updateProfile: () => [...userKeys.all(), "updateProfile"],
  getPublicProfile: (id: string) => [...userKeys.all(), "publicProfile", id],
  follow: (id: string) => [...userKeys.all(), "follow", id],
  unfollow: (id: string) => [...userKeys.all(), "unfollow", id],
};
