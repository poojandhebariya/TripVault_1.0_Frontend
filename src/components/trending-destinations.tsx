import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire } from "@fortawesome/free-solid-svg-icons";

const DESTINATIONS = [
  { name: "Santorini, Greece", emoji: "🏛️", vaults: 2840 },
  { name: "Bali, Indonesia", emoji: "🌴", vaults: 3120 },
  { name: "Kyoto, Japan", emoji: "⛩️", vaults: 1980 },
  { name: "Amalfi Coast, Italy", emoji: "🍋", vaults: 1540 },
  { name: "Patagonia, Chile", emoji: "🏔️", vaults: 890 },
];

const TrendingDestinations = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shrink-0">
        <FontAwesomeIcon icon={faFire} className="text-white text-xs" />
      </div>
      <h3 className="text-sm font-bold text-gray-900">Trending Destinations</h3>
    </div>

    <div className="space-y-3">
      {DESTINATIONS.map((dest, i) => (
        <div
          key={dest.name}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <span className="text-xl w-8 text-center shrink-0">{dest.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors truncate">
              {dest.name}
            </p>
            <p className="text-xs text-gray-400">
              {dest.vaults.toLocaleString()} vaults
            </p>
          </div>
          <span className="text-xs font-bold text-gray-300 shrink-0">
            #{i + 1}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default TrendingDestinations;
