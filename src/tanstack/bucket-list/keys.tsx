export const bucketListKeys = {
  all: () => ["bucket-list"],
  list: (page: number, sortBy: string, sortDir: string) => [
    ...bucketListKeys.all(),
    "list",
    page,
    sortBy,
    sortDir,
  ],
  stats: () => [...bucketListKeys.all(), "stats"],
  add: (vaultId: string) => [...bucketListKeys.all(), "add", vaultId],
  remove: (id: number) => [...bucketListKeys.all(), "remove", id],
};