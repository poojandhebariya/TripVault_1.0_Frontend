import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationArrow } from "@fortawesome/free-solid-svg-icons";
import type { PermissionState } from "../hooks/useGeolocation";

interface LocationBannerProps {
  onRequest: () => void;
  state: PermissionState;
}

export default function LocationBanner({
  onRequest,
  state,
}: LocationBannerProps) {
  const isDenied = state === "denied";
  const isDisabled = state === "disabled";

  return (
    <div className="mx-4 lg:mx-0 mb-4 mt-4 lg:mt-0 p-4 rounded-3xl bg-linear-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100/50 flex items-center gap-4 backdrop-blur-md shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-100">
        <FontAwesomeIcon
          icon={faLocationArrow}
          className="text-white text-lg"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold text-gray-900 leading-tight">
          {isDenied
            ? "Permission Required"
            : isDisabled
              ? "GPS is Turned Off"
              : "Discover Nearby"}
        </p>
        <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">
          {isDenied
            ? "Please enable location in your device settings."
            : isDisabled
              ? "Swipe down and turn on your device's Location/GPS toggle."
              : "Allow access to explore vaults and travellers near you!"}
        </p>
      </div>
      {!isDenied && (
        <button
          onClick={onRequest}
          className="shrink-0 px-5 py-2.5 bg-gray-900 text-white text-[12px] font-extrabold rounded-2xl shadow-md hover:bg-black transition-all cursor-pointer active:scale-95"
        >
          {isDisabled ? "Try Again" : "Allow"}
        </button>
      )}
    </div>
  );
}
