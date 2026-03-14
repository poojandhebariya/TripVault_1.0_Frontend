export interface BucketListStats {
  totalPlaces: number;
  highPriority: number;
  countries: number;
}

export interface BucketListDto {
  id: number;
  vaultId: string;
  vault: import("./vault").Vault;
  targetYear: number;
  priority: string;
  createdAt: string;
}

export interface BucketListRequestDto {
  targetYear: number;
  priority: string; // "HIGH" | "MEDIUM" | "LOW"
}
