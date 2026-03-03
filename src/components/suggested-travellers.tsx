import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faGlobe, faUsers } from "@fortawesome/free-solid-svg-icons";
import Button from "./ui/button";

const TRAVELLERS = [
  { name: "Aryan Kapoor", username: "aryan_wanders", country: "India" },
  { name: "Mia Laurent", username: "mia_explores", country: "France" },
  { name: "Kenji Tanaka", username: "kenji_travels", country: "Japan" },
];

const SuggestedTravellers = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
        <FontAwesomeIcon icon={faUsers} className="text-white text-xs" />
      </div>
      <h3 className="text-sm font-bold text-gray-900">Suggested Travellers</h3>
    </div>

    <div className="space-y-3">
      {TRAVELLERS.map((t) => (
        <div key={t.username} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faUser} className="text-white text-xs" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {t.name}
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
              <FontAwesomeIcon
                icon={faGlobe}
                className="text-[10px] shrink-0"
              />
              {t.country}
            </p>
          </div>
          <Button
            text="Follow"
            variant="outline"
            className="text-xs font-semibold px-3 py-1 rounded-full shrink-0"
            outlineClassName="rounded-full"
          />
        </div>
      ))}
    </div>
  </div>
);

export default SuggestedTravellers;
