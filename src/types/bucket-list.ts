import type { Vault } from "./vault";

export interface BucketListStats {
  totalPlaces: number;
  highPriority: number;
  countries: number;
}

export interface BucketList {
  id: number;
  // Vault-based (null for place-based items)
  vaultId?: string;
  vault?: Vault;
  // Place-based (null for vault-based items)
  placeId?: string;
  placeName?: string;
  placeLocation?: string;
  placeCountry?: string;
  placeCountryCode?: string;
  placeImage?: string;
  placeLat?: number;
  placeLng?: number;
  placeType?: string;
  placeEmoji?: string;
  // Common
  targetYear: number;
  priority: string;
  createdAt: string;
}

export interface BucketListRequestDto {
  targetYear: number;
  priority: string; // "HIGH" | "MEDIUM" | "LOW"
}

export interface PlaceBucketListRequestDto {
  targetYear: number;
  priority: string; // "HIGH" | "MEDIUM" | "LOW"
  placeId: string;
  placeName: string;
  placeLocation?: string;
  placeCountry?: string;
  placeCountryCode?: string;
  placeImage?: string;
  placeLat?: number;
  placeLng?: number;
  placeType?: string;
  placeEmoji?: string;
}
