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
