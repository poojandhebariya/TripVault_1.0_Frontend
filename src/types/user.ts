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
}

export interface PublicProfile
  extends Omit<
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
}
