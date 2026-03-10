import Header from "../components/header";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";

const AppLayout = () => {
  const { pathname } = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div
        ref={scrollRef}
        className="max-w-7xl w-full mx-auto overflow-y-auto h-[calc(100vh-80.8px)] p-5 md:p-0"
      >
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
