export interface TripActivity {
  name: string;
  description: string;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  duration?: string; // e.g. "2 hours"
  history?: string; // historical/cultural context
  tip?: string; // visitor tip
  mustSee?: boolean;
  entryFee?: string;
}

export interface TripDay {
  day: number;
  theme: string; // e.g. "History & Monuments"
  highlights?: string[]; // e.g. ["Heritage", "Royal"]
  activities: TripActivity[];
  meal?: string; // recommended local food
}

export interface TripPlan {
  destination: string;
  days: TripDay[];
  estimatedBudget?: string;
  bestSeason?: string;
  pace?: string; // "Relaxed" | "Moderate" | "Intensive"
  travelTips?: string[];
}
