import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

const AppLayout = () => (
  <div className="flex min-h-screen">
    <AppSidebar />
    <main className="ml-64 flex-1 p-6 lg:p-8">
      <Outlet />
    </main>
  </div>
);

export default AppLayout;
