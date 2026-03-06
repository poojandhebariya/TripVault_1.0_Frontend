export const vaultKeys = {
  all: () => ["vault"],
  create: () => [...vaultKeys.all(), "create"],
  getMyVaults: () => [...vaultKeys.all(), "my-vaults"],
  getPublicVaults: () => [...vaultKeys.all(), "public"],
  getNearbyVaults: (
    lat: number,
    lng: number,
    radius?: number,
    page?: number,
  ) => [...vaultKeys.all(), "nearby", lat, lng, radius ?? 50, page ?? 1],
  togglePin: () => [...vaultKeys.all(), "toggle-pin"],
  incrementView: () => [...vaultKeys.all(), "increment-view"],
};
