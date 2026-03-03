import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faGlobe,
  faMapLocationDot,
  faSuitcaseRolling,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

interface Props {
  name: string;
  countriesVisited: string[];
  placesVisited: string[];
}

const TravelStats = ({ name, countriesVisited, placesVisited }: Props) => {
  const stats = [
    { icon: faGlobe, label: "Countries", value: countriesVisited.length },
    { icon: faMapLocationDot, label: "Places", value: placesVisited.length },
    { icon: faSuitcaseRolling, label: "Vaults", value: 0 },
    { icon: faUsers, label: "Followers", value: 0 },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl shadow-sm p-4 text-white">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
          <FontAwesomeIcon icon={faChartLine} className="text-white text-xs" />
        </div>
        <h3 className="text-sm font-bold">Your Travel Stats</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white/15 rounded-xl p-3 text-center">
            <FontAwesomeIcon
              icon={s.icon}
              className="text-white/70 text-sm mb-1"
            />
            <p className="text-xl font-bold leading-none">{s.value}</p>
            <p className="text-white/70 text-[10px] mt-0.5 font-medium">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <p className="text-center text-white/60 text-xs mt-3 font-medium italic">
        Keep exploring, {name?.split(" ")[0] ?? "traveller"}! ✈️
      </p>
    </div>
  );
};

export default TravelStats;
