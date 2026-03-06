import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

const AppLayout = () => (
  <div className="flex min-h-screen bg-background">
    <AppSidebar />
    <main className="flex-1 lg:ml-56 p-4 sm:p-6 lg:p-8 pt-14 lg:pt-6">
      <div className="mx-auto max-w-7xl">
        <Outlet />
      </div>
    </main>
  </div>
);

export default AppLayout;
