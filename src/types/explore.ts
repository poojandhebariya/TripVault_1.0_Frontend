import { EXPLORE_TABS } from "../data/explore/constants";

export type TabName = (typeof EXPLORE_TABS)[number];

export interface PlaceHighlight {
  icon: string;
  label: string;
  desc: string;
}

export interface PlaceOverview {
  about: string;
  highlights: PlaceHighlight[];
  bestTime: string;
  bestTimeSub: string;
  entryFee: string;
  entryFeeSub: string;
  tourDays: string;
  tourDaysSub: string;
  currency: string;
}

export interface Place {
  id: string;
  name: string;
  location: string;
  country: string;
  countryCode: string;
  type: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  gradient: string;
  emoji: string;
  image?: string;
  lat?: number;
  lng?: number;
  overview?: PlaceOverview;
}

export interface CountryDetail {
  code: string;
  name: string;
  emoji: string;
  continent: string;
  gradient: string;
  tagline: string;
  places: Place[];
}

export interface CountryIndex {
  code: string;
  name: string;
  emoji: string;
  continent: string;
  gradient: string;
  tagline: string;
  places_count: number;
}
