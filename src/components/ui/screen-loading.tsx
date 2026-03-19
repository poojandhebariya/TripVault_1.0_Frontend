import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOut, faSpinner, faUserCircle } from "@fortawesome/free-solid-svg-icons";

interface ScreenLoadingProps {
  title?: string;
  subtitle?: string;
  type?: "logout" | "profile" | "generic";
}

const ScreenLoading = ({ 
  title, 
  subtitle, 
  type = "generic" 
}: ScreenLoadingProps) => {
  const config = {
    logout: {
      icon: faSignOut,
      defaultTitle: "Signing you out...",
      defaultSubtitle: "Clearing your secure vault session",
    },
    profile: {
      icon: faUserCircle,
      defaultTitle: "Loading your profile...",
      defaultSubtitle: "Preparing your travel memories",
    },
    generic: {
      icon: faSpinner,
      defaultTitle: "One moment please...",
      defaultSubtitle: "We're setting things up for you",
    }
  };

  const active = config[type];

  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-white/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative">
        {/* Outer spinning ring */}
        <div className="w-20 h-20 rounded-full border-4 border-gray-100 border-t-purple-600 animate-spin" />
        
        {/* Inner static icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <FontAwesomeIcon 
            icon={active.icon} 
            className={`text-purple-600 text-xl ${type === 'generic' ? 'animate-pulse' : ''}`} 
          />
        </div>
      </div>

      <h2 className="mt-6 text-xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
        {title || active.defaultTitle}
      </h2>
      
      <p className="mt-2 text-gray-400 font-medium text-sm">
        {subtitle || active.defaultSubtitle}
      </p>
    </div>
  );
};

export default ScreenLoading;
