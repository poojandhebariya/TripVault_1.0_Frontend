import Header from "../components/header";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="max-w-7xl w-full mx-auto overflow-y-auto h-[calc(100vh-80.8px)] p-5 md:p-0">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
