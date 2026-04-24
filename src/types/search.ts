export interface SearchItemVault {
  id: string;
  title: string;
  coverImageUrl: string | null;
  locationLabel: string | null;
  authorName: string | null;
  authorUsername: string | null;
  authorProfilePicUrl: string | null;
  likesCount: number;
  impressionsCount: number;
  createdAt: string | null;
}

export interface SearchItemUser {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  country: string | null;
  profilePicUrl: string | null;
  followersCount: number;
  vaultsCount: number;
  isFollowing: boolean;
}

export interface SearchItemLocation {
  label: string;
  vaultCount: number;
  lat: number | null;
  lon: number | null;
}

export interface SearchResult {
  vaults: SearchItemVault[];
  vaultsTotal: number;
  users: SearchItemUser[];
  usersTotal: number;
  locations: SearchItemLocation[];
  locationsTotal: number;
}

export type Tab = "vaults" | "people" | "places";
export type ViewMode = "list" | "grid";
export type SortOption = "relevance" | "popular" | "recent";

export interface VaultFilters {
  sort: SortOption;
  mood: string;
  timeframe: string;
}

export interface PeopleFilters {
  sort: SortOption;
  followingOnly: boolean;
  minFollowers: number;
  tripType: string;
  country: string;
}

export interface PlacesFilters {
  sort: SortOption;
  minVaults: number;
}
