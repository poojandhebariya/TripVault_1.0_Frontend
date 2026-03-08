import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faGlobe,
  faMapLocationDot,
  faSuitcaseRolling,
  faUsers,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { vaultQueries } from "../tanstack/vault/queries";
import { ROUTES } from "../utils/constants";
import Button from "./ui/button";

interface Props {
  name: string;
  countriesVisited: string[];
  placesVisited: string[];
}

const TravelStats = ({ name, countriesVisited, placesVisited }: Props) => {
  const navigate = useNavigate();
  const { getMyVaults } = vaultQueries();
  const { data: myVaults, isLoading } = useQuery(getMyVaults());

  const vaultCount = myVaults?.length || 0;

  const stats = [
    { icon: faGlobe, label: "Countries", value: countriesVisited.length },
    { icon: faMapLocationDot, label: "Places", value: placesVisited.length },
    { icon: faSuitcaseRolling, label: "Vaults", value: vaultCount },
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

      {!isLoading && vaultCount === 0 ? (
        <div className="mt-4 text-center">
          <Button
            text="Add your first Vault"
            icon={faPlus}
            onClick={() => navigate(ROUTES.VAULT.CREATE_VAULT)}
            className="w-full"
          />
        </div>
      ) : (
        <p className="text-center text-white/60 text-xs mt-3 font-medium italic">
          Keep exploring, {name?.split(" ")[0] ?? "traveller"}! ✈️
        </p>
      )}
    </div>
  );
};

export default TravelStats;
