export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
  address?: { country?: string; country_code?: string };
}

export interface LocationResult {
  placeId: number;
  name: string;
  shortName: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  type: string;
}
