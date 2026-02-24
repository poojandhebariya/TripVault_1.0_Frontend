import Logo from "/TripVault.png";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../utils/constants";
import { useUserContext } from "../contexts/user/user";
import Button from "./ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faList,
  faPlus,
  faXmark,
  faHeart,
  faMap,
  faCog,
  faSignOut,
  faSignIn,
  faUserPlus,
  faUser,
  faBell,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import useIsMobile from "../hooks/isMobile";
import { useState, useRef, useEffect } from "react";
import { userQueries } from "../tanstack/auth/user/queries";
import { useQuery } from "@tanstack/react-query";

const NOTIFICATION_COUNT = 3;

const NonloggedInNavigation = [
  { label: "Explore", href: ROUTES.EXPLORE },
  { label: "Sign In", href: ROUTES.AUTH.SIGN_IN },
  { label: "Sign Up", href: ROUTES.AUTH.SIGN_UP },
];

const LoggedInNavigation = [
  { label: "Explore", href: ROUTES.EXPLORE },
  { label: "Plan Trip", href: ROUTES.PLAN_TRIP },
];

const LoggedInProfileNavigation = [
  { label: "My Profile", href: ROUTES.USER.PROFILE, icon: faUser },
  { label: "Bucket List", href: ROUTES.PLAN_TRIP, icon: faList },
  { label: "Saved", href: ROUTES.EXPLORE, icon: faHeart },
  { label: "Map", href: ROUTES.EXPLORE, icon: faMap },
  { label: "Settings", href: ROUTES.EXPLORE, icon: faCog },
  { label: "Logout", href: ROUTES.EXPLORE, icon: faSignOut },
];

const LoggedInMobileNavigation = [
  { label: "Bucket List", href: ROUTES.PLAN_TRIP, icon: faList },
  { label: "Saved", href: ROUTES.EXPLORE, icon: faHeart },
  { label: "Map", href: ROUTES.EXPLORE, icon: faMap },
  { label: "Settings", href: ROUTES.EXPLORE, icon: faCog },
  { label: "Logout", href: ROUTES.EXPLORE, icon: faSignOut },
];

const NonloggedInMobileNavigation = [
  { label: "Sign In", href: ROUTES.AUTH.SIGN_IN, icon: faSignIn },
  { label: "Sign Up", href: ROUTES.AUTH.SIGN_UP, icon: faUserPlus },
];

const Header = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isLoggedIn, clearUser } = useUserContext();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const { getProfile } = userQueries();
  const { data: profileData } = useQuery({
    ...getProfile(),
    enabled: isLoggedIn,
  });

  const handleLogout = async () => {
    localStorage.clear();
    await clearUser();
    setProfileOpen(false);
    setMenuOpen(false);
    navigate(ROUTES.AUTH.SIGN_IN, { replace: true });
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="py-4 border-b border-gray-200 shadow-sm px-5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <img
          src={Logo}
          alt="TripVault"
          className="h-12 cursor-pointer"
          onClick={() => navigate(ROUTES.HOME, { replace: true })}
        />

        {!isMobile ? (
          <div className="flex items-center gap-5 md:gap-8">
            {isLoggedIn && (
              <Button
                className="w-fit py-2 px-4"
                onClick={() => navigate(ROUTES.VAULT.CREATE_VAULT)}
                icon={faPlus}
                text="Create"
              />
            )}

            {[isLoggedIn ? LoggedInNavigation : NonloggedInNavigation]
              .flat()
              .map((item) => {
                const isActive = item.href === window.location.pathname;
                return (
                  <div
                    key={item.label}
                    className="relative cursor-pointer group"
                    onClick={() => navigate(item.href, { replace: true })}
                  >
                    <p
                      className={`font-medium text-gray-500 group-hover:text-gray-900 transition-colors duration-300 ${isActive && "text-gray-900"}`}
                    >
                      {item.label}
                    </p>
                    <span
                      className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ease-out"
                      style={{
                        background:
                          "linear-gradient(to right, #0219b3, #7d0299)",
                      }}
                    />
                  </div>
                );
              })}

            <button
              id="header-search-btn"
              onClick={() => navigate(ROUTES.SEARCH)}
              className="w-9 h-9 rounded-full cursor-pointer flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 active:scale-95"
              title="Search"
            >
              <FontAwesomeIcon icon={faSearch} />
            </button>

            {isLoggedIn && (
              <>
                <button
                  id="header-notification-btn"
                  className="relative w-9 h-9 rounded-full cursor-pointer flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 active:scale-95"
                  title="Notifications"
                >
                  <FontAwesomeIcon icon={faBell} />
                  {NOTIFICATION_COUNT > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-md"
                      style={{
                        background: "linear-gradient(135deg, #0219b3, #7d0299)",
                      }}
                    >
                      {NOTIFICATION_COUNT > 9 ? "9+" : NOTIFICATION_COUNT}
                    </span>
                  )}
                </button>

                <div ref={profileRef} className="relative">
                  <button
                    id="header-profile-btn"
                    onClick={() => setProfileOpen((prev) => !prev)}
                    className={`w-9 h-9 rounded-full cursor-pointer flex items-center justify-center text-gray-600 transition-all duration-200 active:scale-95 border-2 ${
                      profileOpen
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-200 bg-gray-50 hover:border-gray-400"
                    }`}
                    title="Profile"
                  >
                    {profileData?.profilePicUrl ? (
                      <img
                        src={profileData?.profilePicUrl}
                        alt="Profile"
                        className="w-8.5 h-8.5 rounded-full aspect-square"
                      />
                    ) : (
                      <FontAwesomeIcon icon={faUser} />
                    )}
                  </button>

                  <div
                    className={`absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden transition-all duration-200 origin-top-right ${
                      profileOpen
                        ? "opacity-100 scale-100 pointer-events-auto"
                        : "opacity-0 scale-95 pointer-events-none"
                    }`}
                  >
                    <div
                      className="h-1 w-full"
                      style={{
                        background:
                          "linear-gradient(to right, #0219b3, #7d0299)",
                      }}
                    />
                    <div className="py-2">
                      {isLoggedIn
                        ? LoggedInProfileNavigation.map((item) => (
                            <button
                              key={item.label}
                              onClick={() => {
                                if (item.label === "Logout") {
                                  handleLogout();
                                } else {
                                  navigate(item.href, { replace: true });
                                  setProfileOpen(false);
                                }
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-150 text-left cursor-pointer ${
                                item.label === "Logout"
                                  ? "text-red-500 hover:bg-red-50"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <FontAwesomeIcon
                                icon={item.icon}
                                className={`w-4 ${item.label === "Logout" ? "text-red-400" : "text-gray-400"}`}
                              />
                              {item.label}
                            </button>
                          ))
                        : NonloggedInMobileNavigation.map((item) => (
                            <button
                              key={item.label}
                              onClick={() => {
                                navigate(item.href, { replace: true });
                                setProfileOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150 text-left"
                            >
                              <FontAwesomeIcon
                                icon={item.icon}
                                className="w-4 text-gray-400"
                              />
                              {item.label}
                            </button>
                          ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              id="header-search-btn-mobile"
              onClick={() => navigate(ROUTES.SEARCH)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all duration-200 active:scale-95"
              title="Search"
            >
              <FontAwesomeIcon icon={faSearch} />
            </button>

            {isLoggedIn && (
              <button
                id="header-notification-btn-mobile"
                className="relative w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all duration-200 active:scale-95"
                title="Notifications"
              >
                <FontAwesomeIcon icon={faBell} />
                {NOTIFICATION_COUNT > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-md"
                    style={{
                      background: "linear-gradient(135deg, #0219b3, #7d0299)",
                    }}
                  >
                    {NOTIFICATION_COUNT > 9 ? "9+" : NOTIFICATION_COUNT}
                  </span>
                )}
              </button>
            )}

            <div
              className="p-1.5 px-2 rounded-md border-2 border-gray-300 text-gray-500 transition-all duration-200 active:scale-95 cursor-pointer"
              onClick={() => setMenuOpen(true)}
            >
              <FontAwesomeIcon icon={faBars} />
            </div>

            <div
              className={`fixed inset-0 z-50 bg-white/80 backdrop-blur-md transition-all duration-500 ease-in-out ${
                menuOpen
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <div
                className={`flex flex-col h-full p-6 transition-transform duration-500 ease-in-out ${
                  menuOpen ? "translate-y-0" : "-translate-y-10"
                }`}
              >
                <div className="flex justify-between items-center mb-10">
                  <img
                    src={Logo}
                    alt="TripVault"
                    className="h-10 cursor-pointer"
                    onClick={() => {
                      navigate(ROUTES.HOME, { replace: true });
                      setMenuOpen(false);
                    }}
                  />
                  <div
                    className="p-2 rounded-full bg-gray-100 text-gray-600 active:bg-gray-200 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <FontAwesomeIcon icon={faXmark} className="text-xl" />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {[
                    isLoggedIn
                      ? LoggedInMobileNavigation
                      : NonloggedInMobileNavigation,
                  ]
                    .flat()
                    .map((item, index) => {
                      const isActive = item.href === window.location.pathname;
                      return (
                        <div
                          key={item.label}
                          className={`p-4 rounded-xl transition-all duration-300 flex items-center justify-between ${
                            isActive
                              ? "bg-blue-50 text-blue-900 border border-blue-200"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }`}
                          style={{ transitionDelay: `${index * 50}ms` }}
                          onClick={() => {
                            if (item.label === "Logout") {
                              handleLogout();
                            } else {
                              navigate(item.href, { replace: true });
                              setMenuOpen(false);
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <FontAwesomeIcon icon={item.icon} />
                            <span className="text-lg font-semibold">
                              {item.label}
                            </span>
                          </div>
                          <div
                            className={`w-2 h-2 rounded-full ${
                              isActive ? "bg-blue-600" : "bg-transparent"
                            }`}
                          />
                        </div>
                      );
                    })}

                  {isLoggedIn && (
                    <Button
                      className="mt-4 py-4 text-lg font-bold shadow-lg"
                      onClick={() => {
                        navigate(ROUTES.VAULT.CREATE_VAULT);
                        setMenuOpen(false);
                      }}
                      icon={faPlus}
                      text="Create New Vault"
                    />
                  )}
                </div>

                <div className="mt-auto pb-10 text-center">
                  <p className="text-gray-400 text-sm font-medium italic">
                    Unlock your next adventure
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
