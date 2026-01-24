import Logo from "/TripVault.png";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const NonloggedInNavigation = [
    { label: "Sign In", href: "/sign-in" },
    { label: "Sign Up", href: "/sign-up" },
  ];

  return (
    <div className="py-4 border-b border-gray-200 shadow-sm px-5 md:px-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <img
          src={Logo}
          alt="TripVault"
          className="h-12 cursor-pointer"
          onClick={() => navigate("/", { replace: true })}
        />
        <div className="flex items-center gap-5 md:gap-8">
          {NonloggedInNavigation.map((item) => {
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
                    background: "linear-gradient(to right, #0219b3, #7d0299)",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Header;
