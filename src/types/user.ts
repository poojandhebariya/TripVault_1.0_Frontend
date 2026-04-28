import { PreferredTripType } from "./preferred-trip-type";

export interface User {
  id: string;
  name: string;
  username: string;
  bio: string;
  country: string;
  interests: string[];
  preferredTripType: PreferredTripType;
  coverPhotoUrl?: string;
  profilePicUrl?: string;
  countriesVisited?: string[];
  placesVisited?: string[];
  totalImpressions?: number;
  topCountries?: string[];
  followersCount?: number;
  followingCount?: number;
  vaultsCount?: number;
  privateAccount?: boolean;
  showInSearch?: boolean;
  allowTagging?: boolean;
}

export interface PublicProfile extends Omit<
  User,
  | "countriesVisited"
  | "placesVisited"
  | "totalImpressions"
  | "topCountries"
  | "followersCount"
  | "followingCount"
  | "vaultsCount"
> {
  followersCount: number;
  followingCount: number;
  vaultsCount: number;
  isFollowing: boolean;
  privateAccount?: boolean;
  showInSearch?: boolean;
  allowTagging?: boolean;
  requestPending?: boolean;
  authUserId?: string;
}
