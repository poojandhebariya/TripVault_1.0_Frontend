import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faCompass,
  faPlus,
  faUser,
  faMapLocation,
} from "@fortawesome/free-solid-svg-icons";
import { ROUTES } from "../utils/constants";
import Header from "../components/header";
import Button from "../components/ui/button";
import BottomNavModal from "../components/ui/bottom-nav-modal";
import { useUserContext } from "../contexts/user/user";
import { LoginPrompt } from "../components/login-prompt-sheet/login-prompt-sheet";

type ModalKey = "profile" | "plan";

const MODAL_ROUTES: Record<string, ModalKey> = {
  "/profile": "profile",
  "/saved": "plan",
};

const MobileLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useUserContext();

  const [activeModal, setActiveModal] = useState<ModalKey | null>(null);

  const bottomNavItems = [
    { icon: faHome, label: "Home", path: ROUTES.HOME },
    { icon: faCompass, label: "Explore", path: ROUTES.EXPLORE },
    {
      icon: faPlus,
      label: "Create",
      path: ROUTES.CREATE_VAULT,
      isCenter: true,
    },
    { icon: faMapLocation, label: "Plan", path: "/saved" },
    { icon: faUser, label: "Profile", path: "/profile" },
  ];

  const handleNavigation = (path: string) => {
    const modalKey = MODAL_ROUTES[path];
    if (modalKey && !isLoggedIn) {
      setActiveModal(modalKey);
    } else {
      navigate(path);
    }
  };

  const closeModal = () => setActiveModal(null);

  return (
    <div className="flex flex-col h-screen">
      <Header />

      <div className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30">
        <div className="flex items-center justify-around px-2 py-2">
          {bottomNavItems.map((item) => {
            const isModalActive =
              activeModal !== null && MODAL_ROUTES[item.path] === activeModal;
            const isRouteActive = location.pathname === item.path;
            const isActive = isModalActive || isRouteActive;

            if (item.isCenter) {
              return (
                <Button
                  key={item.label}
                  // onClick={() => handleNavigation(item.path)}
                  className="relative -mt-12 p-4 px-5 rounded-full w-fit aspect-square flex-shrink-0"
                  icon={item.icon}
                />
              );
            }

            return (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.path)}
                className="flex flex-col items-center justify-center py-2 px-3 min-w-[60px] group active:bounce-click"
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  className={`text-xl mb-1 transition-colors duration-200 ${
                    isActive
                      ? "text-blue-800"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                <span
                  className={`text-xs font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-blue-800"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <BottomNavModal
        isOpen={activeModal === "profile"}
        onClose={closeModal}
        title="Profile"
        icon={faUser}
      >
        <LoginPrompt onClose={closeModal} context="profile" />
      </BottomNavModal>

      <BottomNavModal
        isOpen={activeModal === "plan"}
        onClose={closeModal}
        title="My Plans"
        icon={faMapLocation}
      >
        <LoginPrompt onClose={closeModal} context="plan" />
      </BottomNavModal>
    </div>
  );
};

export default MobileLayout;
