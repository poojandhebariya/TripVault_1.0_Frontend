import { PreferredTripType } from "./preferred-trip-type";

export interface User {
  id: string;
  name: string;
  username: string;
  bio: string;
  country: string;
  interests: string[];
  preferredTripType: PreferredTripType;
}
