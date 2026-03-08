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
  deleteVault: () => [...vaultKeys.all(), "delete"],
  getVaultDetails: (id: string) => [...vaultKeys.all(), "detail", id],
  updateVault: (id: string) => [...vaultKeys.all(), "update", id],
  publishVault: (id: string) => [...vaultKeys.all(), "publish", id],
};
