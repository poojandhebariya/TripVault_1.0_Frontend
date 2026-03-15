import TrendingDestinations from "./trending-destinations";
import SuggestedProfilesSidebar from "./suggested-profiles-sidebar";
import TravelStats from "./travel-stats";

interface HomeSidebarProps {
  isLoggedIn: boolean;
  user?: { name: string; countriesVisited?: string[]; placesVisited?: string[] };
}

export default function HomeSidebar({ isLoggedIn, user }: HomeSidebarProps) {
  return (
    <div className="flex flex-col gap-5">
      <TrendingDestinations />
      <SuggestedProfilesSidebar />
      {isLoggedIn && user && (
        <TravelStats
          name={user.name}
          countriesVisited={user.countriesVisited ?? []}
          placesVisited={user.placesVisited ?? []}
        />
      )}
    </div>
  );
}
