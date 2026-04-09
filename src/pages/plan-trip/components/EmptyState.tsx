import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRoute } from "@fortawesome/free-solid-svg-icons";

export const EmptyState = ({ placeName }: { placeName: string }) => {
  return (
    <div className="py-24 text-center px-6">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <FontAwesomeIcon icon={faRoute} className="text-2xl text-gray-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        Ready to explore {placeName}?
      </h3>
      <p className="text-gray-500 max-w-lg mx-auto">
        Select your trip duration above and tap generate to receive a completely
        personalized, day-by-day itinerary built by AI.
      </p>
    </div>
  );
};
