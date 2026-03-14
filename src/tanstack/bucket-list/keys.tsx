export const bucketListKeys = {
    list: (page: number, sortBy: string, sortDir: string) => ["bucket-list", page, sortBy, sortDir],
    stats: () => ["bucket-list-stats"],
}